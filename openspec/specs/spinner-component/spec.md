# Spinner Component Specification

## Purpose

A reusable animated loading indicator. Pure CSS, zero dependencies, follows
design tokens, accessible via `aria-label` and visually-hidden text.

## Requirements

### Requirement: Render sizes

The Spinner MUST render at exactly 16px (`sm`), 24px (`md`), or 40px (`lg`).
The default SHALL be `md` when no size prop is provided.

#### Scenario: Default size is md

- GIVEN a `<Spinner />` without size prop
- WHEN the component renders
- THEN the element measures 24×24px

#### Scenario: All three sizes

- GIVEN size="sm" → renders at 16×16px
- GIVEN size="md" → renders at 24×24px
- GIVEN size="lg" → renders at 40×40px

### Requirement: Accessible label

The Spinner MUST accept a `label` prop rendered as `aria-label` on the
animated element AND as `<span className="sr-only">` for screen readers.

#### Scenario: Label renders in both forms

- GIVEN `<Spinner label="Cargando calendarios" />`
- WHEN the component renders
- THEN the root element has `aria-label="Cargando calendarios"`
- AND a visually-hidden span contains "Cargando calendarios"

#### Scenario: No label omits aria

- GIVEN `<Spinner />` without label
- WHEN the component renders
- THEN no `aria-label` is set
- AND no sr-only span is rendered

### Requirement: Design token color

The spinner arc MUST use `var(--md-sys-color-primary)` so it adapts to both
light and dark themes automatically.

#### Scenario: Dark theme adapts

- GIVEN the app is in dark mode
- WHEN the Spinner renders
- THEN the arc color matches the primary token value for dark theme

### Requirement: Optional className

The Spinner SHOULD accept a `className` prop merged onto the root element
for layout overrides (margin, centering).

#### Scenario: Custom className applied

- GIVEN `<Spinner className="mx-auto" />`
- WHEN the component renders
- THEN the root element includes both `spinner` and `mx-auto` classes

### Requirement: Pure CSS animation

The animation MUST use CSS `@keyframes` only. No JavaScript animation
libraries, GIFs, or SVGs allowed.

#### Scenario: Animation plays on mount

- GIVEN a Spinner is rendered
- WHEN observed in the DOM
- THEN the element has a `@keyframes` spin animation running
- AND no external JS animation library is loaded
