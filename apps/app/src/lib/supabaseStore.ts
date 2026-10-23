import type { ListQuery, NewRow, Store, TableName, Tables } from '@vega/core';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Store backed by Supabase. RLS scopes every query to the signed-in user. */
export class SupabaseStore implements Store {
  constructor(private readonly client: SupabaseClient) {}

  async insert<T extends TableName>(table: T, row: NewRow<T>): Promise<Tables[T]> {
    const { data, error } = await this.client.from(table).insert(row as never).select().single();
    if (error) throw error;
    return data as Tables[T];
  }

  async update<T extends TableName>(table: T, id: string, patch: Partial<NewRow<T>>): Promise<Tables[T]> {
    const { data, error } = await this.client.from(table).update(patch as never).eq('id', id).select().single();
    if (error) throw error;
    return data as Tables[T];
  }

  async get<T extends TableName>(table: T, id: string): Promise<Tables[T] | null> {
    const { data, error } = await this.client.from(table).select('*').eq('id', id).is('deleted_at', null).maybeSingle();
    if (error) throw error;
    return data as Tables[T] | null;
  }

  async list<T extends TableName>(table: T, query: ListQuery<T> = {}): Promise<Tables[T][]> {
    let q = this.client.from(table).select('*');
    if (!query.includeDeleted) q = q.is('deleted_at', null);
    if (query.where) q = q.match(query.where as Record<string, unknown>);
    if (query.orderBy) q = q.order(query.orderBy, { ascending: query.ascending !== false });
    if (query.limit !== undefined) q = q.limit(query.limit);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []) as Tables[T][];
  }

  async trash(table: TableName, id: string): Promise<void> {
    const { error } = await this.client.from(table).update({ deleted_at: new Date().toISOString() }).eq('id', id);
    if (error) throw error;
  }
}
