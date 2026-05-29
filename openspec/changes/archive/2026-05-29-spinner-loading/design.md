# Design: Spinner & Loading States

## Technical Approach

CSS-only `<Spinner>` component using `@keyframes spin` with design tokens; inline it into three sections that currently show plain text during load. Zero new dependencies.

## Architecture Decisions

| Decision | Options | Tradeoffs | Choice |
|----------|---------|-----------|--------|
| Animation engine | CSS vs JS lib vs SVG | JS adds dep; SVG needs inlining per size; CSS has zero cost | **CSS `@keyframes`** |
| Arc color token | `--accent-green`, `--md-sys-color-primary` | Green hardcodes; primary auto-adapts to light/dark themes | **`--md-sys-color-primary`** (per spec) |
| Spinner placement in CalendarSection | Sidebar vs grid area | Spec asks "centered Spinner replaces grid area" for both list and detail loads | **Both spinners in `.calendar-main` grid area** |
| `useCalendars` changes | Expose separate flags vs isListLoading/isDetailLoading | Already exposed — no change needed | **Destructure both from existing hook** |

## Data Flow

```
User opens section → hook fires fetch → is{Section}Loading = true
                                         ↓
                                    <Spinner /> renders in grid area
                                         ↓
                                    fetch resolves
                                         ↓
                                    data replaces Spinner
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `frontend/src/components/Spinner.tsx` | Create | CSS-only animated spinner, 3 sizes, accessible label |
| `frontend/src/styles/index.css` | Modify | Add `.spinner`, `@keyframes spin`, `.spinner-center`, `.sr-only` |
| `frontend/src/modules/calendars/components/CalendarSection.tsx` | Modify | Use `isListLoading`/`isDetailLoading` to show Spinner in grid area |
| `frontend/src/sections/ConnectionsSection.tsx` | Modify | Replace `<p>Cargando conexiones...</p>` with Spinner + text |
| `frontend/src/sections/ReportHistorySection.tsx` | Modify | Replace text loading state with Spinner |

## Interfaces / Contracts

```tsx
type SpinnerSize = "sm" | "md" | "lg";

type SpinnerProps = {
  size?: SpinnerSize;    // default "md"
  label?: string;        // aria-label + sr-only span
  className?: string;    // layout overrides
};
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit (Spinner) | Renders at 16/24/40px, label appears in aria + sr-only, no label omits both, className merges | vitest + @testing-library/react |
| Integration (CalendarSection) | Spinner appears during list/detail load, disappears on data | Mock useCalendars, assert DOM |

## Migration / Rollout

No migration required. Feature is purely additive CSS + component — toggle by removing/adding imports.

## Open Questions

None.
