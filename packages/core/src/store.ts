import type { BaseRow, Tables } from './domain';

export type TableName = keyof Tables;
export type NewRow<T extends TableName> = Omit<Tables[T], keyof BaseRow>;

export interface ListQuery<T extends TableName> {
  where?: Partial<Tables[T]>;
  orderBy?: keyof Tables[T] & string;
  ascending?: boolean;
  limit?: number;
  includeDeleted?: boolean;
}

/**
 * The only way services touch persistence. The app implements it on top of
 * Supabase; tests use MemoryStore. Rows are always scoped to the signed-in user
 * by the implementation (RLS on Supabase), so services never pass user_id.
 */
export interface Store {
  insert<T extends TableName>(table: T, row: NewRow<T>): Promise<Tables[T]>;
  update<T extends TableName>(table: T, id: string, patch: Partial<NewRow<T>>): Promise<Tables[T]>;
  get<T extends TableName>(table: T, id: string): Promise<Tables[T] | null>;
  list<T extends TableName>(table: T, query?: ListQuery<T>): Promise<Tables[T][]>;
  trash(table: TableName, id: string): Promise<void>;
}

export class MemoryStore implements Store {
  private rows = new Map<TableName, BaseRow[]>();
  private seq = 0;

  constructor(
    private readonly userId = 'user-1',
    private readonly clock: () => Date = () => new Date(),
  ) {}

  async insert<T extends TableName>(table: T, row: NewRow<T>): Promise<Tables[T]> {
    const now = this.clock().toISOString();
    const full = {
      ...row,
      id: `${table}-${++this.seq}`,
      user_id: this.userId,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    } as unknown as Tables[T];
    this.table(table).push(full);
    return { ...full };
  }

  async update<T extends TableName>(table: T, id: string, patch: Partial<NewRow<T>>): Promise<Tables[T]> {
    const row = this.find(table, id);
    if (!row) throw new Error(`${table}/${id} not found`);
    Object.assign(row, patch, { updated_at: this.clock().toISOString() });
    return { ...(row as Tables[T]) };
  }

  async get<T extends TableName>(table: T, id: string): Promise<Tables[T] | null> {
    const row = this.find(table, id);
    return row && !row.deleted_at ? { ...(row as Tables[T]) } : null;
  }

  async list<T extends TableName>(table: T, query: ListQuery<T> = {}): Promise<Tables[T][]> {
    let rows = (this.table(table) as Tables[T][]).filter((r) => query.includeDeleted || !r.deleted_at);
    if (query.where) {
      const entries = Object.entries(query.where);
      rows = rows.filter((r) => entries.every(([k, v]) => (r as unknown as Record<string, unknown>)[k] === v));
    }
    if (query.orderBy) {
      const key = query.orderBy;
      const dir = query.ascending === false ? -1 : 1;
      rows = [...rows].sort((a, b) => (a[key] < b[key] ? -dir : a[key] > b[key] ? dir : 0));
    }
    if (query.limit !== undefined) rows = rows.slice(0, query.limit);
    return rows.map((r) => ({ ...r }));
  }

  async trash(table: TableName, id: string): Promise<void> {
    const row = this.find(table, id);
    if (row) row.deleted_at = this.clock().toISOString();
  }

  private table(name: TableName): BaseRow[] {
    let t = this.rows.get(name);
    if (!t) this.rows.set(name, (t = []));
    return t;
  }

  private find(table: TableName, id: string): BaseRow | undefined {
    return this.table(table).find((r) => r.id === id);
  }
}
