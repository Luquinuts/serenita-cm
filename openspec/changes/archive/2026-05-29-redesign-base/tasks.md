# Tasks: Redesign Base — Cyber-Noir Design System (Layer 1)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~90-120 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

Not needed — single PR well under 400-line budget. Pure CSS/HTML value replacements and additions across 2 files.

## Phase 1: Design Tokens & Typography

- [x] 1.1 Replace `:root` color values in `frontend/src/styles/index.css` — cyber-noir palette (#0a0a0a surface-dim, #242424 card, #333333 outline, etc.)
- [x] 1.2 Set `--md-sys-color-primary` to `#00d4ff`, repurpose `--accent-green` → primary, set `--accent-pink`/`--accent-orange`/`--accent-lavender` → `transparent`
- [x] 1.3 Add elevation tokens (`--elevation-1`, `--elevation-2`) and `--glow-blue` token to `:root`
- [x] 1.4 Add font-family tokens (`--font-heading`, `--font-body`, `--font-mono`) and type scale tokens to `:root`
- [x] 1.5 Add Google Fonts preconnect + `<link>` tags for Inter, JetBrains Mono, Bebas Neue in `frontend/index.html` `<head>`
- [x] 1.6 Update `body` font-family in `index.css` to `var(--font-body)` (Inter)

## Phase 2: Base CSS Additions

- [x] 2.1 Add custom scrollbar styles in `index.css` (6px, dark, flat)
- [x] 2.2 Add `::selection` rule with electric blue (`rgba(0,212,255,0.3)`) background
- [x] 2.3 Update `:focus-visible` outline styles to `2px solid var(--accent)`
- [x] 2.4 Add `body::after` noise/grain overlay via inline SVG data URI `background-image`

## Phase 3: Layout Shell Updates

- [x] 3.1 Update `.app-shell` with 1px solid `var(--line)` border, no border-radius
- [x] 3.2 Update `.app-sidebar` border to `1px solid var(--line)`, background to `var(--bg)`
- [x] 3.3 Update `.panel` to `1px solid var(--line)` border, `2px` border-radius, no shadow
- [x] 3.4 Update `.section-title` and `.workspace-title` to use `var(--font-heading)` (Bebas Neue) with uppercase

## Phase 4: Light Theme & Verification

- [x] 4.1 Update `[data-theme="light"]` block with industrial gray surfaces (dim: #e8e8e8, on-surface: #111111, etc.)
- [ ] 4.2 Visual verify: inspect `:root` computed styles in DevTools match spec values
- [ ] 4.3 Visual verify: typography renders — Inter on body, JetBrains Mono on sidebar, Bebas Neue on headings
- [ ] 4.4 Visual verify: `body::after` noise overlay visible, scrollbar dark/thin, selection electric blue
- [ ] 4.5 Visual verify: `.panel` has `1px solid` border with no border-radius, `.app-sidebar` has thin border
- [ ] 4.6 Visual verify: light theme `[data-theme="light"]` renders without broken tokens
