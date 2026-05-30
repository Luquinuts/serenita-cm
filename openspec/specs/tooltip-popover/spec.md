# Tooltip / Popover Specification

## Purpose

A CSS tooltip and popover component for supplementary information on hover or click. Cyber-noir glass-morphism surface, viewport-aware positioning, zero JS for show/hide.

## Requirements

### Requirement: Hover tooltip

A tooltip MUST appear when the user hovers over or focuses the trigger element. The tooltip text MUST be set via `data-tooltip` attribute or `aria-label` on the trigger.

#### Scenario: Tooltip appears on hover

- GIVEN an element with `data-tooltip="Filter by date"`
- WHEN the user hovers over the element
- THEN a tooltip with text "Filter by date" appears above the element
- AND the tooltip disappears when the user stops hovering

#### Scenario: Tooltip appears on focus

- GIVEN an element with `data-tooltip="Filter by date"`
- WHEN the element receives keyboard focus
- THEN the tooltip appears
- AND it disappears when the element loses focus

### Requirement: Four positions

The Tooltip SHOULD support four positions via a modifier class: `top` (default), `bottom`, `left`, and `right`.

#### Scenario: Position modifiers

- GIVEN a trigger with `data-tooltip-pos="bottom"`
- WHEN the tooltip is shown
- THEN it appears below the trigger element

### Requirement: Glass-morphism surface

The Tooltip MUST have a dark semi-transparent background, small border-radius (2px), a subtle 1px border, and no shadow.

#### Scenario: Visual styling

- GIVEN a visible tooltip
- THEN its background is `rgba(18, 18, 18, 0.95)`
- AND its border-radius matches `var(--md-sys-shape-corner-small)`
- AND it has a 1px solid `var(--line)` border

### Requirement: Arrow/pointer

The Tooltip SHOULD include a CSS-only arrow pointing toward the trigger element.

#### Scenario: Arrow visible

- GIVEN a visible tooltip positioned above the trigger
- THEN a pseudo-element arrow points downward toward the trigger
- AND the arrow matches the tooltip background

### Requirement: CSS-only show/hide

The Tooltip MUST use `:hover` and `:focus-within` for visibility. The Popover variant MAY use `:target` or optional JS for click-triggered visibility.

#### Scenario: CSS-only — no JS for hover

- GIVEN a trigger-tooltip pair in the DOM
- WHEN inspected
- THEN no JavaScript event listeners control tooltip visibility
- AND visibility is toggled via CSS pseudo-classes only
