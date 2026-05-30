# Design: UI Components Polish — 4 New Components

## Technical Approach

4 CSS-first React components following the existing Spinner.tsx pattern: single-file, class-based styling via `index.css`, zero new npm deps. Each component reuses existing design tokens (`--md-sys-*`, `--accent`, `--transition-*`). New transition CSS goes into a dedicated `transitions.css` file. This is a pure presentational layer change — no data flow, no backend, no new routes.

## Architecture Decisions

| Decision | Options | Tradeoff | Choice |
|----------|---------|----------|--------|
| Toggle: state model | CSS hidden checkbox vs React controlled state | Hidden checkbox follows native `<label>` behavior but conflicts with React controlled inputs; React state matches Spinner.tsx's prop-driven pattern | React controlled component with `role="switch"` |
| Tooltip: visibility | CSS `:hover`/`:focus-within` vs JS portal vs Radix | CSS-only can't delay/show on click, but avoids deps and matches project's zero-dependency approach | CSS-only `:hover`/`:focus-within` on wrapper |
| Skeleton: animation | CSS `@keyframes` shimmer vs external lib vs inline SVG | CSS shimmer is ~25 lines, GPU-composited (opacity + transform only), 0 deps | CSS `@keyframes` shimmer via `translateX` on pseudoelement |
| Page transition: mechanism | framer-motion vs CSS `@keyframes` + class toggle vs react-transition-group | CSS-only degrades gracefully with no JS; requires manual class management in AppShell | CSS `.fade-in`/`.exiting` classes toggled via React state in AppShell |

## Data Flow

```
User clicks nav button
  → AppShell sets resolvingSection state with .exiting class
  → CSS fade-out plays (150ms), then content unmounts
  → New section mounts with .fade-in class
  → CSS fade-in plays (300ms)

All 4 components are leaf-level presentational:
  Props → Render → HTML + CSS (no side effects, no context, no data fetching)
```

## Key Implementation Details

**Page transition orchestration** in AppShell: wrap `app-main` children in a transition container. On navigation, add `.exiting` to current content, wait for `animationend` or a timeout, then swap sections with `.fade-in`. Timeout fallback prevents blocking.

```tsx
// transition container pattern
<div className={isExiting ? "content-exiting" : "content-entering"}>
  {showContent ? <Section /> : null}
</div>
```

**Toggle** uses a React-controlled `aria-checked` with `onClick`/`onKeyDown` handlers. The visual track + thumb is pure CSS via `::before`/`::after` on a `<span>` inside the button.

**Tooltip** wraps trigger + tooltip in a container: `.tooltip-wrapper { position: relative }` → `.tooltip { display: none }` → `.tooltip-wrapper:hover .tooltip, .tooltip-wrapper:focus-within .tooltip { display: block }`.

**Skeleton** renders a `<div class="skeleton" aria-hidden="true">` with CSS `--skeleton-width`/`--skeleton-height` custom properties and a `::after` shimmer pseudoelement.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `frontend/src/components/ToggleSwitch.tsx` | Create | React toggle with `role="switch"`, controlled `checked`/`onChange` |
| `frontend/src/components/Tooltip.tsx` | Create | CSS wrapper for hover/focus tooltip, `data-tooltip` and `data-tooltip-pos` attrs |
| `frontend/src/components/Skeleton.tsx` | Create | Shimmer placeholder, `text-line`/`rectangle`/`circle` shapes |
| `frontend/src/styles/transitions.css` | Create | `@keyframes fadeIn`, `.fade-in`, `.exiting` classes, non-blocking animations |
| `frontend/src/styles/index.css` | Modify | Append `.toggle-switch`, `.tooltip-*`, `.skeleton`, `.skeleton-shimmer` styles |
| `frontend/src/routes/AppShell.tsx` | Modify | Wrap `<main>` children with transition state and class toggling |

## Interfaces / Contracts

```tsx
// ToggleSwitch
interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  id?: string;
}

// Tooltip
interface TooltipProps {
  content: string;
  position?: "top" | "bottom" | "left" | "right";
  children: React.ReactNode;
}

// Skeleton
interface SkeletonProps {
  shape?: "text-line" | "rectangle" | "circle";
  width?: string | number;
  height?: string | number;
  className?: string;
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | ToggleSwitch renders checked/unchecked | `getByRole("switch")`, `toHaveAttribute("aria-checked")` |
| Unit | ToggleSwitch toggles on click/keyboard | `fireEvent.click`, `fireEvent.keyDown` (Space/Enter) |
| Unit | ToggleSwitch disabled state | `aria-disabled`, no onChange on click |
| Unit | Tooltip visible on hover/focus | verify text content, CSS class, `data-tooltip` attr |
| Unit | Skeleton renders shapes | DOM assertions for classes, `aria-hidden="true"` |
| Unit | Skeleton custom dimensions | `toHaveStyle` on `--skeleton-width`/`--skeleton-height` |
| Unit | Page transition class toggling | render AppShell with section change, assert `.fade-in`/`.exiting` |

## Migration / Rollout

No migration required. All 4 components are additive — existing code continues unchanged. Sections adopt these components in later PRs (PRs 2–4 per proposal). Transition CSS is inert until AppShell applies the class‑toggling logic.

## Dependencies

`transitions.css` must be imported in `AppShell.tsx` (or `main.tsx`) AFTER `index.css` so cascade order is correct: base tokens → component styles → transition animations.

## Open Questions

- None
