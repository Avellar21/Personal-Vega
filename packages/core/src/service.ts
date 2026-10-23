import { z } from 'zod';
import type { Actor, ItemType, ModuleKey } from './domain';
import type { Store } from './store';

export interface ServiceContext {
  store: Store;
  actor: Actor;
  now?: () => Date;
}

export interface ActivityDraft {
  action: string;
  item_type: ItemType;
  item_id: string;
  area_id?: string | null;
  summary: string;
  xp?: number;
}

export interface ServiceResult<O> {
  output: O;
  activity?: ActivityDraft;
}

export interface Service<I, O> {
  /** Dotted name, e.g. `goals.create`. Also the basis of Vega's tool name. */
  name: string;
  module: ModuleKey;
  /** Written for Vega: what the service does and when to use it. */
  description: string;
  input: z.ZodType<I>;
  mutates: boolean;
  /** Vega must ask before calling it (deletes, money, bulk changes). */
  needsConfirmation?: boolean;
  run(ctx: ServiceContext, input: I): Promise<ServiceResult<O>>;
}

export type AnyService = Service<any, any>;

export function defineService<I, O>(service: Service<I, O>): Service<I, O> {
  return service;
}

export type ServiceErrorCode = 'invalid_input' | 'not_found' | 'conflict';

export class ServiceError extends Error {
  constructor(
    readonly code: ServiceErrorCode,
    message: string,
    readonly issues?: z.core.$ZodIssue[],
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

/**
 * The single entry point for every read and write, from the UI or from Vega:
 * validates the input, runs the service and records what it did.
 */
export async function callService<I, O>(service: Service<I, O>, ctx: ServiceContext, rawInput: unknown): Promise<O> {
  const parsed = service.input.safeParse(rawInput ?? {});
  if (!parsed.success) {
    throw new ServiceError('invalid_input', `Entrada inválida para ${service.name}`, parsed.error.issues);
  }

  const { output, activity } = await service.run(ctx, parsed.data);

  if (activity) {
    const now = (ctx.now ?? (() => new Date()))();
    await ctx.store.insert('activity_log', {
      occurred_at: now.toISOString(),
      module: service.module,
      action: activity.action,
      item_type: activity.item_type,
      item_id: activity.item_id,
      area_id: activity.area_id ?? null,
      summary: activity.summary,
      xp: activity.xp ?? 0,
      actor: ctx.actor,
    });
  }

  return output;
}

export interface ToolDefinition {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

export const toolName = (serviceName: string) => serviceName.replace(/\./g, '_');

/** Describes services as tools for the Claude API, so Vega can call them. */
export function toToolDefinitions(services: Record<string, AnyService>): ToolDefinition[] {
  return Object.values(services).map((s) => ({
    name: toolName(s.name),
    description: s.needsConfirmation ? `${s.description} Peça confirmação antes de usar.` : s.description,
    input_schema: z.toJSONSchema(s.input) as Record<string, unknown>,
  }));
}
