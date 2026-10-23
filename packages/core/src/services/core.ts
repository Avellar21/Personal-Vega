import { z } from 'zod';
import { ITEM_TYPES } from '../domain';
import { defineService, ServiceError } from '../service';

const id = z.string().min(1);
const itemType = z.enum(ITEM_TYPES);
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use AAAA-MM-DD');

export const listAreas = defineService({
  name: 'areas.list',
  module: 'core',
  description: 'Lista as seis áreas da vida (Corpo, Mente, Patrimônio, Ofício, Ritmo, Lazer) com seus ids.',
  input: z.object({}),
  mutates: false,
  async run({ store }) {
    return { output: await store.list('areas', { orderBy: 'position' }) };
  },
});

export const updateArea = defineService({
  name: 'areas.update',
  module: 'core',
  description: 'Renomeia uma área, muda sua cor ou liga e desliga a gamificação dela.',
  input: z.object({
    id,
    name: z.string().trim().min(1).max(40).optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable().optional(),
    gamification_enabled: z.boolean().optional(),
  }),
  mutates: true,
  async run({ store }, { id: areaId, ...patch }) {
    if (!(await store.get('areas', areaId))) throw new ServiceError('not_found', 'Área não encontrada');
    const area = await store.update('areas', areaId, patch);
    return {
      output: area,
      activity: { action: 'updated', item_type: 'area', item_id: area.id, area_id: area.id, summary: `Área ${area.name} atualizada` },
    };
  },
});

export const createGoal = defineService({
  name: 'goals.create',
  module: 'core',
  description: 'Cria uma meta, opcionalmente ligada a uma área, com prazo e uma métrica numérica (ex.: 100 horas de estudo).',
  input: z.object({
    title: z.string().trim().min(1).max(200),
    area_id: id.nullable().optional(),
    due_on: isoDate.nullable().optional(),
    metric: z.string().trim().max(60).nullable().optional(),
    target_value: z.number().positive().nullable().optional(),
  }),
  mutates: true,
  async run({ store }, input) {
    if (input.area_id && !(await store.get('areas', input.area_id))) {
      throw new ServiceError('not_found', 'Área não encontrada');
    }
    const goal = await store.insert('goals', {
      title: input.title,
      area_id: input.area_id ?? null,
      due_on: input.due_on ?? null,
      metric: input.metric ?? null,
      target_value: input.target_value ?? null,
      current_value: 0,
      status: 'active',
    });
    return {
      output: goal,
      activity: { action: 'created', item_type: 'goal', item_id: goal.id, area_id: goal.area_id, summary: `Meta criada: ${goal.title}` },
    };
  },
});

export const listGoals = defineService({
  name: 'goals.list',
  module: 'core',
  description: 'Lista metas, por padrão só as ativas.',
  input: z.object({ status: z.enum(['active', 'done', 'dropped']).default('active') }),
  mutates: false,
  async run({ store }, { status }) {
    return { output: await store.list('goals', { where: { status }, orderBy: 'created_at' }) };
  },
});

export const setGoalStatus = defineService({
  name: 'goals.setStatus',
  module: 'core',
  description: 'Marca uma meta como concluída, abandonada ou ativa de novo.',
  input: z.object({ id, status: z.enum(['active', 'done', 'dropped']) }),
  mutates: true,
  async run({ store }, { id: goalId, status }) {
    if (!(await store.get('goals', goalId))) throw new ServiceError('not_found', 'Meta não encontrada');
    const goal = await store.update('goals', goalId, { status });
    const action = status === 'done' ? 'completed' : status === 'dropped' ? 'dropped' : 'reopened';
    return {
      output: goal,
      activity: { action, item_type: 'goal', item_id: goal.id, area_id: goal.area_id, summary: `Meta ${goal.title}: ${status}` },
    };
  },
});

export const createTag = defineService({
  name: 'tags.create',
  module: 'core',
  description: 'Cria uma etiqueta. Se já existir uma com o mesmo nome, devolve a existente.',
  input: z.object({ name: z.string().trim().min(1).max(40) }),
  mutates: true,
  async run({ store }, { name }) {
    const existing = (await store.list('tags')).find((t) => t.name.toLowerCase() === name.toLowerCase());
    if (existing) return { output: existing };
    const tag = await store.insert('tags', { name });
    return { output: tag, activity: { action: 'created', item_type: 'tag', item_id: tag.id, summary: `Etiqueta criada: ${name}` } };
  },
});

export const attachTag = defineService({
  name: 'tags.attach',
  module: 'core',
  description: 'Aplica uma etiqueta a qualquer item do app.',
  input: z.object({ tag_id: id, item_type: itemType, item_id: id }),
  mutates: true,
  async run({ store }, input) {
    if (!(await store.get('tags', input.tag_id))) throw new ServiceError('not_found', 'Etiqueta não encontrada');
    const existing = await store.list('taggings', { where: input });
    if (existing[0]) return { output: existing[0] };
    return { output: await store.insert('taggings', input) };
  },
});

export const createLink = defineService({
  name: 'links.create',
  module: 'core',
  description:
    'Liga dois itens de quaisquer módulos (ex.: uma tarefa a um cliente, um gasto a um hobby). relation descreve a ligação, como "parte_de" ou "relacionado".',
  input: z.object({
    from_type: itemType,
    from_id: id,
    to_type: itemType,
    to_id: id,
    relation: z.string().trim().min(1).max(40).default('relacionado'),
  }),
  mutates: true,
  async run({ store }, input) {
    if (input.from_type === input.to_type && input.from_id === input.to_id) {
      throw new ServiceError('conflict', 'Um item não pode ser ligado a ele mesmo');
    }
    const existing = await store.list('links', { where: input });
    if (existing[0]) return { output: existing[0] };
    const link = await store.insert('links', input);
    return {
      output: link,
      activity: { action: 'linked', item_type: input.from_type, item_id: input.from_id, summary: `Ligado a ${input.to_type} (${input.relation})` },
    };
  },
});

export const listLinks = defineService({
  name: 'links.listFor',
  module: 'core',
  description: 'Lista tudo que está ligado a um item, nos dois sentidos.',
  input: z.object({ item_type: itemType, item_id: id }),
  mutates: false,
  async run({ store }, { item_type, item_id }) {
    const [outgoing, incoming] = await Promise.all([
      store.list('links', { where: { from_type: item_type, from_id: item_id } }),
      store.list('links', { where: { to_type: item_type, to_id: item_id } }),
    ]);
    return { output: [...outgoing, ...incoming] };
  },
});

export const recentActivity = defineService({
  name: 'activity.recent',
  module: 'core',
  description: 'Mostra as ações mais recentes registradas no app, de você ou da Vega.',
  input: z.object({ limit: z.number().int().min(1).max(100).default(20) }),
  mutates: false,
  async run({ store }, { limit }) {
    return { output: await store.list('activity_log', { orderBy: 'occurred_at', ascending: false, limit }) };
  },
});
