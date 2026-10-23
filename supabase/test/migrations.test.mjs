// Applies every migration to an in-memory Postgres (PGlite) with a stub of Supabase's
// auth schema, then checks the access rules. Run with: npm run test:db
import { PGlite } from '@electric-sql/pglite';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

const dir = join(import.meta.dirname, '..', 'migrations');
const U1 = '11111111-1111-1111-1111-111111111111';
const U2 = '22222222-2222-2222-2222-222222222222';

async function setup() {
  const db = new PGlite();
  await db.exec(`
    create schema auth;
    create table auth.users (id uuid primary key);
    create role authenticated;
    create function auth.uid() returns uuid language sql stable
      as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  `);
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.sql')).sort()) {
    await db.exec(readFileSync(join(dir, file), 'utf8'));
  }
  await db.exec(`
    grant usage on schema public, auth to authenticated;
    grant all on all tables in schema public to authenticated;
    grant execute on all functions in schema auth to authenticated;
    insert into auth.users values ('${U1}'), ('${U2}');
  `);
  return db;
}

const as = (db, user) => db.exec(`reset role; set role authenticated; set request.jwt.claim.sub = '${user}';`);
const count = async (db, sql) => (await db.query(`select count(*)::int as n from ${sql}`)).rows[0].n;

test('each new user gets the six default areas', async () => {
  const db = await setup();
  await as(db, U1);
  assert.equal(await count(db, 'public.areas'), 6);
});

test('rows belong to the signed-in user and stay invisible to others', async () => {
  const db = await setup();
  await as(db, U1);
  const { rows } = await db.query(`insert into public.goals (title) values ('Meta') returning user_id`);
  assert.equal(rows[0].user_id, U1);
  await as(db, U2);
  assert.equal(await count(db, 'public.goals'), 0);
  await assert.rejects(db.query(`insert into public.goals (title, user_id) values ('x', '${U1}')`), /row-level security/);
});

test('the activity log cannot be edited or deleted', async () => {
  const db = await setup();
  await as(db, U1);
  await db.query(`insert into public.activity_log (module, action, item_type, item_id) values ('core', 'created', 'goal', gen_random_uuid())`);
  assert.equal((await db.query(`update public.activity_log set summary = 'x' returning id`)).rows.length, 0);
  assert.equal((await db.query(`delete from public.activity_log returning id`)).rows.length, 0);
});

test('updated_at moves on update', async () => {
  const db = await setup();
  await as(db, U1);
  await db.query(`insert into public.tags (name) values ('a')`);
  await db.query(`update public.tags set name = 'b'`);
  assert.equal((await db.query(`select updated_at > created_at as moved from public.tags`)).rows[0].moved, true);
});

test('an item cannot be linked to itself', async () => {
  const db = await setup();
  await as(db, U1);
  await assert.rejects(
    db.query(`insert into public.links (from_type, from_id, to_type, to_id) values ('task', '${U1}', 'task', '${U1}')`),
    /check constraint/,
  );
});
