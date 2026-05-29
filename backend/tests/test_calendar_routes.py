"""Tests for routes/calendars.py — verifying filter construction in GET."""

from __future__ import annotations

from unittest.mock import AsyncMock, patch

import pytest

from app.routes.calendars import get_calendars


@pytest.mark.asyncio
async def test_get_calendars_no_month_year_filters() -> None:
    """GET /api/calendars must NOT filter by month/year.

    Calendars are timeless containers — all non-deleted calendars
    for the organization must be returned regardless of month/year.
    """
    captured_filters: list[str] = []

    async def capture_select(table: str, filters: str) -> list[dict]:
        captured_filters.append(filters)
        return [{"id": "cal-1"}, {"id": "cal-2"}]

    async def fake_auth_user(_auth: str | None) -> dict:
        return {"id": "user-1", "email": "test@test.com"}

    async def fake_resolve_org(_uid: str, _org_id: str | None = None) -> str:
        return "org-1"

    with (
        patch("app.routes.calendars.get_authenticated_user", new_callable=AsyncMock) as mock_auth,
        patch("app.routes.calendars.resolve_organization_id", new_callable=AsyncMock) as mock_resolve,
        patch("app.routes.calendars.select_records", new_callable=AsyncMock) as mock_select,
    ):
        mock_auth.side_effect = fake_auth_user
        mock_resolve.side_effect = fake_resolve_org
        mock_select.side_effect = capture_select

        result = await get_calendars(authorization="Bearer token")

        # Assert the filter string does NOT contain month= or year=
        assert len(captured_filters) == 1
        filters_str = captured_filters[0]
        assert "month=eq" not in filters_str, "Month filter must NOT be applied"
        assert "year=eq" not in filters_str, "Year filter must NOT be applied"
        # Assert it DOES have the org filter
        assert "organization_id=eq.org-1" in filters_str
        # Assert the ordering is now just updated_at.desc
        assert "order=updated_at.desc" in filters_str
        assert "month.desc" not in filters_str
        assert "year.desc" not in filters_str
        # Assert both calendars are returned
        assert len(result["calendars"]) == 2


@pytest.mark.asyncio
async def test_get_calendars_with_month_year_params_ignored() -> None:
    """Backward compat: month/year query params are accepted but ignored."""
    captured_filters: list[str] = []

    async def capture_select(table: str, filters: str) -> list[dict]:
        captured_filters.append(filters)
        return [{"id": "cal-1"}]

    async def fake_auth_user(_auth: str | None) -> dict:
        return {"id": "user-1", "email": "test@test.com"}

    async def fake_resolve_org(_uid: str, _org_id: str | None = None) -> str:
        return "org-1"

    with (
        patch("app.routes.calendars.get_authenticated_user", new_callable=AsyncMock) as mock_auth,
        patch("app.routes.calendars.resolve_organization_id", new_callable=AsyncMock) as mock_resolve,
        patch("app.routes.calendars.select_records", new_callable=AsyncMock) as mock_select,
    ):
        mock_auth.side_effect = fake_auth_user
        mock_resolve.side_effect = fake_resolve_org
        mock_select.side_effect = capture_select

        # Even with explicit month=5, year=2026, filters must NOT include them
        result = await get_calendars(authorization="Bearer token", month=5, year=2026)

        filters_str = captured_filters[0]
        assert "month=eq" not in filters_str, "Month param must be ignored"
        assert "year=eq" not in filters_str, "Year param must be ignored"
        assert result["calendars"][0]["id"] == "cal-1"
