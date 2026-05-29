# Proposal: Redesign Base — Cyber-Noir Design System (Layer 1)

## Intent

Replace the current MD3-inspired dark theme with a futuristic industrial cyber-noir aesthetic. The current UI uses green accents, rounded cards, and Google Sans typography — it reads as generic dark SaaS. We need a premium, aggressive, HUD-inspired visual identity: think high-end techwear branding and sci-fi OS interfaces.

## Scope

### In Scope
- CSS custom properties: replace all accent colors (green, pink, orange, lavender) with black/white + electric blue (`#00d4ff`) for interactive states only
- Typography: import Inter (body), JetBrains Mono (metadata), Bebas Neue or condensed (headings); redefine type scale
- Base reset: scrollbar (thin/dark), selection color (electric blue), focus outlines, noise/grain overlay via `::after` + SVG filter
- Layout shell: `app-shell`, sidebar, nav, panels — thin `1px` borders instead of shadows, outlined containers, monospaced labels
- Noise overlay: subtle grain texture on `<body>`, pure CSS/SVG, zero JS

### Out of Scope
- Individual component restyling (buttons, cards, inputs, badges, spinners)
- Section-specific restyling (ReportGenerator, Calendar, Connections, AI, Settings)
- Calendar grid component
- Icon replacements (SVG stroke styles, new icons)
- Light theme removal or restyle (keep `[data-theme="light"]` as-is)

## Capabilities

### New Capabilities
None — purely visual foundation, no new behavioral contract.

### Modified Capabilities
None — existing specs (connections, content-calendars, report-history, spinner-component) keep identical requirements. Only presentation changes.

## Approach

1. Replace `:root` variables in `frontend/src/styles/index.css` — new palette, remove accent colors, add electric blue token
2. Add `@import` for Inter, JetBrains Mono, and Bebas Neue via `index.html` `<link>` or CSS `@import`
3. Define new type scale classes and update `font-family` declarations
4. Add scrollbar, selection, and focus-visible overrides
5. Create noise overlay via `body::after` with `filter: url(#grain)` using inline SVG
6. Update `.app-shell`, `.app-sidebar`, `.sidebar-link`, `.panel` to use thin borders, remove shadows, add monospaced labels

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `frontend/src/styles/index.css` | Modified | Replace all token values, add new ones |
| `frontend/index.html` | Modified | Add font preloads, inline SVG grain filter |
| `frontend/src/pages/App.tsx` | Modified | Sidebar/nav class changes, monospaced labels |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Light theme broken | Low | Keep existing `[data-theme="light"]` block unchanged |
| Font loading flash (FOUT) | Med | Preload fonts in `<head>`, use `font-display: swap` |
| Noise overlay perf on low-end | Low | Use CSS filter, not JS; add `will-change: transform` |

## Rollback Plan

Revert the five files changed (`index.css`, `index.html`, `App.tsx`). If font imports cause issues, comment out `<link>` tags — tokens still work with fallback fonts. Duration: ~5 min.

## Dependencies

- Google Fonts / CDN for Inter, JetBrains Mono, Bebas Neue (or self-host via `@fontsource` packages)

## Success Criteria

- [ ] All `--md-sys-color-*` green/pink/orange/lavender tokens removed from `:root`
- [ ] `--color-accent: #00d4ff` only appears in focus, active, selected states
- [ ] Sidebar and panels show thin (`1px solid`) borders, zero `box-shadow`
- [ ] Noise grain overlay visible on body background
- [ ] Monospaced font renders on sidebar labels and metadata
- [ ] Light theme is visually unchanged
