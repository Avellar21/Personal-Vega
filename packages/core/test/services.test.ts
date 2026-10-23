import { beforeEach, describe, expect, it } from 'vitest';
import {
  callService,
  coreServices as s,
  DEFAULT_AREAS,
  MemoryStore,
  ServiceError,
  services,
  toToolDefinitions,
  type ServiceContext,
} from '../src';

let ctx: ServiceContext;

beforeEach(async () => {
  const store = new MemoryStore('user-1', () => new Date('2026-10-23T12:00:00Z'));
  for (const [position, area] of DEFAULT_AREAS.entries()) {
    await store.insert('areas', { ...area, color: null, position, gamification_enabled: true });
  }
  ctx = { store, actor: 'user', now: () => new Date('2026-10-23T12:00:00Z') };
});

describe('callService', () => {
  it('rejects invalid input before touching the store', async () => {
    const err = await callService(s.createGoal, ctx, { title: '' }).catch((e) => e);
    expect(err).toBeInstanceOf(ServiceError);
    expect(err.code).toBe('invalid_input');
    expect(await ctx.store.list('goals')).toHaveLength(0);
  });

  it('records every write in the activity log with its actor', async () => {
    const goal = await callService(s.createGoal, { ...ctx, actor: 'vega' }, { title: '100 horas de estudo' });
    const [entry] = await ctx.store.list('activity_log');
    expect(entry).toMatchObject({
      module: 'core',
      action: 'created',
      item_type: 'goal',
      item_id: goal.id,
      actor: 'vega',
      occurred_at: '2026-10-23T12:00:00.000Z',
    });
  });

  it('does not log reads', async () => {
    await callService(s.listAreas, ctx, {});
    expect(await ctx.store.list('activity_log')).toHaveLength(0);
  });
});

describe('areas', () => {
  it('lists the six default areas in order', async () => {
    const areas = await callService(s.listAreas, ctx, {});
    expect(areas.map((a) => a.key)).toEqual(['corpo', 'mente', 'patrimonio', 'oficio', 'ritmo', 'lazer']);
  });

  it('can turn gamification off for one area', async () => {
    const [corpo] = await callService(s.listAreas, ctx, {});
    const updated = await callService(s.updateArea, ctx, { id: corpo!.id, gamification_enabled: false });
    expect(updated.gamification_enabled).toBe(false);
  });
});

describe('goals', () => {
  it('creates a goal tied to an area and lists it as active', async () => {
    const [mente] = (await callService(s.listAreas, ctx, {})).filter((a) => a.key === 'mente');
    await callService(s.createGoal, ctx, {
      title: '100 horas de estudo',
      area_id: mente!.id,
      due_on: '2026-12-31',
      metric: 'horas',
      target_value: 100,
    });
    const goals = await callService(s.listGoals, ctx, {});
    expect(goals).toHaveLength(1);
    expect(goals[0]).toMatchObject({ area_id: mente!.id, current_value: 0, status: 'active' });
  });

  it('refuses an unknown area', async () => {
    const err = await callService(s.createGoal, ctx, { title: 'x', area_id: 'nope' }).catch((e) => e);
    expect(err.code).toBe('not_found');
  });

  it('rejects a malformed date', async () => {
    const err = await callService(s.createGoal, ctx, { title: 'x', due_on: '31/12/2026' }).catch((e) => e);
    expect(err.code).toBe('invalid_input');
  });

  it('moves a finished goal out of the active list', async () => {
    const goal = await callService(s.createGoal, ctx, { title: 'Supino 100 kg' });
    await callService(s.setGoalStatus, ctx, { id: goal.id, status: 'done' });
    expect(await callService(s.listGoals, ctx, {})).toHaveLength(0);
    expect(await callService(s.listGoals, ctx, { status: 'done' })).toHaveLength(1);
    const actions = (await ctx.store.list('activity_log')).map((e) => e.action);
    expect(actions).toEqual(['created', 'completed']);
  });
});

describe('tags and links', () => {
  it('reuses a tag with the same name, ignoring case', async () => {
    const a = await callService(s.createTag, ctx, { name: 'Urgente' });
    const b = await callService(s.createTag, ctx, { name: 'urgente' });
    expect(b.id).toBe(a.id);
  });

  it('attaches a tag only once', async () => {
    const tag = await callService(s.createTag, ctx, { name: 'cliente-x' });
    const input = { tag_id: tag.id, item_type: 'goal', item_id: 'goals-9' };
    await callService(s.attachTag, ctx, input);
    await callService(s.attachTag, ctx, input);
    expect(await ctx.store.list('taggings')).toHaveLength(1);
  });

  it('finds a link from either side', async () => {
    await callService(s.createLink, ctx, { from_type: 'task', from_id: 't1', to_type: 'goal', to_id: 'g1', relation: 'parte_de' });
    expect(await callService(s.listLinks, ctx, { item_type: 'task', item_id: 't1' })).toHaveLength(1);
    expect(await callService(s.listLinks, ctx, { item_type: 'goal', item_id: 'g1' })).toHaveLength(1);
  });

  it('refuses to link an item to itself', async () => {
    const err = await callService(s.createLink, ctx, { from_type: 'task', from_id: 't1', to_type: 'task', to_id: 't1' }).catch((e) => e);
    expect(err.code).toBe('conflict');
  });
});

describe('tool definitions for Vega', () => {
  it('exposes every service as a tool with a JSON schema', () => {
    const tools = toToolDefinitions(services);
    expect(tools.map((t) => t.name)).toContain('goals_create');
    const goalsCreate = tools.find((t) => t.name === 'goals_create')!;
    expect(goalsCreate.input_schema).toMatchObject({ type: 'object', required: ['title'] });
    for (const tool of tools) expect(tool.name).toMatch(/^[a-zA-Z0-9_-]{1,64}$/);
  });
});
