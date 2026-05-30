## Exploration: UI Components, Sections, and Micro-interactions

### Current State

The frontend uses a custom CSS design system in `frontend/src/styles/index.css` (~2500 lines) with cyber-noir tokens already applied (Layer 1). The system has:

- **Semantic tokens**: `--bg`, `--panel`, `--card`, `--line`, `--text`, `--accent` etc., all based on a dark cyber-noir palette with cyan (`#00d4ff`) as primary
- **Typography**: Bebas Neue (headings), Inter (body), JetBrains Mono (metadata) — defined globally
- **Layout**: app-shell with collapsible sidebar + main content area
- **Shape**: sharp 2px corners as the default (`--md-sys-shape-corner-small/medium/large: 2px`)
- **Transitions**: Metalab-inspired 0.15s/0.2s/0.3s tokens already in place
- **Sidebar**: liquid glass with `backdrop-filter: blur(40px)`, blue glow hover states (Raycast-inspired)

However, the existing design was layered over an older MD3-style system with "Google Sans" fonts and rounded corners still present in many areas. Many component patterns are missing entirely.

### Affected Areas

- `frontend/src/styles/index.css` — main CSS file (2512 lines) — all component/section/micro-interaction styles
- `frontend/src/components/Spinner.tsx` — loading spinner (good shape, needs no changes)
- `frontend/src/components/MetricCard.tsx` — metric display card
- `frontend/src/components/PublicationCard.tsx` — publication ranking card
- `frontend/src/components/ReportPreview.tsx` — report preview compound component
- `frontend/src/components/SectionTitle.tsx` — section heading (trivial)
- `frontend/src/components/DoughnutChart.tsx` — gender chart SVG
- `frontend/src/sections/ConnectionsSection.tsx` — connections page (306 lines)
- `frontend/src/sections/AiAssistantSection.tsx` — AI query page (181 lines)
- `frontend/src/sections/ReportGeneratorSection.tsx` — report generation form (657 lines)
- `frontend/src/sections/ReportHistorySection.tsx` — report history (169 lines)
- `frontend/src/modules/calendars/components/CalendarSection.tsx` — calendar grid (548 lines)
- `frontend/src/modules/calendars/lib/calendarUtils.ts` — calendar utility colors
- `frontend/src/routes/AppShell.tsx` — app shell with inline Settings section (232 lines)

### Layer 1: Components — Detailed Analysis

#### Buttons (`.button`, `.button-primary`, `.button-secondary`, `.button-ghost`)
**Status**: ✅ Mostly done, minor issues
- **Good**: Uses cyber-noir tokens (`--md-sys-color-primary`, `--md-sys-color-on-surface-variant`), correct font (Inter via `--font-body`), hover states defined for all variants, disabled state with `opacity: 0.6`, `backdrop-filter` on primary/secondary
- **Issues**:
  - `border-radius: 4px` instead of the cyber-noir standard `2px`
  - `.button-base` state-layer hover overlaps with variant-specific hovers (adds a gradient overlay)
  - No `:active` state defined for any variant
  - `.button.small` variant exists but no `:focus-visible` specifically for `.button.small`
  - **Effort**: Low (adjust border-radius to 2px, add active states)

#### Inputs / Selects / Textareas (`.field input`, `.field select`, `.field textarea`)
**Status**: ⚠️ Needs work
- **Good**: Uses tokens (`--md-sys-color-on-surface`), 2px border-radius ✓, cyber-noir dark backgrounds, correct on-focus border color (cyan)
- **Issues**:
  - `outline: none` on focus removes accessibility — no `:focus-visible` fallback for inputs
  - Error state (`field small`) hardcodes `#c45858` instead of using a semantic token
  - No disabled input styling (grayed out / non-interactive)
  - No placeholder styling (uses browser default)
  - **Effort**: Medium

#### Toggles / Checkboxes / Switches
**Status**: ❌ **Missing entirely**
- No `.toggle`, `.checkbox`, `.switch` classes or React components exist anywhere
- Settings page uses a segmented control instead of a toggle for theme switching
- **Effort**: Medium (new component needed)

#### Badges / Tags / Chips
**Status**: ❌ **No unified component**, scattered ad-hoc patterns
- Existing badge-like elements:
  - `.content-type-badge` (calendar) — `border-radius: 999px` (pill, not 2px cyber-noir)
  - `.calendar-status-badge` (calendar) — `border-radius: 999px`, hardcoded colors
  - `.hud-badge` (general) — `border-radius: 2px` ✓ but uses direct rgba colors
  - `.connection-status` (connections) — `border-radius: 999px`, hardcoded `#50e3c2`
  - `.platform-pill` (report preview) — `border-radius: 999px`
