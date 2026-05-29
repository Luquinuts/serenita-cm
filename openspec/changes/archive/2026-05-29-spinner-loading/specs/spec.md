# Delta: Loading States UX Polish

Improves visual feedback across sections by replacing text-only loading
indicators with the animated Spinner component.

## ADDED Requirements

### Requirement: CalendarSection loading

The CalendarSection MUST show a centered Spinner during calendar list fetch
and during calendar detail/item fetch. The Spinner replaces the empty grid
area to indicate active loading.

#### Scenario: Initial list load

- GIVEN a user opens CalendarSection
- WHEN calendars are being fetched
- THEN a centered Spinner with `label="Cargando calendarios"` is shown
- AND the grid area is empty (no stale data shown)

#### Scenario: Calendar detail load

- GIVEN a user has an active calendar and selects a different one
- WHEN the new calendar's details are being fetched
- THEN a centered Spinner replaces the grid content
- AND the sidebar still shows the calendar list

#### Scenario: Load completes

- GIVEN a Spinner is showing
- WHEN data finishes loading
- THEN the Spinner is removed
- AND the calendar grid renders with data

### Requirement: ConnectionsSection loading

The ConnectionsSection MUST replace the text-only "Cargando conexiones..."
with a Spinner alongside the text.

#### Scenario: Loading state

- GIVEN a user opens ConnectionsSection
- WHEN connections are being fetched
- THEN a Spinner with `label="Cargando conexiones..."` is shown
- AND the text "Cargando conexiones..." is visible beside it

#### Scenario: Load completes

- GIVEN the Spinner + text is showing
- WHEN data finishes loading
- THEN the Spinner and loading text are removed
- AND the connection list renders

### Requirement: ReportHistorySection loading

The ReportHistorySection MUST replace the text-only "Buscando reportes
guardados..." with a Spinner.

#### Scenario: Loading state

- GIVEN a user opens ReportHistorySection
- WHEN saved reports are being fetched
- THEN a Spinner with `label="Buscando reportes guardados..."` is shown

#### Scenario: Load completes

- GIVEN the Spinner is showing
- WHEN data finishes loading
- THEN the Spinner is removed
- AND the report history list renders
