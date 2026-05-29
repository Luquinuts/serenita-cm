# Proposal: Spinner & Loading States

## Intent

The frontend lacks animated loading indicators — CalendarSection shows an empty grid during load, and four other sections use plain text ("Cargando conexiones...", "Pensando...", "Generando...") without visual feedback. This creates a janky UX where users don't know if work is happening.

## Scope

### In Scope
1. Reusable `Spinner` component — `frontend/src/components/Spinner.tsx`
2. Pure CSS animation (zero external deps), size prop (`sm|md|lg`), optional accessible `label`
3. Add Spinner to CalendarSection for list + detail loading
4. Upgrade text-only loading states in ConnectionsSection, ReportHistorySection to Spinner + text
5. Keep existing text + disabled button pattern in AiAssistantSection & ReportGeneratorSection but add Spinner alongside

### Out of Scope
- LoginPage / ProtectedRoute loading (already has logo animation)
- Skeleton screens for content grids
- Global loading overlay / route-level loading

## Capabilities

### New Capabilities
- `spinner-component`: Reusable animated Spinner — CSS-only, size variants, accessible label, follows design tokens

### Modified Capabilities
None — no spec-level behavior changes. All changes are UX polish within existing sections.

## Approach

1. Create `frontend/src/components/Spinner.tsx` with a CSS `@keyframes` spin animation using `--md-sys-color-primary` token for the arc color. Use `border` + `border-top-color` technique for a minimal ring spinner.
2. Accept `size` mapping to `--spinner-size` CSS var (sm=16px, md=24px, lg=36px) and `label` rendered as `<span className="sr-only">`.
3. Add CSS in `frontend/src/styles/index.css` under a `.spinner` class block.
4. In CalendarSection, use `isListLoading` (from `useCalendars`) to show Spinner inside the sidebar, and `isDetailLoading` in calendar grid area.
5. Replace text-only `<p>...Cargando...</p>` in other sections with `<Spinner label="..." /> + <span>texto</span>`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `frontend/src/components/Spinner.tsx` | New | Reusable spinner component |
| `frontend/src/styles/index.css` | Modified | Add .spinner CSS classes |
| `frontend/src/sections/ConnectionsSection.tsx` | Modified | Replace text with Spinner + text |
| `frontend/src/modules/calendars/hooks/useCalendars.ts` | Modified | Expose `isListLoading`, `isDetailLoading` (already exposed) |
| `frontend/src/modules/calendars/components/CalendarSection.tsx` | Modified | Wire isListLoading/isDetailLoading to Spinner |
| `frontend/src/sections/AiAssistantSection.tsx` | Modified | Add Spinner alongside "Pensando..." |
| `frontend/src/sections/ReportGeneratorSection.tsx` | Modified | Add Spinner alongside "Generando..." |
| `frontend/src/sections/ReportHistorySection.tsx` | Modified | Replace text with Spinner + text |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Spinner not visible in dark/light theme | Low | Use primary token already adapted in both themes |
| Calendar grid reflow when spinner appears | Low | Use fixed-size spinner with absolute/block layout, no layout shift |

## Rollback Plan

Remove `<Spinner>` imports and JSX from each section. Delete `Spinner.tsx` and `.spinner` CSS block. One revert commit.

## Dependencies

None — pure CSS, zero dependencies.

## Success Criteria

- [ ] `Spinner` renders in all 3 sizes with correct visual appearance
- [ ] CalendarSection shows spinner during initial list load and when switching calendars
- [ ] ConnectionsSection shows spinner + "Cargando conexiones..." during load
- [ ] All existing text-only loading states include animated indicator
- [ ] No regressions in existing functionality
