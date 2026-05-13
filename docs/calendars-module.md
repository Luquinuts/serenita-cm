# Calendarios de Contenido

Modulo multi-tenant para planificacion mensual de contenido en Serenita CM.

## Estructura implementada

```text
backend/app/routes/calendars.py
backend/app/services/calendar_service.py
supabase/migrations/20260513_content_calendars.sql
frontend/src/modules/calendars/components/CalendarSection.tsx
frontend/src/modules/calendars/hooks/useCalendars.ts
frontend/src/modules/calendars/lib/calendarUtils.ts
frontend/src/modules/calendars/types.ts
```

La UI se integra desde `frontend/src/pages/App.tsx` como seccion `Calendario`.

## Modelo de datos

`content_calendars` representa un calendario mensual por organizacion. Permite multiples calendarios para el mismo mes, multiples calendarios por cuenta/organizacion y estados `draft`, `active`, `archived`.

`content_calendar_items` representa piezas planificadas. Soporta `reel`, `carousel`, `story` y `content_creation`, estados editoriales y orden visual por dia mediante `position_in_day`.

El soft delete se implementa con `deleted_at` para preservar auditoria y evitar perdida accidental de planificaciones.

## Endpoints

```text
GET    /api/calendars
POST   /api/calendars
GET    /api/calendars/{calendar_id}
PATCH  /api/calendars/{calendar_id}
DELETE /api/calendars/{calendar_id}
POST   /api/calendars/{calendar_id}/duplicate
POST   /api/calendars/{calendar_id}/items
PATCH  /api/calendars/items/{item_id}
DELETE /api/calendars/items/{item_id}
POST   /api/calendars/{calendar_id}/items/reorder
```

Todos requieren `Authorization: Bearer <supabase_access_token>`.

## Permisos

La migracion incluye RLS por `organization_members`. El backend tambien valida membresia antes de operar con service role. Si el usuario no tiene organizacion, el backend crea una organizacion personal inicial al crear/listar calendarios.

## Consultas SQL frecuentes

Crear calendario:

```sql
insert into public.content_calendars (
  organization_id, user_id, name, description, month, year, status
) values (
  'ORG_ID', 'USER_ID', 'Calendario Mayo Cliente A', 'Campaña otoño', 5, 2026, 'draft'
);
```

Crear item:

```sql
insert into public.content_calendar_items (
  calendar_id, scheduled_date, content_type, title, objective, status, priority, color_tag
) values (
  'CALENDAR_ID', '2026-05-15', 'reel', 'Outfit de otoño', 'Alcance e interacción',
  'pendiente', 'high', '#50e3c2'
);
```

Obtener calendarios mensuales:

```sql
select *
from public.content_calendars
where organization_id = 'ORG_ID'
  and month = 5
  and year = 2026
  and deleted_at is null
order by updated_at desc;
```

Obtener items por rango:

```sql
select *
from public.content_calendar_items
where calendar_id = 'CALENDAR_ID'
  and scheduled_date between '2026-05-01' and '2026-05-31'
  and deleted_at is null
order by scheduled_date asc, position_in_day asc;
```

Filtrar por tipo:

```sql
select *
from public.content_calendar_items
where calendar_id = 'CALENDAR_ID'
  and content_type = 'reel'
  and deleted_at is null;
```

Filtrar por estado:

```sql
select *
from public.content_calendar_items
where calendar_id = 'CALENDAR_ID'
  and status in ('pendiente', 'en_progreso')
  and deleted_at is null
order by priority asc, scheduled_date asc;
```

Soft delete:

```sql
update public.content_calendars
set deleted_at = now()
where id = 'CALENDAR_ID';
```

## UX/UI

La primera version incluye:

- Listado lateral de calendarios.
- Filtros por mes, año, estado y busqueda.
- Vista mensual y semanal.
- Creacion, edicion y eliminacion de items.
- Duplicado de calendarios con items.
- Badges por tipo y estado.
- Color por tipo de contenido o color manual.
- Orden visual por prioridad y posicion.
- Estado vacio y mensajes de error.
- Layout responsive.

Preparado para futuro:

- Drag and drop sobre `position_in_day`.
- Autosave granular desde `PATCH /items/{item_id}`.
- Skeleton loaders.
- Vistas por cuenta, campaña o cliente.
- Generacion de calendario con IA guardando prompts/briefs en `metadata`.
- Publicacion programada agregando provider ids y estados en `metadata`.
- Analytics por item mediante tablas futuras o claves versionadas en `metadata`.

## Performance

Indices principales:

- `content_calendars (organization_id, year, month, status)` para listados mensuales.
- `content_calendars (user_id, created_at desc)` para actividad reciente.
- `content_calendar_items (calendar_id, scheduled_date, position_in_day)` para render mensual/semanal.
- `content_calendar_items (content_type, status)` para filtros editoriales.

Recomendaciones:

- Paginar calendarios si una organizacion supera 100 historicos.
- Cargar items por rango de fechas cuando se agreguen calendarios grandes.
- Usar optimistic updates para drag and drop.
- Memoizar agrupado por fecha en frontend, ya aplicado con `useMemo`.
- Virtualizar listas si se agrega vista agenda con cientos de items.
- Cachear `GET /api/calendars/{id}` por calendario seleccionado cuando se agregue React Query o SWR.

## Refactors sugeridos

El modulo de reportes todavia guarda directo desde frontend a Supabase y usa RLS por `user_id`. Para consistencia multi-tenant, conviene migrarlo gradualmente a:

- `organization_id` obligatorio.
- Endpoints backend con validacion de membresia.
- RLS por `organization_members`.
- Soft delete y `updated_at`.

Esto no bloquea calendarios, pero seria el siguiente paso para que todos los modulos compartan el mismo modelo SaaS.
