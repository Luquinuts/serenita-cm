# Tasks: Spinner & Loading States

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 150–200 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low

## Phase 1: Spinner Component

- [ ] 1.1 Create `frontend/src/components/Spinner.tsx` — CSS-only animated spinner with `sm`(16×16) / `md`(24×24) / `lg`(40×40) sizes, `label` prop (aria-label + sr-only span), and `className` merge
- [ ] 1.2 Add CSS to `frontend/src/styles/index.css` — `@keyframes spin`, `.spinner` (conic arc in `--md-sys-color-primary`), `.spinner-center` (flex centering), `.sr-only` (visually-hidden for accessibility)

## Phase 2: Spinner Tests (TDD — RED first)

- [ ] 2.1 Create `frontend/src/__tests__/Spinner.test.tsx` — test default size renders 24×24, `sm`/`md`/`lg` sizes, label renders in aria + sr-only, no label omits both, custom className merges
- [ ] 2.2 Run `cd frontend && npm test` — verify all Spinner tests pass

## Phase 3: CalendarSection Integration

- [ ] 3.1 Modify `frontend/src/modules/calendars/components/CalendarSection.tsx` — destructure `isListLoading`/`isDetailLoading` from `useCalendars`, import Spinner, show centered Spinner in `.calendar-main` during loading (list load: `label="Cargando calendarios"`, detail load replaces grid area)

## Phase 4: ConnectionsSection Update

- [ ] 4.1 Modify `frontend/src/sections/ConnectionsSection.tsx` — import Spinner, replace `<p>Cargando conexiones...</p>` with `<Spinner label="Cargando conexiones..." />` + text

## Phase 5: ReportHistorySection Update

- [ ] 5.1 Modify `frontend/src/sections/ReportHistorySection.tsx` — import Spinner, replace `"Buscando reportes guardados..."` text with `<Spinner label="Buscando reportes guardados..." />`

## Phase 6: Final Verification

- [ ] 6.1 Run `cd frontend && npm test` — confirm ALL existing + new tests pass
- [ ] 6.2 Verify build succeeds with `cd frontend && npx tsc --noEmit`
