"""Tests for openai_service.py — pure functions, no external calls."""

from __future__ import annotations

from typing import Any

import pytest
from app.services.openai_service import (
    _extract_gemini_text,
    _extract_text,
    _gemini_error_detail,
    _openai_error_detail,
    ai_max_output_tokens,
    gemini_model,
    gemini_thinking_budget,
    is_gemini_configured,
    is_openai_configured,
    openai_model,
)


class TestConfigHelpers:
    def test_openai_model_default(self, monkeypatch: pytest.MonkeyPatch) -> None:
        monkeypatch.delenv("OPENAI_MODEL", raising=False)
        assert openai_model() == "gpt-4o-mini"

    def test_openai_model_override(self, monkeypatch: pytest.MonkeyPatch) -> None:
        monkeypatch.setenv("OPENAI_MODEL", "gpt-4o")
        assert openai_model() == "gpt-4o"

    def test_gemini_model_default(self, monkeypatch: pytest.MonkeyPatch) -> None:
        monkeypatch.delenv("GEMINI_MODEL", raising=False)
        assert gemini_model() == "gemini-2.5-flash"

    def test_gemini_model_override(self, monkeypatch: pytest.MonkeyPatch) -> None:
        monkeypatch.setenv("GEMINI_MODEL", "gemini-2.0-flash")
        assert gemini_model() == "gemini-2.0-flash"

    def test_ai_max_output_tokens_default(self, monkeypatch: pytest.MonkeyPatch) -> None:
        monkeypatch.delenv("AI_MAX_OUTPUT_TOKENS", raising=False)
        assert ai_max_output_tokens() == 8000

    def test_ai_max_output_tokens_clamps_low(self, monkeypatch: pytest.MonkeyPatch) -> None:
        monkeypatch.setenv("AI_MAX_OUTPUT_TOKENS", "100")
        assert ai_max_output_tokens() == 256

    def test_ai_max_output_tokens_clamps_high(self, monkeypatch: pytest.MonkeyPatch) -> None:
        monkeypatch.setenv("AI_MAX_OUTPUT_TOKENS", "99999")
        assert ai_max_output_tokens() == 16000

    def test_ai_max_output_tokens_invalid(self, monkeypatch: pytest.MonkeyPatch) -> None:
        monkeypatch.setenv("AI_MAX_OUTPUT_TOKENS", "not-a-number")
        assert ai_max_output_tokens() == 8000

    def test_gemini_thinking_budget_default(self, monkeypatch: pytest.MonkeyPatch) -> None:
        monkeypatch.delenv("GEMINI_THINKING_BUDGET", raising=False)
        assert gemini_thinking_budget() == 0

    def test_gemini_thinking_budget_clamps_high(self, monkeypatch: pytest.MonkeyPatch) -> None:
        monkeypatch.setenv("GEMINI_THINKING_BUDGET", "99999")
        assert gemini_thinking_budget() == 24576

    def test_gemini_thinking_budget_invalid(self, monkeypatch: pytest.MonkeyPatch) -> None:
        monkeypatch.setenv("GEMINI_THINKING_BUDGET", "bad")
        assert gemini_thinking_budget() == 0

    def test_is_openai_configured_true(self, monkeypatch: pytest.MonkeyPatch) -> None:
        monkeypatch.setenv("OPENAI_API_KEY", "sk-abc123")
        assert is_openai_configured() is True

    def test_is_openai_configured_false(self, monkeypatch: pytest.MonkeyPatch) -> None:
        monkeypatch.delenv("OPENAI_API_KEY", raising=False)
        assert is_openai_configured() is False

    def test_is_gemini_configured_true(self, monkeypatch: pytest.MonkeyPatch) -> None:
        monkeypatch.setenv("GEMINI_API_KEY", "xyz")
        assert is_gemini_configured() is True

    def test_is_gemini_configured_false(self, monkeypatch: pytest.MonkeyPatch) -> None:
        monkeypatch.delenv("GEMINI_API_KEY", raising=False)
        assert is_gemini_configured() is False


class TestExtractText:
    def test_extract_text_output_text_field(self) -> None:
        data = {"output_text": "  Respuesta clara  "}
        assert _extract_text(data) == "Respuesta clara"

    def test_extract_text_output_list(self) -> None:
        data = {
            "output": [
                {"content": [{"text": "Primer"}], "role": "assistant"},
                {"content": [{"text": "Segundo"}], "role": "assistant"},
            ]
        }
        assert _extract_text(data) == "Primer\nSegundo"

    def test_extract_text_empty(self) -> None:
        assert _extract_text({}) == ""

    def test_extract_text_only_whitespace(self) -> None:
        data = {"output_text": "   "}
        assert _extract_text(data) == ""

    def test_extract_gemini_text_basic(self) -> None:
        data = {
            "candidates": [
                {
                    "content": {
                        "parts": [{"text": "Respuesta Gemini 1"}, {"text": "Respuesta Gemini 2"}]
                    }
                }
            ]
        }
        assert _extract_gemini_text(data) == "Respuesta Gemini 1\nRespuesta Gemini 2"

    def test_extract_gemini_text_multiple_candidates(self) -> None:
        data = {
            "candidates": [
                {"content": {"parts": [{"text": "A"}]}},
                {"content": {"parts": [{"text": "B"}]}},
            ]
        }
        assert _extract_gemini_text(data) == "A\nB"

    def test_extract_gemini_text_empty(self) -> None:
        assert _extract_gemini_text({}) == ""

    def test_extract_gemini_text_missing_fields(self) -> None:
        data = {"candidates": [{"not_content": True}]}
        assert _extract_gemini_text(data) == ""


class TestErrorDetail:
    def test_openai_error_with_message(self) -> None:
        response = _fake_httpx_response(401, {"error": {"message": "Invalid API key"}})
        detail = _openai_error_detail(response)
        assert "Invalid API key" in detail
        assert "401" not in detail  # no status by default

    def test_openai_error_with_code(self) -> None:
        response = _fake_httpx_response(429, {"error": {"message": "Rate limit", "code": "rate_limited"}})
        detail = _openai_error_detail(response)
        assert "Rate limit" in detail
        assert "rate_limited" in detail

    def test_openai_error_fallback_on_bad_json(self) -> None:
        response = _fake_httpx_response(500, body_text="Internal Server Error")
        detail = _openai_error_detail(response)
        assert "500" in detail
        assert "Internal Server Error" in detail

    def test_gemini_error_with_status(self) -> None:
        response = _fake_httpx_response(403, {"error": {"message": "API key not valid", "status": "PERMISSION_DENIED"}})
        detail = _gemini_error_detail(response)
        assert "API key not valid" in detail
        assert "PERMISSION_DENIED" in detail

    def test_gemini_error_fallback(self) -> None:
        response = _fake_httpx_response(503, body_text="Service Unavailable")
        detail = _gemini_error_detail(response)
        assert "503" in detail
        assert "Service Unavailable" in detail


# -------------------------------------------------------------------
# Helpers
# -------------------------------------------------------------------


class _FakeResponse:
    """Minimal httpx.Response stand-in for error detail tests."""

    def __init__(self, status_code: int, json_data: Any = None, body_text: str = "") -> None:
        self.status_code = status_code
        self._json_data = json_data
        self._body_text = body_text

    def json(self) -> Any:
        if self._json_data is not None:
            return self._json_data
        raise ValueError("No JSON")

    @property
    def text(self) -> str:
        return self._body_text


def _fake_httpx_response(
    status_code: int, json_data: dict[str, Any] | None = None, body_text: str = ""
) -> _FakeResponse:
    return _FakeResponse(status_code, json_data, body_text)
