-- Make month/year nullable in content_calendars.
-- Calendars are timeless containers — month/year are optional metadata.
-- Run after 20260513_content_calendars.sql

alter table public.content_calendars
  alter column month drop not null,
  alter column year drop not null;

create index if not exists idx_content_calendars_org_list
  on public.content_calendars (organization_id, updated_at desc)
  where deleted_at is null;
