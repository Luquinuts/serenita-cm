# Proposal: UI Components Polish — 3-Layer Redesign

## Intent

Complete the cyber-noir redesign by polishing components, sections, and micro-interactions deferred from Layer 1. Current state: buttons have inconsistent border-radius, toggle/switch and tooltip/popover are missing, badges use old MD3 accent colors, sections have hardcoded styling, skeleton loaders don't exist, focus-visible is inconsistent, and section switches are abrupt.

## Scope

### In Scope
- Fix button border-radius (4px → 2px) and hover/active/focus states
- Create toggle/switch component with cyber-noir tokens
- Create tooltip/popover with glass-morphism styling
- Migrate badges/tags from old MD3 accent colors to new tokens
- Fix section styling: calendar grid, report generator, connections, AI settings
- Add skeleton loaders for data-fetching states
- Add page transitions between sections
- Add empty state components
- Consistent focus-visible on all interactive elements

### Out of Scope
- Backend changes (API, data model, auth)
- New features or sections
- Icon replacements or SVG redesign
- Light theme restyling
- Data model changes

## Capabilities

### New Capabilities
- `toggle-switch`: Toggle/switch input with cyber-noir tokens, keyboard-accessible
- `tooltip-popover`: Tooltip + popover with glass-morphism surface, viewport-aware positioning
- `skeleton-loader`: Content-aware skeleton placeholders per section layout
- `page-transition`: CSS view transition or fade animation between section navigation

### Modified Capabilities
None — all fixes are implementation-level (CSS tokens, component refinements). No existing spec requires behavioral changes.

## Approach

Split into 4 chained PRs (400-line budget per Section E):

- **PR 1 — Primitives**: Fix buttons (border-radius, focus-visible), create toggle/switch, migrate badges to new token palette
- **PR 2 — Interactive**: Create tooltip/popover with positioning, add focus-visible to all interactive elements, fix input/select hover/focus states
- **PR 3 — Sections**: Replace hardcoded colors in .calendar-grid, .report-generator, .connections, .ai-settings with tokens; fix fonts (Google Sans → Inter/Bebas Neue)
- **PR 4 — Micro-interactions**: Skeleton loaders per section, CSS page transitions, empty state components

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `frontend/src/styles/index.css` | Modified | Button fixes, toggle/tooltip/skeleton styles, section token migrations |
| `frontend/src/components/` | New | ToggleSwitch, Tooltip, Skeleton, transition wrapper |
| `frontend/src/sections/*` | Modified | Replace hardcoded colors, fix fonts |
| `frontend/src/modules/*` | Modified | Focus-visible and empty states |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Badge migration breaks accent cycling in PublicationCard | Low | Keep accentCycle array; change hex values, not class names |
| `.toggle` CSS class conflict | Low | Namespace as `.cyber-toggle` |
| Tooltip positioning breaks on mobile | Med | Viewport-aware fallback positioning |

## Rollback Plan

Revert per PR — each chained PR targets its own isolated diff. Feature tracker branch allows revert by commit range. No single PR touches more than 400 lines.

## Dependencies

- Layer 1 design tokens (`--md-sys-*`, `--accent-*`) — done
- Metalab transition tokens (0.15s/0.2s/0.3s) — done

## Success Criteria

- [ ] All interactive elements have hover, active, and focus-visible states
- [ ] All sections use design tokens — grep for hardcoded hex values returns 0 section hits
- [ ] Skeleton loaders visible during data fetch, removed on completion
- [ ] Page transitions animate smoothly between sections (< 300ms)
- [ ] Focus-visible ring visible on all interactive elements via keyboard nav
