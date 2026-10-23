-- Núcleo compartilhado: áreas, metas, etiquetas, ligações e registro de atividades.
-- Toda tabela é do usuário logado (RLS por user_id) e usa lixeira (deleted_at).

create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- areas -----------------------------------------------------------------------
create table public.areas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  key text not null check (key in ('corpo', 'mente', 'patrimonio', 'oficio', 'ritmo', 'lazer')),
  name text not null,
  description text not null default '',
  color text check (color ~ '^#[0-9A-Fa-f]{6}$'),
  position smallint not null default 0,
  gamification_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (user_id, key)
);

-- goals -----------------------------------------------------------------------
create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (length(title) between 1 and 200),
  area_id uuid references public.areas (id) on delete set null,
  due_on date,
  metric text,
  target_value numeric check (target_value > 0),
  current_value numeric not null default 0,
  status text not null default 'active' check (status in ('active', 'done', 'dropped')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index goals_user_status_idx on public.goals (user_id, status);

-- tags ------------------------------------------------------------------------
create table public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (length(name) between 1 and 40),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create unique index tags_user_name_idx on public.tags (user_id, lower(name)) where deleted_at is null;

create table public.taggings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  item_type text not null,
  item_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (tag_id, item_type, item_id)
);
create index taggings_item_idx on public.taggings (item_type, item_id);

-- links -----------------------------------------------------------------------
create table public.links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  from_type text not null,
  from_id uuid not null,
  to_type text not null,
  to_id uuid not null,
  relation text not null default 'relacionado',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  check (not (from_type = to_type and from_id = to_id)),
  unique (from_type, from_id, to_type, to_id, relation)
);
create index links_from_idx on public.links (from_type, from_id);
create index links_to_idx on public.links (to_type, to_id);

-- activity_log ----------------------------------------------------------------
create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  occurred_at timestamptz not null default now(),
  module text not null,
  action text not null,
  item_type text not null,
  item_id uuid not null,
  area_id uuid references public.areas (id) on delete set null,
  summary text not null default '',
  xp integer not null default 0 check (xp >= 0),
  actor text not null default 'user' check (actor in ('user', 'vega')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index activity_log_user_time_idx on public.activity_log (user_id, occurred_at desc);

-- updated_at + RLS for every table ---------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array['areas', 'goals', 'tags', 'taggings', 'links', 'activity_log'] loop
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.set_updated_at()',
      t || '_updated_at', t);
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy %I on public.%I for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))',
      t || '_owner', t);
  end loop;
end;
$$;

-- O registro de atividades é só de inclusão: nada de editar o histórico.
drop policy activity_log_owner on public.activity_log;
create policy activity_log_read on public.activity_log for select to authenticated using (user_id = (select auth.uid()));
create policy activity_log_insert on public.activity_log for insert to authenticated with check (user_id = (select auth.uid()));

-- Seis áreas padrão para cada usuário novo --------------------------------------
create or replace function public.seed_default_areas() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.areas (user_id, key, name, description, position) values
    (new.id, 'corpo', 'Corpo', 'Treino, esportes, dieta e saúde', 0),
    (new.id, 'mente', 'Mente', 'Estudos e diário', 1),
    (new.id, 'patrimonio', 'Patrimônio', 'Finanças pessoais', 2),
    (new.id, 'oficio', 'Ofício', 'Empresa', 3),
    (new.id, 'ritmo', 'Ritmo', 'Agenda, hábitos e tarefas', 4),
    (new.id, 'lazer', 'Lazer', 'Hobbies', 5);
  return new;
end;
$$;

create trigger on_auth_user_created_seed_areas
  after insert on auth.users
  for each row execute function public.seed_default_areas();
