"""Tests for calendar_service.py — business logic with mocked Supabase."""

from __future__ import annotations

from unittest.mock import AsyncMock, patch

import pytest
from fastapi import HTTPException

from app.services.calendar_service import (
    assert_calendar_access,
    assert_item_access,
    create_calendar,
    duplicate_calendar,
    resolve_organization_id,
    soft_delete_calendar,
)


@pytest.fixture
def user_id() -> str:
    return "user-123"


@pytest.fixture
def mock_select() -> AsyncMock:
    with patch("app.services.calendar_service.select_records", new_callable=AsyncMock) as m:
        yield m


@pytest.fixture
def mock_insert() -> AsyncMock:
    with patch("app.services.calendar_service.insert_record", new_callable=AsyncMock) as m:
        yield m


@pytest.fixture
def mock_update() -> AsyncMock:
    with patch("app.services.calendar_service.update_record", new_callable=AsyncMock) as m:
        yield m


class TestResolveOrganizationId:
    async def test_returns_existing_membership(self, mock_select: AsyncMock, user_id: str) -> None:
        mock_select.return_value = [{"organization_id": "org-1", "role": "owner", "organizations": {"id": "org-1", "name": "Mi org"}}]
        result = await resolve_organization_id(user_id)
        assert result == "org-1"

    async def test_creates_org_when_no_membership(self, mock_select: AsyncMock, mock_insert: AsyncMock, user_id: str) -> None:
        mock_select.return_value = []
        mock_insert.side_effect = [
            {"id": "new-org"},  # first insert = organization
            {"id": "new-member"},  # second insert = membership
        ]
        result = await resolve_organization_id(user_id)
        assert result == "new-org"
        assert mock_insert.call_count == 2

    async def test_raises_403_on_wrong_org(self, mock_select: AsyncMock, user_id: str) -> None:
        mock_select.return_value = [{"organization_id": "org-1", "role": "member", "organizations": {"id": "org-1"}}]
        with pytest.raises(HTTPException) as exc:
            await resolve_organization_id(user_id, organization_id="org-999")
        assert exc.value.status_code == 403


class TestAssertCalendarAccess:
    async def test_calendar_found_and_allowed(self, mock_select: AsyncMock, user_id: str) -> None:
        mock_select.side_effect = [
            [{"id": "cal-1", "organization_id": "org-1"}],  # calendar query
            [{"organization_id": "org-1", "role": "owner"}],  # membership check
        ]
        result = await assert_calendar_access("cal-1", user_id)
        assert result["id"] == "cal-1"

    async def test_calendar_not_found(self, mock_select: AsyncMock, user_id: str) -> None:
        mock_select.return_value = []
        with pytest.raises(HTTPException) as exc:
            await assert_calendar_access("unknown", user_id)
        assert exc.value.status_code == 404

    async def test_calendar_no_membership(self, mock_select: AsyncMock, user_id: str) -> None:
        mock_select.side_effect = [
            [{"id": "cal-1", "organization_id": "org-1"}],  # calendar found
            [{"organization_id": "org-2", "role": "member"}],  # user belongs to org-2, not org-1
        ]
        with pytest.raises(HTTPException) as exc:
            await assert_calendar_access("cal-1", user_id)
        assert exc.value.status_code == 403


class TestAssertItemAccess:
    async def test_item_found(self, mock_select: AsyncMock, user_id: str) -> None:
        mock_select.side_effect = [
            [{"id": "item-1", "calendar_id": "cal-1"}],  # item query
            [{"id": "cal-1", "organization_id": "org-1"}],  # calendar query
            [{"organization_id": "org-1", "role": "owner"}],  # membership check
        ]
        result = await assert_item_access("item-1", user_id)
        assert result["id"] == "item-1"

    async def test_item_not_found(self, mock_select: AsyncMock, user_id: str) -> None:
        mock_select.return_value = []
        with pytest.raises(HTTPException) as exc:
            await assert_item_access("unknown-item", user_id)
        assert exc.value.status_code == 404


class TestCreateCalendar:
    async def test_creates_and_returns(self, mock_select: AsyncMock, mock_insert: AsyncMock, user_id: str) -> None:
        mock_select.return_value = [{"organization_id": "org-1", "role": "owner"}]
        mock_insert.return_value = {"id": "cal-new", "name": "Mi calendario", "month": 5, "year": 2026}

        from app.schemas import CalendarCreateInput

        result = await create_calendar(CalendarCreateInput(name="Mi calendario", month=5, year=2026), user_id)
        assert result["id"] == "cal-new"
        mock_insert.assert_awaited_once()


class TestDuplicateCalendar:
    async def test_duplicates_calendar_and_items(self, mock_select: AsyncMock, mock_insert: AsyncMock, user_id: str) -> None:
        mock_select.side_effect = [
            [{"id": "cal-1", "organization_id": "org-1", "name": "Original", "month": 5, "year": 2026}],  # assert access
            [{"organization_id": "org-1", "role": "owner"}],  # membership
            [{"scheduled_date": "2026-05-15", "content_type": "reel", "title": "Item 1"}],  # items list
        ]
        mock_insert.side_effect = [
            {"id": "cal-copy", "name": "Original - copia"},  # duplicated calendar
            {"id": "item-copy-1"},  # duplicated item
        ]

        result = await duplicate_calendar("cal-1", user_id)
        assert result["id"] == "cal-copy"


class TestSoftDeleteCalendar:
    async def test_soft_deletes_items_and_calendar(self, mock_select: AsyncMock, mock_update: AsyncMock, user_id: str) -> None:
        mock_select.side_effect = [
            [{"id": "cal-1", "organization_id": "org-1"}],  # assert access
            [{"organization_id": "org-1", "role": "owner"}],  # membership
        ]
        mock_update.side_effect = [None, {"id": "cal-1", "deleted_at": "..."}]

        result = await soft_delete_calendar("cal-1", user_id)
        assert result is not None
        assert mock_update.await_count == 2
