---
name: serenita-backend
description: "Trigger: working on backend, FastAPI, routes, services, PDF, AI, OAuth. Serenita CM backend architecture and patterns."
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## Activation Contract

Apply this skill when generating, modifying, or reviewing backend code in `backend/`. It covers FastAPI patterns, service layer, Supabase integration, PDF generation, AI providers, and Meta OAuth.

## Hard Rules

- **Routes vs Services** — routes (`routes/`) handle HTTP concerns (parsing, auth, response). Business logic goes in services (`services/`). Routes must NOT import services that import routes (no circular deps).
- **Supabase access** — backend talks to Supabase via `httpx` (REST API), NOT the supabase-py SDK. The service role key lives in `SUPABASE_SERVICE_ROLE_KEY` env var.
- **Auth** — every authenticated endpoint calls `get_authenticated_user(authorization)` from `supabase_service.py`. Returns user dict or raises HTTP 401.
- **AI providers** — `openai_service.py` handles OpenAI and Gemini. Both have `is_*_configured()` guards. Routes must check availability before returning status or accepting queries.
- **Env config** — use `config.py` helpers (`get_env`, `require_env`). Never access `os.getenv` directly. `require_env` raises at runtime, not import time.
- **PDF** — Jinja2 templates + WeasyPrint. Templates in `templates/`, CSS in `static/`.

## Decision Gates

| Need | Action |
|------|--------|
| New data operation | Add function to `supabase_service.py` |
| New external API integration | Create new service in `services/` |
| New HTTP endpoint | Add route in route file, register in `main.py` |

## References

- `backend/app/config.py` — env var helpers
- `backend/app/services/supabase_service.py` — Supabase REST client
- `backend/app/services/openai_service.py` — AI provider patterns
