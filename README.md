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