- No consistent badge/tag/chip pattern
- **Effort**: Medium (design standard + refactor existing instances)

#### Tooltips / Popovers
**Status**: ❌ **Missing entirely**
- No tooltip or popover implementation
- Calendar color options, connection status, and various truncated text would benefit from tooltips
- **Effort**: Medium (new component)

#### Segmented Controls (`.segmented-control`)
**Status**: ✅ Good, minor polish
- Uses 2px border-radius ✓, thin border ✓, cyan active state
- Inline-grid layout works well
- **Issues**:
  - No hover state on individual buttons
  - `.active` uses `--md-sys-color-on-primary` = `#000000` (black text on active) — unusual contrast
  - No transition animation when switching active state
  - **Effort**: Low

#### Cards (`.metric-card`, `.insight-card`, `.suggestion-card`, `.publication-card`, `.gender-card`, `.empty-card`)
**Status**: ⚠️ Inconsistent
- **Good**: Use `--card` background, 2px corner tokens
- **Issues**:
  - `border: 1px solid transparent` — no visible border on cards until hover
  - No hover state for metric/insight/suggestion/gender cards
  - `.metric-value`, `.publication-order`, `.suggestion-step`, `.gender-stats strong`, `.publication-title` use "Google Sans" font stack instead of Bebas Neue
  - **Effort**: Medium

#### Spinner (`.spinner`)
**Status**: ✅ Good
- Clean CSS with `--md-sys-color-primary` accent
- React component with `sm/md/lg` sizes, `role="status"`, optional label
- `.spinner-center` wrapper for centered display
- **Effort**: None

### Layer 2: Sections — Detailed Analysis

#### Calendar Section (`CalendarSection.tsx`)
**Status**: ⚠️ Needs polish
- **Good**: Uses `.fields`, `.button` variants, `.segmented-control`, `.spinner` correctly
- **Issues**:
  - `.calendar-day` has no hover state (cells are interactive via the "+" button and pills)
  - `.calendar-item-pill` uses `color-mix()` for backgrounds — modern but no defined hover state
  - `.calendar-day.muted` uses `opacity: 0.52` instead of a proper faded token
  - `.calendar-status-badge` uses hardcoded colors (`#50e3c2`, `#71a8ff`, `#f6c85f`)
  - `.content-type-badge` uses `border-radius: 999px` (pill)
  - Color options in `calendarUtils.ts` are hardcoded hex values (`#2dd4bf`, `#60a5fa`, etc.)
  - Disabled state overlay is functional but plain
  - **Effort**: Medium

#### Report Generator (`ReportGeneratorSection.tsx`)
**Status**: ⚠️ Functional but rough
- **Good**: Full CRUD for publications, metrics, audience, insights, suggestions
- Uses `.field`, `.field-grid`, `.button` variants consistently
- Form validation with error messages
- **Issues**:
  - Status message is just text (`<p className="status-line">`) — no visual indicator for success/error
  - Loading state during PDF generation is just text "Generando PDF..."
  - `.brand-block h1` uses "Google Sans" instead of Bebas Neue
  - `.form-section h2` also uses "Google Sans"
  - No visual feedback when fields validate successfully
  - **Effort**: Medium

#### Connections (`ConnectionsSection.tsx`)
**Status**: ⚠️ Needs attention
- **Good**: Lists connections with status badges, uses `.button` variants, `.field` inputs
- **Issues**:
  - `.connection-status` uses `border-radius: 999px` (pill)
  - `.connection-status.activa` hardcodes `#50e3c2` — should use `--md-sys-color-primary`
  - `.connection-status.expirada` hardcodes `#ff8c8c` — no token for error
  - Empty state is just text: "Todavia no hay cuentas de Instagram conectadas."
  - No visual hierarchy between OpenAI/Gemini status and Instagram connections
  - **Effort**: Medium

#### AI Assistant (`AiAssistantSection.tsx`)
**Status**: ⚠️ Smaller issues
- **Good**: Uses `.segmented-control` for provider toggle, `.field` for textarea, `.button` variants
- **Issues**:
  - `.ai-answer` uses `border-radius: 8px` — inconsistent with 2px standard
  - `.ai-answer` uses `--card` background with `border-radius: 8px` (should be 2px)
  - Status indicator reuses `.connection-status` with 999px pill shape
  - **Effort**: Low

