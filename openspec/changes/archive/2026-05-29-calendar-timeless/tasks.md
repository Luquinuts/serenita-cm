# Tasks: Calendar as Timeless Containers

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~100–130 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

Suggested Work Units: Not needed — single PR under budget.

## Phase 1: Database Migration

- [x] 1.1 Create `supabase/migrations/20260529_calendars_drop_month_requirement.sql` — `ALTER month DROP NOT NULL`, `ALTER year DROP NOT NULL`, add `idx_content_calendars_org_list` on `(organization_id, updated_at desc) where deleted_at is null`

## Phase 2: Backend API

- [x] 2.1 In `backend/app/schemas.py`: change `CalendarCreateInput.month` from `int = Field(...)` to `int | None = Field(default=None, ge=1, le=12)`, and `year` from `int = Field(...)` to `int | None = Field(default=None, ge=2020, le=2100)`
- [x] 2.2 In `backend/app/routes/calendars.py`: remove `month`/`year` filter logic from `GET /api/calendars` (keep params as no-op), change `order` from `year.desc,month.desc,updated_at.desc` to `updated_at.desc`

## Phase 3: Backend Tests

- [x] 3.1 In `backend/tests/test_schemas.py`: add test `test_create_without_month_year` — `CalendarCreateInput(name="X")` asserts `month is None` and `year is None`
- [x] 3.2 In `backend/tests/test_calendar_service.py`: add test `test_creates_without_month_year` — call `create_calendar` with `month=None, year=None`, verify mock insert receives `month: None, year: None`
- [x] 3.3 Run `pytest backend/tests/` — all existing tests pass, new tests pass

## Phase 4: Frontend Types

- [x] 4.1 In `frontend/src/modules/calendars/types.ts`: change `ContentCalendar.month` from `number` to `number | null`, `year` from `number` to `number | null`

## Phase 5: Frontend Hook

- [x] 5.1 In `frontend/src/modules/calendars/hooks/useCalendars.ts`: remove `month` and `year` from `URLSearchParams` in `loadCalendars`
- [x] 5.2 In same file: remove `month` and `year` from `POST` body in `createCalendar`
- [x] 5.3 Run `npm test` — all existing tests pass

## Phase 6: Frontend Component

- [x] 6.1 In `frontend/src/modules/calendars/components/CalendarSection.tsx`: update `CalendarCard` to guard `monthNames[calendar.month - 1]` — render name + status only, skip month/year when null
- [x] 6.2 In same file: update empty state text from `"para este periodo"` to generic message
- [x] 6.3 Run `npm test` — all existing tests pass
