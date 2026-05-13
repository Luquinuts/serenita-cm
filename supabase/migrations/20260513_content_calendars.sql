-- Calendarios de contenido para Serenita CM.
-- Ejecutar en Supabase SQL Editor o como migracion antes de desplegar el frontend.

do $$
begin
  create type public.content_calendar_status as enum ('draft', 'active', 'archived');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.content_item_type as enum ('reel', 'carousel', 'story', 'content_creation');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.content_item_status as enum ('pendiente', 'en_progreso', 'aprobado', 'publicado');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.content_item_priority as enum ('low', 'medium', 'high', 'urgent');
exception
  when duplicate_object then null;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.content_calendars (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  description text,
  month integer not null check (month between 1 and 12),
  year integer not null check (year between 2020 and 2100),
  status public.content_calendar_status not null default 'draft',
  metadata jsonb not null default '{}'::jsonb,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint content_calendars_name_not_blank check (length(trim(name)) > 0),
  constraint content_calendars_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create table if not exists public.content_calendar_items (
  id uuid primary key default gen_random_uuid(),
  calendar_id uuid not null references public.content_calendars(id) on delete cascade,
  scheduled_date date not null,
  content_type public.content_item_type not null,
  title text not null,
  description text,
  objective text,
  status public.content_item_status not null default 'pendiente',
  priority public.content_item_priority not null default 'medium',
  observations text,
  color_tag text,
  position_in_day integer not null default 0 check (position_in_day >= 0),
  metadata jsonb not null default '{}'::jsonb,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint content_calendar_items_title_not_blank check (length(trim(title)) > 0),
  constraint content_calendar_items_color_tag_hex check (color_tag is null or color_tag ~ '^#[0-9A-Fa-f]{6}$'),
  constraint content_calendar_items_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create index if not exists idx_content_calendars_org_period
  on public.content_calendars (organization_id, year, month, status)
  where deleted_at is null;

create index if not exists idx_content_calendars_user_created
  on public.content_calendars (user_id, created_at desc)
  where deleted_at is null;

create index if not exists idx_content_calendar_items_calendar_date
  on public.content_calendar_items (calendar_id, scheduled_date, position_in_day)
  where deleted_at is null;

create index if not exists idx_content_calendar_items_type_status
  on public.content_calendar_items (content_type, status)
  where deleted_at is null;

drop trigger if exists set_content_calendars_updated_at on public.content_calendars;
create trigger set_content_calendars_updated_at
  before update on public.content_calendars
  for each row execute function public.set_updated_at();

drop trigger if exists set_content_calendar_items_updated_at on public.content_calendar_items;
create trigger set_content_calendar_items_updated_at
  before update on public.content_calendar_items
  for each row execute function public.set_updated_at();

alter table public.content_calendars enable row level security;
alter table public.content_calendar_items enable row level security;

drop policy if exists "Members can read content calendars" on public.content_calendars;
create policy "Members can read content calendars"
  on public.content_calendars
  for select
  to authenticated
  using (
    deleted_at is null
    and exists (
      select 1 from public.organization_members om
      where om.organization_id = content_calendars.organization_id
        and om.user_id = (select auth.uid())
    )
  );

drop policy if exists "Members can create content calendars" on public.content_calendars;
create policy "Members can create content calendars"
  on public.content_calendars
  for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.organization_members om
      where om.organization_id = content_calendars.organization_id
        and om.user_id = (select auth.uid())
    )
  );

drop policy if exists "Members can update content calendars" on public.content_calendars;
create policy "Members can update content calendars"
  on public.content_calendars
  for update
  to authenticated
  using (
    exists (
      select 1 from public.organization_members om
      where om.organization_id = content_calendars.organization_id
        and om.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.organization_members om
      where om.organization_id = content_calendars.organization_id
        and om.user_id = (select auth.uid())
    )
  );

drop policy if exists "Members can read content calendar items" on public.content_calendar_items;
create policy "Members can read content calendar items"
  on public.content_calendar_items
  for select
  to authenticated
  using (
    deleted_at is null
    and exists (
      select 1
      from public.content_calendars cc
      join public.organization_members om on om.organization_id = cc.organization_id
      where cc.id = content_calendar_items.calendar_id
        and cc.deleted_at is null
        and om.user_id = (select auth.uid())
    )
  );

drop policy if exists "Members can create content calendar items" on public.content_calendar_items;
create policy "Members can create content calendar items"
  on public.content_calendar_items
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.content_calendars cc
      join public.organization_members om on om.organization_id = cc.organization_id
      where cc.id = content_calendar_items.calendar_id
        and cc.deleted_at is null
        and om.user_id = (select auth.uid())
    )
  );

drop policy if exists "Members can update content calendar items" on public.content_calendar_items;
create policy "Members can update content calendar items"
  on public.content_calendar_items
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.content_calendars cc
      join public.organization_members om on om.organization_id = cc.organization_id
      where cc.id = content_calendar_items.calendar_id
        and cc.deleted_at is null
        and om.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.content_calendars cc
      join public.organization_members om on om.organization_id = cc.organization_id
      where cc.id = content_calendar_items.calendar_id
        and cc.deleted_at is null
        and om.user_id = (select auth.uid())
    )
  );

comment on table public.content_calendars is 'Calendarios mensuales multi-tenant para planificacion editorial.';
comment on table public.content_calendar_items is 'Items planificados dentro de un calendario editorial.';
comment on column public.content_calendars.metadata is 'Extension JSONB para IA, integraciones, templates o reglas futuras.';
comment on column public.content_calendar_items.metadata is 'Extension JSONB para briefs, assets, publicaciones programadas o analytics futuros.';
