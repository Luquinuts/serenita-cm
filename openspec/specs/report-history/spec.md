# Report History Specification

## Purpose

The Report History section displays previously generated PDF reports for
review and download.

## Requirements

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
