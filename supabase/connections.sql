create extension if not exists pgcrypto;

create table if not exists public.social_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nombre_conexion text not null,
  plataforma text not null default 'instagram',
  provider_user_id text,
  provider_username text,
  access_token text not null,
  refresh_token text,
  token_expiration timestamptz,
  scopes text[] not null default '{}',
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint social_connections_nombre_not_empty check (length(trim(nombre_conexion)) > 0),
  constraint social_connections_plataforma_check check (plataforma in ('instagram')),
  constraint social_connections_status_check check (status in ('active', 'expired', 'revoked', 'error'))
);

create index if not exists social_connections_user_id_idx
on public.social_connections(user_id);

create index if not exists social_connections_user_platform_idx
on public.social_connections(user_id, plataforma);

create table if not exists public.oauth_states (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null default 'meta',
  state text not null unique,
  redirect_to text,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint oauth_states_provider_check check (provider in ('meta'))
);

create index if not exists oauth_states_user_id_idx
on public.oauth_states(user_id);

create index if not exists oauth_states_state_idx
on public.oauth_states(state);

alter table public.social_connections enable row level security;
alter table public.oauth_states enable row level security;

drop policy if exists "Users can read their own social connections" on public.social_connections;

create policy "Users can read their own social connections"
on public.social_connections
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can read their own oauth states" on public.oauth_states;

create policy "Users can read their own oauth states"
on public.oauth_states
for select
to authenticated
using (auth.uid() = user_id);
