# Serenita Design System

Design tokens, layout system, component patterns, and theming for Serenita — a Material Design 3-inspired system customized for institutional reporting dashboards.

## CSS Custom Properties as Design Tokens

All tokens are defined in `src/styles/index.css`. The system follows MD3 naming conventions with semantic aliases for convenience.

### Naming Convention

```
--md-sys-color-{role}-{variant}
--md-sys-typescale-{size}-{weight}
--md-sys-shape-corner-{name}
```

### Core Token Layers

1. **Raw palette** — `--md-sys-color-primary`, `--md-sys-color-surface`, etc. (Material 3 baseline)
2. **Semantic aliases** — `--bg`, `--bg-alt`, `--panel`, `--card`, `--line`, `--text`, `--text-secondary`, `--text-disabled`, `--icon`, `--overlay`, `--shadow`
3. **Component tokens** — `--button-primary-bg`, `--card-bg`, `--input-bg`, `--sidebar-bg`, `--sidebar-width`
4. **Accent colors** — `--accent-green` (#50e3c2), `--accent-blue` (#a8c7fa), `--accent-pink` (#ff77c0), `--accent-orange` (#ff8a5b), `--accent-lavender` (#b9b7ff)

### Using tokens

```css
/* Always prefer semantic tokens */
.panel {
  background: var(--panel);
  border: 1px solid var(--line);
}

/* Use accent for data viz, badges, metric highlights */
.metric-value {
  color: var(--accent-green);
}
```

## Theme System

- **Dark** is the default theme (no `data-theme` attribute needed).
- **Light** is activated via `<html data-theme="light">`.
- The light theme overrides `--md-sys-color-*` tokens and cascades to all semantic aliases automatically.
- **No class-based toggling** — use the `data-theme` attribute on `<html>`.

```tsx
// Toggle example
document.documentElement.setAttribute(
  "data-theme",
  document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light"
);
```

## Layout System

### App Shell

A vertical flex column occupying the full viewport:

```
.app-shell
├── nav-bar          → fixed top bar (hamburger + branding + actions)
└── .app-content
    ├── sidebar      → collapsible side panel
    │   └── .sidebar-inner
    └── main         → scrollable content area
```

- Sidebar has a collapsed state via `.sidebar-collapsed` on `.app-content`.
- `--sidebar-width` custom property controls the open width (~260px). Collapsed is 0.
- `nav-bar` height is controlled via `--nav-bar-height`.

### Login Shell

A centered card layout for authentication:

```html
<div class="login-shell">
  <form class="login-card">...</form>
</div>
```

- Vertically and horizontally centered.
- Card has max-width and the logo sits above the form.

### Panel

The primary content grouping element. Used both in the sidebar (navigation panels) and main area (content panels).

```html
<div class="panel">
  <div class="panel-header">
    <h2>Title</h2>
  </div>
  <div class="panel-content">
    <!-- content -->
  </div>
</div>
```

Variants:
- `.panel.inset` — nested panel within another panel (smaller padding, thinner border)
- `.panel-primary` — uses primary color for header accent

### Section Title

A simple `<h2>` with bottom margin and accent underline.

```tsx
<SectionTitle>Métricas clave</SectionTitle>
```

Renders as `<h2 class="section-title">`.

## Component Patterns

### Buttons

Class-based, three variants:

| Class                | Usage                        |
|----------------------|------------------------------|
| `btn-primary`        | Primary action, filled bg    |
| `btn-secondary`      | Secondary action, outlined   |
| `btn-ghost`          | Tertiary action, no border   |

Consistent padding, border-radius, font-size across all variants. Use `btn-ghost` for icon-only buttons (set `padding` to a square value).

### Cards

Multiple card types distinguished by class:

| Class                    | Purpose                               |
|--------------------------|---------------------------------------|
| `.metric-card`           | Single KPI, large number + label      |
| `.insight-card`          | Commentary block, quoted text         |
| `.suggestion-card`       | Actionable recommendation + CTA       |
| `.publication-card`      | Publication ranking, metrics grid     |
| `.gender-card`           | Gender-demography single stat         |

**MetricCard component** (`MetricCard.tsx`):
```tsx
<MetricCard label="Total seguidores" value="2,847" variant="default" />
```
- Renders a `.metric-card` with a `value` display and `label` caption.
- Optional `accent` prop maps to `accent-green`, `accent-blue`, etc.
- `variant` controls size: `"default"` or `"compact"`.

**PublicationCard component** (`PublicationCard.tsx`):
```tsx
<PublicationCard publication={topPublicacion} />
```
- Cycles accent colors: blue → pink → orange → green → lavender.
- Creates a dynamic CSS columns grid: `.columns-1` through `.columns-5`.
- Each metric in the grid uses `accent-{color}` for its value text.

### Field Grid

A two-column layout for label-value pairs, typically inside panels:

```html
<div class="field-grid">
  <div class="field">
    <span class="field-label">Nombre</span>
    <span class="field-value">Cliente S.A.</span>
  </div>
  <div class="field">
    <span class="field-label">Periodo</span>
    <span class="field-value">Enero 2026</span>
  </div>
</div>
```

Each `.field` is a vertical stack (label above, value below). In wide viewports the grid becomes two columns.

### Segmented Control

Tab-like horizontal selector:

```html
<div class="segmented-control">
  <button class="segmented-option active">Redes</button>
  <button class="segmented-option">Web</button>
  <button class="segmented-option">TV</button>
</div>
```

- `.segmented-option.active` is visually highlighted.
- Used for view switching within a panel.

### Accent Colors (cycle pattern)

When rendering a list of items that need distinct accent colors, cycle through the array in this order:

```ts
const accentCycle = ["blue", "pink", "orange", "green", "lavender"] as const;
```

Applied as CSS class: `accent-blue`, `accent-pink`, etc. The class sets color and `--accent-current` so child elements can inherit it.

The `accent-gray` class is available for empty/fallback states.

## Preview / PDF Styling

The report preview lives inside a `.report-preview` wrapper. Inside it:

```
.report-preview
├── .report-page          → each A4-mimicking page
│   ├── cover slides      → metric, audience, gender sections
│   ├── .metric-grid      → metric-card grid
│   ├── .audience-grid    → demographic bars
│   └── .gender-chart     → side-by-side gender cards
```

- `.report-page` has print-oriented dimensions (21cm x 29.7cm) and page-break rules.
- PDF-specific overrides are in `@media print` blocks inside `index.css`.
- The `ReportPreview` component wraps content and exposes `ref` for `html2canvas` capture.

## Responsive Breakpoints

| Breakpoint | Target         |
|------------|----------------|
| ≤ 1280px   | Laptop         |
| ≤ 960px    | Tablet         |
| ≤ 720px    | Mobile         |

Mobile-first adjustments: sidebar auto-collapses, panels stack vertically, field grids become single column, segmented controls wrap.

## SVG Icons

Icons are inlined as SVG `<svg>` elements inside components (not external files). Found in `AppShell.tsx` (`NavIcon` component):

- Standard viewBox is `0 0 24 24`.
- Stroke-based icons use `stroke="currentColor"` so they inherit `color`.
- Fill-based icons use dedicated `<path>` fills.
- Size is controlled via `width`/`height` props or CSS on the `<svg>`.
- Use `aria-hidden="true"` for decorative icons, `role="img"` with `<title>` for informative ones.

### Icon Naming Pattern

```tsx
// Decorative
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
  <path d="..." stroke="currentColor" strokeWidth="2" />
</svg>

// Informative
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" role="img" aria-label="Settings">
  <title>Settings</title>
  <path d="..." />
</svg>
```

## Common Patterns

### Keyboard / Focus

- Sidebar menu items show a focus ring (`outline: 2px solid var(--accent-green)`) when focused.
- `:focus-visible` is preferred over `:focus` for keyboard-only outlines.
- All interactive elements (`button`, `a`, input) get `outline-offset: 2px`.

### Transitions

- Sidebar uses `transition: width 0.2s ease, padding 0.2s ease;`.
- Theme changes are instant (no transition on `--md-sys-color-*` changes — avoids flash).
- Button hover states use `opacity` or `filter: brightness(1.1)` for consistency across themes.

### Spacing

- Panel padding: 20px
- Card padding: 16px
- Gap between grid items: 12px
- Section spacing (between panels): 24px

## Color Reference

| Accent     | Hex       | Usage                                  |
|------------|-----------|----------------------------------------|
| Green      | `#50e3c2` | Primary accents, positive metrics      |
| Blue       | `#a8c7fa` | Publication rank 1, secondary highlights|
| Pink       | `#ff77c0` | Publication rank 2, campaign data      |
| Orange     | `#ff8a5b` | Publication rank 3, warnings           |
| Lavender   | `#b9b7ff` | Publication rank 4-5, supplementary    |
