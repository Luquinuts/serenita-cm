# Design: Redesign Base — Cyber-Noir Design System (Layer 1)

## Technical Approach

Pure CSS token swap — replace values in `:root` custom properties while keeping every name identical. Components reference `--md-sys-color-*` and `--bg`/`--panel`/`--card` etc., so value changes cascade automatically with zero component edits. Typography via Google Fonts `<link>` in `index.html`, type scale as new custom properties. Noise overlay via `body::after` + inline SVG data URI (zero JS, zero network).

## Architecture Decisions

### Decision: No structural changes to layout shell

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Create `.nav-bar`, `.panel-header` classes | Proposal assumes they exist; adding them would require new HTML in App.tsx + component refactors | ❌ Skip — scope says "no functional changes." Only modify what exists. |
| Only touch token values + layout styles that exist | Zero component risk, pure CSS change | ✅ Stick to existing selectors (`.app-sidebar`, `.panel`, `.app-shell`, `.sidebar-link`, etc.) |

### Decision: Keep accent color classes, repurpose values

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Remove `.accent-green`, `.accent-blue` etc. | Would break metric-card cycling in PublicationCard, MetricCard | ❌ Keep classes, just change `--green` to alias `--md-sys-color-primary` (now blue) |
| Repurpose to transparent/null | `.accent-pink`, `.accent-orange`, `.accent-lavender` become invisible — may hide data | ✅ Accept — these were rank-2+ colors; data viz planned for future layer |

### Decision: Inline SVG noise, no external asset

| Option | Tradeoff | Decision |
|--------|----------|----------|
| External SVG file | Network request, cache concern | ❌ |
| Base64 inline data URI | Zero requests, tiny payload (~400 bytes) | ✅ Used in `body::after` `background-image` |

### Decision: Light theme minimal touch

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Full light theme restyle | Added scope, not requested | ❌ Keep existing `[data-theme="light"]` values; only adjust structural alignments |
| Strip light theme | Could break if user has light mode stored | ❌ Preserve — can remove later |

## Data Flow

↕ Vertical — no runtime data flow

```
index.html  ──→  Google Fonts preconnect + <link>
                        ↓
            :root custom properties (values only, keep names)
                        ↓
   body::after (noise overlay) ←── inline SVG data URI
                        ↓
     Existing component CSS (auto-cascade via var(--...))
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `frontend/src/styles/index.css` | Modify | Replace `:root` color values, add typography tokens, scrollbar, selection, noise, layout border/shadow updates |
| `frontend/index.html` | Modify | Add Google Fonts preconnect + `link` tags for Inter, JetBrains Mono, Bebas Neue |
| `frontend/src/components/Spinner.tsx` | None | Already uses `--md-sys-color-primary` — will auto-cascade to electric blue |
| `frontend/src/pages/App.tsx` | None | No structural changes needed — sidebar/panel layout unchanged |

## Interfaces / Contracts

No new TypeScript contracts. Only CSS custom properties (unchanged names, new values):

```
--md-sys-color-primary:  #00d4ff    (was #3291ff)
--bg:                    #0a0a0a    (was #000000)
--bg-alt:                #121212    (was #080808)
--panel:                 #1e1e1e    (was #0a0a0a)
--card:                  #242424    (was #111111)
--line:                  #333333    (was #242424)
--accent-green:          → #00d4ff  (was #50e3c2)
--pink:                  transparent (was #ff77c0)
--orange:                transparent (was #ff8a5b)
--lavender:              transparent (was #b9b7ff)
```

## Testing Strategy

Visual-only change. No behavioral tests to add.

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Visual | Color tokens render correctly | Load app, inspect `:root` computed styles in DevTools |
| Visual | Typography loads | Check `font-family` on headings (Bebas Neue), body (Inter), code (JetBrains Mono) |
| Visual | Noise overlay visible | `body::after` computed `background-image` check |
| Visual | No regressions on accent classes | Verify `.accent-green` now shows blue, `.accent-pink` is invisible |
| Visual | Light theme unchanged | Set `data-theme="light"`, confirm no broken tokens |

## Migration / Rollout

Single commit. No feature flags, no data migration. Rollback = revert the commit (~5 min).

## Open Questions / Risks

- [x] **No `.nav-bar` or `.panel-header` exist** — the proposal referenced nonexistent selectors. This design skips them. If a nav-bar is wanted, file a follow-up change.
- [ ] **`.accent-pink/orange/lavender` become invisible** — components cycling through the accent array (PublicationCard) will show transparent for ranks 3-5. Accept for this layer; data-viz accent layer can restore colors.
- [ ] **`--shadow` currently undefined** in `:root` but used in `calendar-disabled-overlay`. This means `box-shadow: var(--shadow)` resolves to `none`. The new `--elevation-1/--elevation-2` tokens won't auto-fix this — the overlay needs an explicit update.
