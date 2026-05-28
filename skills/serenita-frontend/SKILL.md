---
name: serenita-frontend
description: "Trigger: working on frontend, React, sections, routes, components, Zod, Vite, styles. Serenita CM frontend architecture and conventions."
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## Activation Contract

Apply this skill when generating, modifying, or reviewing frontend code in `frontend/`. It covers routing, state management, component structure, validation, and styling.

## Hard Rules

- **No router library** — sections are determined by URL path. Routes live in `frontend/src/routes/`. `BrowserRouter` wraps the app in `routes/index.tsx`.
- **Auth** — session lives in `AuthContext`. `ProtectedRoute` checks session before rendering children. Login form is at `/login`, app shell at `/app/:section`.
- **Sections vs Components vs Modules**: `sections/` are page-level feature containers, `components/` are reusable UI primitives, `modules/` are self-contained features with types + hooks + components.
- **Validations** — Zod on frontend (`types/`), Pydantic on backend. Both must validate before data crosses the wire.
- **API calls** — use `VITE_API_URL` env var. Never hardcode backend URLs.
- **Theme** — dark/light mode via `document.documentElement.dataset.theme`. Toggle in Settings section.

## Decision Gates

| Need | Action |
|------|--------|
| New feature that needs its own state + types + views | Create a `module/` under `frontend/src/modules/` |
| Simple reusable UI without state | Add to `frontend/src/components/` |
| Page-level container | Add to `frontend/src/sections/` |
| New route | Add path in `routes/AppShell.tsx` |

## References

- `frontend/src/routes/` — router structure and auth context
- `frontend/src/lib/supabase.ts` — Supabase client creation
- `frontend/src/types/report.ts` — shared Zod schemas
