# Calendar Timeless — Change Spec

Change introduces calendars as timeless containers. All requirements are new
for this domain. The canonical spec lives at `openspec/specs/content-calendars/spec.md`.

## ADDED Requirements

### Requirement: Calendar Creation

The system MUST allow creating a calendar with only a name. Month and year
SHALL be optional metadata, not required fields.

#### Scenario: Create calendar without month/year

- GIVEN a user is on the calendar page
- WHEN they click "Nuevo calendario" and submit only a name
- THEN a calendar is created with month=NULL and year=NULL
- AND the calendar appears in the sidebar immediately

#### Scenario: Create calendar with month/year (backward compat)

- GIVEN an API client sends month=5 and year=2026
- WHEN they POST to create a calendar
- THEN the calendar is created with those values preserved as metadata
- AND the calendar behaves identically to one without month/year

### Requirement: Calendar Listing

The system MUST return all non-archived calendars for an organization
regardless of month or year. The list query SHALL NOT filter by period.

#### Scenario: All calendars visible across months

- GIVEN calendars exist with month=NULL, month=5, and month=8
- WHEN a user navigates to any month filter
- THEN all calendars appear in the sidebar list

#### Scenario: Empty org returns no calendars

- GIVEN an organization has no calendars
- WHEN the calendar list endpoint is called
- THEN an empty array is returned

### Requirement: Calendar Display

Calendar cards in the sidebar MUST show the calendar name and status.
They MAY show creation date. They MUST NOT display month or year.

#### Scenario: Card renders without month/year

- GIVEN a calendar with name="Redes Mayo" and status="active"
- WHEN the sidebar renders
- THEN the card shows name and status
- AND no month or year is shown

### Requirement: Backward Compatibility

Existing calendars with month and year values MUST continue working.
Their month/year SHALL be preserved as metadata and MUST NOT affect
visibility or filtering.

#### Scenario: Existing calendar after migration

- GIVEN a calendar with month=5, year=2026 from before migration
- WHEN a user views any month filter
- THEN the calendar appears in all sidebar views
- AND its grid items only appear when month=5 is selected

### Requirement: Grid Filtering

The grid MUST filter items by `scheduled_date` within the selected period.
This behavior is independent of calendar visibility.

#### Scenario: Items respect date filter

- GIVEN a visible calendar with items in different months
- WHEN a user selects month=5
- THEN only items with scheduled_date in May appear in the grid
