# Skeleton Loader Specification

## Purpose

A pulsing placeholder block for content loading states. Multiple shapes, GPU-composited shimmer animation, accessible via `aria-hidden`.

## Requirements

### Requirement: Shimmer animation

The Skeleton MUST render a pulsing gradient animation (shimmer) that travels across the placeholder surface. The animation MUST use `opacity` and `transform` only to remain GPU-composited.

#### Scenario: Shimmer plays on render

- GIVEN a Skeleton block in the DOM
- WHEN observed
- THEN a diagonal gradient animates from left to right
- AND the animation uses only `opacity` / `transform` properties

### Requirement: Three shapes

The Skeleton MUST support three shape variants via a `shape` prop or class: `text-line` (full-width rounded bar), `rectangle` (custom aspect ratio), and `circle` (equal width/height, 50% border-radius).

#### Scenario: Text line renders

- GIVEN a Skeleton with shape="text-line"
- WHEN it renders
- THEN it is a full-width bar with small border-radius

#### Scenario: Circle renders

- GIVEN a Skeleton with shape="circle"
- WHEN it renders
- THEN it has equal width and height
- AND border-radius is 50%

### Requirement: Custom dimensions

The Skeleton SHOULD accept custom width and height via CSS custom properties `--skeleton-width` and `--skeleton-height`, defaulting to 100% and 1em respectively.

#### Scenario: Custom size applied

- GIVEN a Skeleton with `style="--skeleton-width: 80px; --skeleton-height: 80px"`
- WHEN it renders
- THEN the element measures 80×80px

### Requirement: Screen-reader hidden

The Skeleton MUST set `aria-hidden="true"` so assistive technology ignores it during loading.

#### Scenario: Aria hidden

- GIVEN a rendered Skeleton
- THEN the root element has `aria-hidden="true"`

### Requirement: Inline usage

The Skeleton SHOULD be usable inline within existing section layouts without breaking layout flow.

#### Scenario: Inline within a card

- GIVEN a `<div class="metric-card">` containing a Skeleton
- WHEN the card renders
- THEN the Skeleton occupies the same space as the eventual content
- AND adjacent elements are not displaced
