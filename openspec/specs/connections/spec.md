# Connections Specification

## Purpose

The Connections section manages social media platform connections (Instagram, etc.)
and their OAuth authentication status.

## Requirements

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