#### Settings Page (inline in `AppShell.tsx`)
**Status**: ✅ Minimal but clean
- Theme toggle via segmented control (works well)
- Privacy policy + data deletion links
- **Issues**:
  - No actual toggle/switch component (uses segmented control for binary choice)
  - Settings are hardcoded inline, not extracted to a real section
  - **Effort**: Low

### Layer 3: Micro-interactions — Detailed Analysis

#### Page Transitions
**Status**: ❌ **Missing entirely**
- Sections swap immediately via conditional rendering (`{resolvedSection === "reports" ? <ReportGeneratorSection /> : null}`)
- No fade, slide, or any transition animation when switching sections
- No route-based animations
- **Effort**: Medium

#### Loading States / Skeletons
**Status**: ❌ **Only basic spinner**
- Only loading indicator is `<Spinner />` with a text label
- No skeleton/shimmer/placeholder patterns anywhere
- Calendar grid and connections lists drop into empty state while loading
- No Suspense boundaries or lazy loading placeholders
- **Effort**: Medium (can start with CSS shimmer + skeleton containers)

#### Focus Rings
**Status**: ⚠️ Partial
- **Good**: Global `:focus-visible` with 2px cyan outline + offset ✓
- Specific overrides for sidebar links, buttons, and segmented controls ✓
- **Issues**:
  - Inputs explicitly remove outline on focus (`outline: none` on line 1057) with no `:focus-visible` fallback
  - `.calendar-day-header` button has no focus-visible styling
  - `.calendar-color-options button` has no focus-visible styling
  - Modal backdrop buttons have no focus-visible styling
  - **Effort**: Low

#### Empty States
**Status**: ⚠️ Functional but basic
- Existing empty states:
  - Connections: text message
  - Calendar sidebar: "Todavia no hay calendarios."
  - History: "Todavia no hay reportes guardados..."
  - Report preview: `<article className="empty-card">` for insights/suggestions
- **Issues**:
  - All are plain text with no icon, illustration, or animation
  - No CTA guidance in most empty states
  - `.empty-card` is minimal (centered text, no visual interest)
  - **Effort**: Low-Medium

#### Hover States
**Status**: ✅ Mostly covered, some gaps
- **Defined**: buttons (all 3 variants), sidebar links with blue glow, history cards, connection rows, calendar cards, settings rows, menu module cards
- **Missing**:
  - Calendar day cells (`.calendar-day`)
  - Calendar item pills (`.calendar-item-pill`)
  - Segmented control individual buttons
  - Card types (metric-card, insight-card, suggestion-card — no hover defined)
  - Modal buttons (`.content-item-modal .button`)
  - **Effort**: Low

### Font Inconsistencies Summary

Several components still use "Google Sans" / "Product Sans" font stack instead of the cyber-noir fonts:

| Location | Current Font | Should Be |
|----------|-------------|-----------|
| `.metric-value` | Google Sans | Bebas Neue or Inter Bold |
| `.publication-order` | Google Sans | Bebas Neue |
| `.suggestion-step` | Google Sans | Bebas Neue |
| `.gender-stats strong` | Google Sans | Bebas Neue or Inter Bold |
| `.publication-title` | Google Sans | Bebas Neue or Inter |
| `.publication-metric strong` | Google Sans | Bebas Neue or Inter Bold |
| `.brand-block h1` | Google Sans | Bebas Neue |
| `.form-section h2` | Google Sans | Bebas Neue |
| `.report-account` | Google Sans | Bebas Neue |
| `.report-period` | Google Sans | Bebas Neue |
| `.menu-module-card strong` | Google Sans | Bebas Neue |
| `.module-card strong` | Google Sans | Bebas Neue |
| `.info-row strong` | Google Sans | Inter Bold |

### Color Hardcodes Summary

| Location | Hardcoded Color | Should Use |
|----------|----------------|------------|
| `--accent-pink` | `transparent` | `#ff77c0` or similar |
| `--accent-orange` | `transparent` | `#ff8a5b` or similar |
| `--accent-lavender` | `transparent` | `#b9b7ff` or similar |
| `.connection-status.activa` | `#50e3c2` | `--md-sys-color-primary` |
| `.connection-status.expirada` | `#ff8c8c` | new error token |
| `.calendar-status-badge.publicado` | `#50e3c2` | `--md-sys-color-primary` |
| `.calendar-status-badge.aprobado` | `#71a8ff` | `--accent-blue` |
| `.calendar-status-badge.en_progreso` | `#f6c85f` | new warning token |
| `field small` (error) | `#c45858` | new error token |
| `login-error` | `#ff8c8c` | new error token |
| DoughnutChart pink | `#e963b0` | `--accent-pink` |
| DoughnutChart blue | `#2e8df6` | `--accent-blue` |

