# Proposal: Calendar as Timeless Containers

## Intent

Calendars are locked to a specific month+year. When a user switches the month filter, their calendar disappears from the sidebar because the API filters by period. Calendars need to be persistent containers visible across all months — only items inside them carry dates via `scheduled_date`.

## Scope

### In Scope
1. DB migration: make `month`/`year` nullable in `content_calendars`, add org-based listing index
2. Backend schemas: make `month`/`year` optional in `CalendarCreateInput`/`CalendarUpdateInput`
3. Backend API: remove default month/year filtering from `GET /api/calendars`
4. Frontend types: make `month`/`year` optional in `ContentCalendar`
5. Frontend hooks: stop sending month/year in load/create calendar API calls
6. Frontend UI: show all calendars in sidebar regardless of month filter; month/year filter only controls grid items

### Out of Scope
- Changing filter behavior for calendar items (already date-based via `scheduled_date`)
- Backfilling existing month/year data into items
- UI redesign of the sidebar — only filter logic changes

## Capabilities

> No existing specs in `openspec/specs/`. All capabilities are new.

### New Capabilities
- `content-calendars`: Calendar CRUD with month/year as optional metadata (not identity). Calendars are timeless — listing never filters by period. Items retain date-based filtering.

### Modified Capabilities
None — this is the first spec for this domain.

## Approach

**DB**: `ALTER content_calendars ALTER month/year DROP NOT NULL`, add `idx_content_calendars_org (org_id, status)`. Existing rows keep their values (backward compatible).

**Backend**: Make `month`/`year` Optional[int] in Pydantic schemas. Remove period filter from list query — list all calendars for org. Add a query param `?period=2026-05` to optionally filter (for future use).

**Frontend**: Make `month`/`year` optional (`?:`). `useCalendars` stops appending month/year to GET params and create payload. Sidebar renders all non-archived calendars. Grid already uses `itemsByDate` — no grid changes needed.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `backend/app/models/content_calendar.py` | Modified | Column nullable + new index |
| `backend/app/schemas/calendar.py` | Modified | `month`/`year` → Optional[int] |
| `backend/app/routes/calendars.py` | Modified | Remove period filter from list query |
| `backend/app/db/migrations/` | New | Add nullable migration + index |
| `frontend/src/types/calendar.ts` | Modified | `month`/`year` → optional |
| `frontend/src/hooks/useCalendars.ts` | Modified | Drop month/year from API calls |
| `frontend/src/components/CalendarSection.tsx` | Modified | Render all calendars unconditionally |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Existing clients send month/year and get 422 | Low | Backward-compatible — optional fields accept missing values |
| Orgs with many calendars see perf regression | Low | New index on `(org_id, status)` covers the unbounded list query |
| UI confusion: sidebar shows calendars with no items for the selected month | Medium | Calendars with no items in the current month show as empty; user already sees this pattern with other empty states |

## Rollback Plan

1. **DB**: `ALTER content_calendars ALTER month/year SET NOT NULL`, drop new index, restore old index
2. **Backend**: Revert schema changes and route filter — deploy previous version
3. **Frontend**: Revert type, hook, and component changes — deploy previous build

All rollbacks are pure reverts with no data loss. The migration is additive (nullable is less restrictive than NOT NULL).

## Dependencies

- Database migration must run before backend deploy
- Backend deploy must precede frontend deploy (API contract changes)

## Success Criteria

- [x] A calendar created without month/year is visible in every month filter
- [x] Calendar list query returns all org calendars (no period filtering)
- [x] All existing tests pass; new tests verify timeless calendar behavior
- [x] Grid items still filter correctly by `scheduled_date` regardless of calendar visibility
