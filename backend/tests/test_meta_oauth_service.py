"""Tests for meta_oauth_service.py — OAuth logic with mocked Supabase."""

from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi import HTTPException

from app.services.meta_oauth_service import (
    consume_oauth_state,
    fetch_meta_profile,
    meta_oauth_scopes,
    oauth_error_redirect,
    oauth_success_redirect,
    save_social_connection,
)


class TestMetaOAuthScopes:
    def test_default_scopes(self, monkeypatch: pytest.MonkeyPatch) -> None:
        monkeypatch.delenv("META_OAUTH_SCOPES", raising=False)
        assert meta_oauth_scopes() == ["public_profile"]

    def test_custom_scopes(self, monkeypatch: pytest.MonkeyPatch) -> None:
        monkeypatch.setenv("META_OAUTH_SCOPES", "public_profile,instagram_basic,email")
        assert meta_oauth_scopes() == ["public_profile", "instagram_basic", "email"]

    def test_empty_scopes_falls_back(self, monkeypatch: pytest.MonkeyPatch) -> None:
        monkeypatch.setenv("META_OAUTH_SCOPES", "")
        assert meta_oauth_scopes() == ["public_profile"]


class TestConsumeOauthState:
    async def test_valid_state(self) -> None:
        with patch("app.services.meta_oauth_service.select_records", new_callable=AsyncMock) as mock_select:
            with patch("app.services.meta_oauth_service.update_record", new_callable=AsyncMock) as mock_update:
                mock_select.return_value = [
                    {
                        "id": "state-1",
                        "user_id": "user-123",
                        "expires_at": "2126-05-28T20:00:00+00:00",
                        "consumed_at": None,
                        "state": "valid-state",
                    }
                ]
                mock_update.return_value = {"id": "state-1", "consumed_at": "..."}

                result = await consume_oauth_state("valid-state")
                assert result["user_id"] == "user-123"
                mock_update.assert_awaited_once()

    async def test_missing_state_raises_400(self) -> None:
        with patch("app.services.meta_oauth_service.select_records", new_callable=AsyncMock) as mock_select:
            mock_select.return_value = []
            with pytest.raises(HTTPException) as exc:
                await consume_oauth_state("bad-state")
            assert exc.value.status_code == 400

    async def test_expired_state_raises_400(self) -> None:
        with patch("app.services.meta_oauth_service.select_records", new_callable=AsyncMock) as mock_select:
            mock_select.return_value = [
                {
                    "id": "state-1",
                    "user_id": "user-123",
                    "expires_at": "2020-01-01T00:00:00+00:00",
                    "consumed_at": None,
                    "state": "expired",
                }
            ]
            with pytest.raises(HTTPException) as exc:
                await consume_oauth_state("expired")
            assert exc.value.status_code == 400

    async def test_already_consumed_raises_400(self) -> None:
        with patch("app.services.meta_oauth_service.select_records", new_callable=AsyncMock) as mock_select:
            mock_select.return_value = [
                {
                    "id": "state-1",
                    "user_id": "user-123",
                    "expires_at": "2126-05-28T20:00:00+00:00",
                    "consumed_at": "2026-05-28T19:00:00+00:00",
                    "state": "used",
                }
            ]
            with pytest.raises(HTTPException) as exc:
                await consume_oauth_state("used")
            assert exc.value.status_code == 400


class TestFetchMetaProfile:
    async def test_returns_profile_on_success(self) -> None:
        mock_response = MagicMock(spec_set=["status_code", "json"])
        mock_response.status_code = 200
        mock_response.json.return_value = {"id": "12345", "name": "Mi Pagina"}

        mock_get = AsyncMock(return_value=mock_response)

        mock_client = MagicMock()
        mock_client.get = mock_get

        mock_client_instance = MagicMock()
        mock_client_instance.__aenter__ = AsyncMock(return_value=mock_client)

        with patch(
            "app.services.meta_oauth_service.httpx.AsyncClient", return_value=mock_client_instance
        ):
            result = await fetch_meta_profile("valid-token")
            assert result == {"id": "12345", "name": "Mi Pagina"}
            mock_get.assert_awaited_once()

    async def test_returns_empty_on_error(self) -> None:
        mock_response = MagicMock(spec_set=["status_code", "json"])
        mock_response.status_code = 401

        mock_get = AsyncMock(return_value=mock_response)

        mock_client = MagicMock()
        mock_client.get = mock_get

        mock_client_instance = MagicMock()
        mock_client_instance.__aenter__ = AsyncMock(return_value=mock_client)

        with patch(
            "app.services.meta_oauth_service.httpx.AsyncClient", return_value=mock_client_instance
        ):
            result = await fetch_meta_profile("bad-token")
            assert result == {}


class TestSaveSocialConnection:
    async def test_saves_and_returns(self) -> None:
        with patch("app.services.meta_oauth_service.insert_record", new_callable=AsyncMock) as mock_insert:
            mock_insert.return_value = {"id": "conn-1", "provider_user_id": "12345"}

            result = await save_social_connection(
                user_id="user-123",
                token_data={"access_token": "tok", "expires_in": 3600},
                profile={"id": "12345", "name": "Mi Pagina"},
            )
            assert result["id"] == "conn-1"
            mock_insert.assert_awaited_once()


class TestRedirectUrls:
    def test_success_redirect_contains_connection_id(self) -> None:
        url = oauth_success_redirect("conn-xyz")
        assert "conn-xyz" in url
        assert "oauth=success" in url

    def test_error_redirect_contains_message(self) -> None:
        url = oauth_error_redirect("access_denied")
        assert "oauth=error" in url
        assert "access_denied" in url