### Approaches

1. **Layer-by-layer incremental polish** — fix components first, then sections, then micro-interactions
   - Pros: Manageable scope per PR, can ship early wins (buttons, focus rings), clear dependency order
   - Cons: Multiple PRs, section fixes may need to revisit component styles
   - Effort: Medium (3-4 PRs at 400 lines each)

2. **All-in-one monolith PR** — fix everything across all 3 layers in one shot
   - Pros: Single coordinated pass, no rework across layers, consistent outcome
   - Cons: Very large diff (likely 1500+ lines), review nightmare, high risk of bugs
   - Effort: High (single giant PR at ~1500+ lines)

3. **Pattern-first, then sections, then interactions** — create missing components (toggles, badges, tooltips) as reusable patterns, then update sections, then add animations
   - Pros: Clean foundation-first approach, sections benefit instantly from new patterns, animations are the last polish layer
   - Cons: Pattern creation needs upfront design decisions before any visible user improvement
   - Effort: Medium (3 PRs: patterns → sections → interactions)

### Recommendation

**Approach 1: Layer-by-layer incremental polish**, structured as 4 chained PRs:

1. **PR 1 — Component fixes** (est. ~350-400 lines):
   - Fix border-radius: 4px → 2px on buttons, cards, badges
   - Add input `:focus-visible` (restore outline)
   - Add hover states for calendar days, pills, segmented controls, cards
   - Fix font inconsistencies (Google Sans → Bebas Neue)
   - Fix hardcoded accent colors (set `--accent-pink`, `--accent-orange`, `--accent-lavender` to proper values)

2. **PR 2 — Missing components** (est. ~300-350 lines):
   - Create `.toggle`/`.switch` component
   - Create `.badge` component unifying status/tag/chip patterns → replace ad-hoc `.content-type-badge`, `.connection-status`, `.calendar-status-badge`
   - Create `.tooltip` component (CSS-only or React)
   - Add `.empty-state` component with optional icon and CTA
   - Create skeleton/shimmer component

3. **PR 3 — Section polish** (est. ~400 lines):
   - Update ConnectionsSection: consistent badge usage, color tokens
   - Update AiAssistantSection: fix `.ai-answer` border-radius
   - Update CalendarSection: replace hardcoded colors, add cell hover
   - Update Settings: extract to standalone section, add toggle component
   - Replace all pill-shaped badges with 2px cyber-noir badges
   - Fix remaining border-radius inconsistencies

4. **PR 4 — Micro-interactions** (est. ~250-300 lines):
   - Add fade transition between sections (CSS animation on mount)
   - Add skeleton loading states for calendar grid, connections list
   - Add empty state animations (gentle fade-in)
   - Add input focus-visible across all form fields
   - Add `.button:active` states

### Risks

- **Font swap visibility**: Changing Google Sans → Bebas Neue on multiple elements may shift layout (Bebas Neue is all-caps, different metrics). Must verify no clipping or overflow.
- **Badge refactoring risk**: Replacing `.connection-status` (999px pill) with `.badge` (2px cyber-noir) changes visual identity significantly across Connections and AI sections. Must coordinate with design intent.
- **Toggle creation**: No existing pattern to follow. Need to decide: native checkbox styled vs. custom ARIA switch. Should match the 2px sharp cyber-noir aesthetic.
- **Calendar color system**: Hardcoded hex colors in `calendarUtils.ts` are used for visual distinction (content types). If we replace with design tokens, we lose the semantic distinction between content types. Solution: keep content-type-specific colors but express them as CSS vars.
- **PR budget**: Each PR may approach or exceed the 400-line review budget depending on how many font/color fixes are batched.

### Ready for Proposal

Yes. The orchestrator should tell the user:
- Complete analysis of all 3 layers done
- Recommended approach: **4 chained PRs** (component fixes → missing components → section polish → micro-interactions)
- Each PR is within the ~400-line review budget
- Layer 1 (buttons, inputs, segmented controls) is mostly done with minor fixes
- Layer 2 (sections) is functional but has visual inconsistencies
- Layer 3 (micro-interactions) is the weakest — no page transitions, no skeletons, no tooltips
- Missing components: toggles, badges, tooltips, empty states, skeleton loaders
