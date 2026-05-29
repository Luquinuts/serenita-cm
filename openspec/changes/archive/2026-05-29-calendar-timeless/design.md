# Design: Calendar as Timeless Containers

## Technical Approach

Make `month`/`year` nullable in DB, schema, types, and service layer. The list endpoint no longer filters by period — all org calendars are returned unconditionally. The grid already filters items by `scheduled_date`, so no grid logic changes. Month/year filter UI stays but only controls the grid viewport, not calendar visibility.

## Architecture Decisions

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Keep month/year in GET as active filters | Old clients keep working, but defeats the purpose | **Drop from filters** — accept params silently but ignore them |
| Separate `CalendarFilters` into list vs grid filters | Cleaner, but larger refactor | **Keep single `CalendarFilters`** — only the hook stops sending month/year |
| New `(org_id, status)` index vs extending existing | New index adds disk, but existing `org_period` index is still useful for backward compat | **Add `idx_content_calendars_org_list`** — covers the unbounded org query, keeps old index for existing queries |

## Data Flow

```
CalendarSection                    useCalendars                    FastAPI                    Supabase
    │                                  │                            │                          │
    ├── filters (month/year) ─────────→┤   (still consumed for      │                          │
    │                                   │    grid display, NOT      │                          │
    │                                   │    for API calls)         │                          │
    │                                   │                            │                          │
    │                                   ├── GET /api/calendars ─────→│                          │
    │                                   │                            ├── select content_calendars ─→│
    │                                   │                            │   WHERE org_id=X           │
    │                                   │                            │   AND deleted_at IS NULL   │
    │                                   │                            │←──── all calendars ──────────┤
    │                                   │←──── calendars (unfiltered) │                          │
    │←──── calendars ───────────────────┤                            │                          │
    │                                   │                            │                          │
    ├── visibleDays ← getMonthGrid(y,m) │                            │                          │
    │   (grid renders items from        │                            │                          │
    │    selectedCalendar.items,         │                            │                          │
    │    filtered by scheduled_date)     │                            │                          │
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `supabase/migrations/20260514_calendars_nullable_month_year.sql` | Create | ALTER month/year DROP NOT NULL + new index |
| `backend/app/schemas.py` | Modify | `month`/`year` → `int \| None = Field(default=None, ...)` in `CalendarCreateInput` |
| `backend/app/routes/calendars.py` | Modify | Remove month/year filter logic from GET (keep params as no-op) |
| `backend/tests/test_schemas.py` | Modify | Add test: create calendar without month/year |
| `backend/tests/test_calendar_service.py` | Modify | Add test: create_calendar with month=None, year=None |
| `frontend/src/modules/calendars/types.ts` | Modify | `ContentCalendar.month` / `.year` → `number \| null` |
| `frontend/src/modules/calendars/hooks/useCalendars.ts` | Modify | Remove month/year from GET params and POST payload |
| `frontend/src/modules/calendars/components/CalendarSection.tsx` | Modify | CalendarCard handles null month; empty state text |

## Interfaces / Contracts

**CalendarCreateInput** (after):
```python
class CalendarCreateInput(BaseModel):
    organization_id: str | None = None
    name: str = Field(..., min_length=1, max_length=120)
    description: str | None = Field(default=None, max_length=800)
    month: int | None = Field(default=None, ge=1, le=12)   # was required
    year: int | None = Field(default=None, ge=2020, le=2100)  # was required
    status: CalendarStatus = "draft"
    metadata: dict[str, Any] = Field(default_factory=dict)
```

**ContentCalendar** (after):
```typescript
export type ContentCalendar = {
  // ... unchanged fields
  month: number | null;    // was number
  year: number | null;     // was number
  // ...
};
```

**GET /api/calendars** (after):
- Accepts `month`, `year` as query params (no-op — kept for backward compat with old clients)
- Returns `{ calendars: ContentCalendar[] }` — all non-deleted calendars for the org
- Filters: `organization_id`, `status` (optional), `q` (name search)
- Order: `updated_at desc` (was `year desc, month desc, updated_at desc`)

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit (schema) | Create calendar without month/year | `CalendarCreateInput(name="Test")` → `month is None`, `year is None` |
| Unit (service) | `create_calendar` with None month/year | Mock insert, verify payload has `month: None, year: None` |
| Integration | GET /api/calendars without month/year | Calendars with different months all returned |
| Frontend (manual) | CalendarSection renders null month/year card | Verify no crash on `monthNames[null - 1]` |

## Migration / Rollout

1. **Run DB migration** first (`20260514_calendars_nullable_month_year.sql`)
2. **Deploy backend** (schema + route changes — backward compatible, old clients still work)
3. **Deploy frontend** (stops sending month/year — old API still accepts them)
4. No data backfill needed — existing rows keep their month/year values

Rollback: run reverse ALTER to SET NOT NULL (requires backfilling null rows first), drop new index, revert code.

## Open Questions

- None resolved. The change is additive — nullable is less restrictive, old data is preserved.
