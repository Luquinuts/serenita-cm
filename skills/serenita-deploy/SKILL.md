---
name: serenita-deploy
description: "Trigger: deploying, Vercel, Render, env vars, production, CI/CD. Serenita CM deployment pipeline and environment configuration."
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## Activation Contract

Apply this skill when deploying, configuring CI/CD, setting environment variables, or debugging production issues.

## Hard Rules

- **Frontend (Vercel)** — build command: `cd frontend && npm ci && npm run build`. Output: `frontend/dist`. SPA rewrites in `vercel.json`. No backend runs on Vercel.
- **Backend (Render)** — Docker or Python service. Runs FastAPI with uvicorn. PDF generation (WeasyPrint) requires system libs — use the Dockerfile in `backend/`.
- **Database (Supabase)** — connected to Vercel via integration (auto-env vars). Backend uses `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` directly.
- **Env var boundaries** — `VITE_*` vars MUST go in Vercel. AI keys (OpenAI, Gemini) MUST go in Render ONLY. Never expose AI keys to the frontend.
- **`VITE_API_URL`** — must point to the Render backend URL. No trailing slash.

## Env Var Reference

| Variable | Where | Purpose |
|----------|-------|---------|
| `VITE_API_URL` | Vercel | Backend URL for frontend API calls |
| `VITE_SUPABASE_*` | Vercel | Supabase integration auto-injects these |
| `SUPABASE_URL` | Render | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Render | Service role key for backend |
| `META_APP_ID`, `META_APP_SECRET` | Render | Meta OAuth credentials |
| `OPENAI_API_KEY`, `GEMINI_API_KEY` | Render | AI provider keys |
| `FRONTEND_URL` | Render | CORS + OAuth redirect origin |
| `CORS_ORIGINS` | Render | Custom CORS origins (optional) |

## References

- `vercel.json` — Vercel build and routing config
- `backend/Dockerfile` — Docker build for Render
- `README.md` — full env var documentation
