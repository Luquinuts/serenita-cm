# Toggle Switch Specification

## Purpose

A CSS-only toggle/switch component for binary on/off settings, styled with cyber-noir tokens. Pure CSS, keyboard accessible, supports disabled and labelled states.

## Requirements

### Requirement: Binary states

The Toggle MUST render as an inline-block track with a circular thumb and MUST display two states: checked (on) and unchecked (off). The checked state SHOULD use `var(--md-sys-color-primary)` for the track, and the unchecked state SHOULD use a transparent/subtle gray track.

#### Scenario: Checked renders with primary color

- GIVEN a Toggle with `aria-checked="true"`
- WHEN the component renders
- THEN the track background matches `var(--md-sys-color-primary)`
- AND the thumb is positioned at the right end of the track

#### Scenario: Unchecked renders as gray

- GIVEN a Toggle with `aria-checked="false"`
- WHEN the component renders
- THEN the track has a transparent or subtle gray background
- AND the thumb is positioned at the left end of the track

### Requirement: Smooth transition

The Toggle SHOULD transition between checked and unchecked states over `var(--transition-base)` (0.2s ease).

#### Scenario: Transition animates on state change

- GIVEN a Toggle in unchecked state
- WHEN `aria-checked` changes to `"true"`
- THEN the thumb position and track color animate over 0.2s
- AND no sudden jumps occur

### Requirement: Keyboard accessible

The Toggle MUST use `role="switch"` and `aria-checked`. It MUST be focusable via Tab and togglable via Space or Enter. A `:focus-visible` ring MUST appear when focused via keyboard.

#### Scenario: Keyboard navigation

- GIVEN a Toggle in the document
- WHEN the user presses Tab to focus it
- THEN a `:focus-visible` ring (2px solid `var(--md-sys-color-primary)`) is visible
- AND pressing Space or Enter toggles `aria-checked`

#### Scenario: Focus ring hidden on click

- GIVEN a Toggle
- WHEN the user clicks it with a mouse
- THEN no `:focus-visible` ring appears

### Requirement: Disabled state

The Toggle MUST support a disabled state with reduced opacity (0.4) and MUST NOT respond to clicks or keyboard toggling.

#### Scenario: Disabled toggle is inert

- GIVEN a Toggle with `aria-disabled="true"`
- WHEN the user clicks or presses Space/Enter
- THEN `aria-checked` does not change
- AND the component renders at 0.4 opacity

### Requirement: Label support

The Toggle SHOULD support a label placed to the left or right of the track, clickable to toggle the switch.

#### Scenario: Label toggles the switch

- GIVEN a Toggle with an associated `<label>`
- WHEN the user clicks the label text
- THEN `aria-checked` toggles
