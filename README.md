# Serenita CM

Serenita CM es una app web editorial para cargar balances mensuales de redes sociales, previsualizar un reporte de cuatro páginas y descargar un PDF final con diseño premium.

## Stack

- Frontend: React + TypeScript + Vite + Zod
- Backend: Python + FastAPI + Pydantic
- PDF: Jinja2 + WeasyPrint
- Persistencia local: `localStorage`
- Contenedores: Docker + Docker Compose

## Estructura

```text
serenita-cm/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routes/
│   │   │   └── report.py
│   │   ├── schemas.py
│   │   ├── services/
│   │   │   └── report_service.py
│   │   ├── static/
│   │   │   └── pdf.css
│   │   └── templates/
│   │       └── report.html
│   ├── tests/
│   │   └── test_health.py
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── styles/
│   │   ├── types/
│   │   └── utils/
│   ├── Dockerfile
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── shared/
│   └── sample-report.json
├── docker-compose.yml
└── README.md
```

## Requisitos locales

- Node.js 20+
- Python 3.12+
- En Linux, librerías del sistema para WeasyPrint:

```bash
sudo apt-get update
sudo apt-get install -y build-essential libpango-1.0-0 libpangocairo-1.0-0 libcairo2 libffi-dev shared-mime-info fonts-dejavu-core
```

## Cómo correr el backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Healthcheck:

```bash
curl http://localhost:8000/api/health
```

Generación manual de PDF:

```bash
curl -X POST http://localhost:8000/api/report/pdf \
  -H "Content-Type: application/json" \
  --data @../shared/sample-report.json \
  --output serenita-cm-ejemplo.pdf
```

## Cómo correr el frontend

```bash
cd frontend
npm install
npm run dev
```

Abrí `http://localhost:5173`.

## Cómo correr con Docker Compose

```bash
docker compose up --build
```

Servicios:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`

## Flujo de uso

1. Cargá el ejemplo o completá el formulario.
2. Editá métricas, publicaciones, audiencia e insights.
3. Revisá la preview a la derecha.
4. Usá `Generar PDF` para descargar el archivo final.
5. Si querés reutilizar datos, usá `Descargar JSON` o `Importar JSON`.

## Validaciones y comportamiento

- El frontend valida con Zod antes de enviar.
- El backend valida con Pydantic antes de renderizar.
- Los campos vacíos no rompen el layout: se ocultan o muestran placeholders elegantes.
- Los insights visibles en PDF se limitan a los primeros 4.
- Las sugerencias visibles en PDF se limitan a las primeras 6.
- Las top publicaciones visibles en PDF se limitan a las primeras 3.
- Las métricas por publicación visibles en PDF se limitan a las primeras 5.

## Tests mínimos

```bash
cd backend
pytest
```

## Deploy en Vercel

El repo es un monorepo: la app web vive en `frontend/` y el backend vive en `backend/`.
Para que Vercel no publique la raiz vacia del proyecto, este repo incluye `vercel.json`
con estos valores:

- Install Command: `cd frontend && npm ci`
- Build Command: `cd frontend && npm run build`
- Output Directory: `frontend/dist`

Despues de pushear cambios a GitHub, redeploya el proyecto en Vercel. Si el proyecto fue
creado antes de agregar `vercel.json`, tambien podes revisar en Vercel que no haya un
Root Directory manual apuntando a otra carpeta.

Para generar PDF en produccion hace falta desplegar el backend por separado y configurar
en Vercel la variable `VITE_API_URL` con la URL publica del backend, por ejemplo:

```text
VITE_API_URL=https://tu-backend.example.com
```

Para el modulo de conexiones OAuth con Meta, el backend necesita estas variables:

```text
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
META_APP_ID=...
META_APP_SECRET=...
META_REDIRECT_URI=https://tu-backend.example.com/api/oauth/meta/callback
META_OAUTH_SCOPES=public_profile
FRONTEND_URL=https://serenita-cm.vercel.app
```

`META_OAUTH_SCOPES` es opcional. Para una primera prueba de OAuth usa `public_profile`.
Cuando la app de Meta tenga configurados y aprobados los permisos de Instagram, podes
cambiarlo en el backend por una lista separada por comas.

Para habilitar la seccion de IA, el backend tambien necesita una API key de OpenAI:

```text
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.5-flash
AI_MAX_OUTPUT_TOKENS=4000
```

`OPENAI_MODEL`, `GEMINI_MODEL` y `AI_MAX_OUTPUT_TOKENS` son opcionales. Las claves de
IA deben configurarse solo en el backend de Render, nunca en Vercel ni con prefijo
`VITE_`.

## Supabase

La app usa Supabase para inicio de sesión e historial de reportes. En Vercel se usan
las variables generadas por la integracion de Supabase:

```text
VITE_SUPABASE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Tambien funciona con `VITE_SUPABASE_SUPABASE_ANON_KEY` si todavia usas la key anon
legada.

Para crear las tablas y las politicas de seguridad, ejecuta el SQL de
[supabase/schema.sql](supabase/schema.sql) en el SQL Editor de Supabase.

Por ahora no hay registro publico. Los usuarios se crean manualmente desde:

```text
Supabase > Authentication > Users > Add user
```

## Dataset inicial

El ejemplo base está en [shared/sample-report.json](shared/sample-report.json).

## Prueba manual sugerida

1. Levantá backend y frontend.
2. Presioná `Cargar ejemplo`.
3. Generá el PDF y comparalo con la preview.
4. Probá borrar uno o más insights y verificar que la grilla se recompone.
5. Probá dejar una publicación con menos métricas y verificar que la tarjeta mantiene la jerarquía visual.
## Windows

Si ya instalaste Node.js, Python 3.12 y GTK para WeasyPrint, podes arrancar ambos servicios desde la raiz del proyecto:

```powershell
.\run-backend.ps1
.\run-frontend.ps1
```
