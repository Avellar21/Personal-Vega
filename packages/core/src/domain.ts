export const AREA_KEYS = ['corpo', 'mente', 'patrimonio', 'oficio', 'ritmo', 'lazer'] as const;
export type AreaKey = (typeof AREA_KEYS)[number];

export const DEFAULT_AREAS: ReadonlyArray<{ key: AreaKey; name: string; description: string }> = [
  { key: 'corpo', name: 'Corpo', description: 'Treino, esportes, dieta e saúde' },
  { key: 'mente', name: 'Mente', description: 'Estudos e diário' },
  { key: 'patrimonio', name: 'Patrimônio', description: 'Finanças pessoais' },
  { key: 'oficio', name: 'Ofício', description: 'Empresa' },
  { key: 'ritmo', name: 'Ritmo', description: 'Agenda, hábitos e tarefas' },
  { key: 'lazer', name: 'Lazer', description: 'Hobbies' },
];

export const MODULE_KEYS = [
  'core',
  'agenda',
  'tarefas',
  'diario',
  'financas',
  'empresa',
  'saude',
  'treino',
  'estudos',
  'hobbies',
  'vega',
] as const;
export type ModuleKey = (typeof MODULE_KEYS)[number];

// Anything that can be tagged, linked or logged. Grows as modules land.
export const ITEM_TYPES = [
  'area',
  'goal',
  'tag',
  'link',
  'task',
  'project',
  'habit',
  'event',
  'journal_entry',
  'transaction',
  'workout',
  'meal',
  'study_session',
  'hobby',
] as const;
export type ItemType = (typeof ITEM_TYPES)[number];

export type Actor = 'user' | 'vega';

export interface BaseRow {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Area extends BaseRow {
  key: AreaKey;
  name: string;
  description: string;
  color: string | null;
  position: number;
  gamification_enabled: boolean;
}

export type GoalStatus = 'active' | 'done' | 'dropped';

export interface Goal extends BaseRow {
  title: string;
  area_id: string | null;
  due_on: string | null;
  metric: string | null;
  target_value: number | null;
  current_value: number;
  status: GoalStatus;
}

export interface Tag extends BaseRow {
  name: string;
}

export interface Tagging extends BaseRow {
  tag_id: string;
  item_type: ItemType;
  item_id: string;
}

export interface Link extends BaseRow {
  from_type: ItemType;
  from_id: string;
  to_type: ItemType;
  to_id: string;
  relation: string;
}

export interface ActivityEntry extends BaseRow {
  occurred_at: string;
  module: ModuleKey;
  action: string;
  item_type: ItemType;
  item_id: string;
  area_id: string | null;
  summary: string;
  xp: number;
  actor: Actor;
}

export interface Tables {
  areas: Area;
  goals: Goal;
  tags: Tag;
  taggings: Tagging;
  links: Link;
  activity_log: ActivityEntry;
}
