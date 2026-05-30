# Tasks: UI Components Polish — 4-PR Implementation Plan

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 650-930 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | 4 PRs → ToggleSwitch, Tooltip, Sections, Skeleton+Transitions |
| Delivery strategy | ask-on-risk |
| Chain strategy | stacked-to-main |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | ToggleSwitch + Badge fixes | PR 1 (main) | ~150-200 lines, 1 test |
| 2 | Tooltip + Focus-visible | PR 2 (main) | ~120-180 lines, 1 test |
| 3 | Section polish | PR 3 (main) | ~200-300 lines, depends on PR 1 toggle |
| 4 | Skeleton + Page transitions | PR 4 (main) | ~180-250 lines, 2 tests |

## Phase 1: ToggleSwitch (PR 1)

- [x] 1.1 Create `frontend/src/components/ToggleSwitch.tsx` with `role="switch"`, `aria-checked`, controlled + keyboard handlers
- [x] 1.2 Add `.toggle-switch` styles to `frontend/src/styles/index.css` (track, thumb, checked/unchecked, disabled, focus-visible)
- [ ] 1.3 Migrate badge hex colors to `--accent-*` tokens in `index.css` (`.calendar-status-badge`, `.connection-status`)
- [x] 1.4 Create `frontend/src/__tests__/ToggleSwitch.test.tsx` (a11y role, keyboard toggle, disabled inert)

## Phase 2: Tooltip (PR 2)

- [x] 2.1 Create `frontend/src/components/Tooltip.tsx` with CSS-only hover/focus-within, 4-position support
- [x] 2.2 Add `.tooltip-wrapper`, `.tooltip`, `.tooltip-arrow` styles to `frontend/src/styles/index.css` (glass surface, 4 positions)
- [ ] 2.3 Fix `:focus-visible` on all interactive elements (buttons, links, inputs, selects) across `index.css`
- [x] 2.4 Create `frontend/src/__tests__/Tooltip.test.tsx` (hover trigger, keyboard focus, position modifier)

## Phase 3: Skeleton + Page Transitions (PR 4)

- [x] 3.1 Create `frontend/src/components/Skeleton.tsx` with text-line/rectangle/circle variants, `aria-hidden="true"`
- [x] 3.2 Add `.skeleton` styles + `@keyframes shimmer` to `frontend/src/styles/index.css`
- [x] 3.3 Create `frontend/src/styles/transitions.css` with `@keyframes fadeIn/fadeOut`, `.fade-in`, `.exiting` classes
- [x] 3.4 Import `transitions.css` after `index.css` in `AppShell.tsx`
- [x] 3.5 Add transition state + class toggling logic in `AppShell.tsx` (`.fade-in`/`.exiting` on section change)
- [x] 3.6 Create `frontend/src/__tests__/Skeleton.test.tsx` (shape variants, custom dimensions, aria-hidden)
- [x] 3.7 Create `frontend/src/__tests__/PageTransition.test.tsx` (class toggle on section change, fade-in/exiting)

## Phase 4: Section Polish (PR 3)

- [x] 4.1 Calendar grid: replace hardcoded hex colors with `--accent-*` tokens in `index.css` (`.calendar-status-badge`, `.calendar-item-pill`)
- [x] 4.2 Report generator: fix font-family to `--font-body`/`--font-heading` tokens in form elements
- [x] 4.3 Connections: fix `.connection-status.activa`/`.expirada` colors, use `--accent-green`, `--accent-orange` tokens
- [x] 4.4 AI Settings: wire ToggleSwitch component for provider toggle
- [x] 4.5 Fix `:focus-visible` on remaining interactive elements (sidebar links, segmented controls, modal buttons)
