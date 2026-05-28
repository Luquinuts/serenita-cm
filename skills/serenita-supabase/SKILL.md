---
name: serenita-supabase
description: "Trigger: working on Supabase, database, schema, RLS, migrations, auth, SQL. Serenita CM database schema and security patterns."
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## Activation Contract

Apply this skill when creating or modifying database schema, RLS policies, migrations, or Supabase configuration.

## Hard Rules

- **No public signup** — users are created manually in Supabase Auth dashboard. No `signUp()` in the frontend. This is intentional until paid registration is implemented.
- **RLS on every table** — every table must have `ENABLE ROW LEVEL SECURITY` and at least a `SELECT` policy for authenticated users. No `public` access.
- **Backend uses service role** — the backend (`supabase_service.py`) authenticates with `SUPABASE_SERVICE_ROLE_KEY`. Anon keys from frontend are NEVER used server-side.
- **Schema file** — `supabase/schema.sql` is the single source of truth for the production schema. Run it in Supabase SQL Editor after changes.
- **Migrations** — incremental changes go in `supabase/migrations/` as SQL files with a timestamp prefix.

## Decision Gates

| Need | Action |
|------|--------|
| New table | Add to `schema.sql`, create RLS policies, add to `supabase_service.py` |
| Schema change in production | Write migration file in `supabase/migrations/`, update `schema.sql` |
| New auth-only feature | Use `auth.users()` in RLS policy, no service role bypass |

## References

- `supabase/schema.sql` — production schema
- `supabase/migrations/` — incremental migrations
- `backend/app/services/supabase_service.py` — backend Supabase client
- `frontend/src/lib/supabase.ts` — frontend Supabase client
