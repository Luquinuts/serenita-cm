"""Tests for schemas.py — Pydantic model validation."""

from __future__ import annotations

import pytest
from pydantic import ValidationError
from app.schemas import (
    AiQueryInput,
    CalendarCreateInput,
    CalendarItemCreateInput,
    ConnectionRenameInput,
    ReportInput,
)


class TestReportInput:
    def test_valid_minimal(self) -> None:
        data = {
            "periodo": "Mayo 2026",
            "cuenta": "@cuenta",
            "plataforma": "Instagram",
            "datosGenerales": {
                "visualizaciones": "10K",
                "porcentajeSeguidores": "80%",
                "porcentajeNoSeguidores": "20%",
                "interacciones": "500",
                "nuevosSeguidores": "100",
                "publicaciones": "15",
                "cuentasAlcanzadas": "5K",
                "variacionCuentasAlcanzadasVsMesAnterior": "+10%",
            },
            "audiencia": {
                "ubicaciones": [],
                "edades": [],
                "genero": {"mujeres": "60%", "hombres": "40%"},
            },
        }
        report = ReportInput(**data)
        assert report.periodo == "Mayo 2026"

    def test_invalid_insight_too_long(self) -> None:
        data = {
            "periodo": "M",
            "cuenta": "@c",
            "plataforma": "IG",
            "datosGenerales": {
                "visualizaciones": "",
                "porcentajeSeguidores": "",
                "porcentajeNoSeguidores": "",
                "interacciones": "",
                "nuevosSeguidores": "",
                "publicaciones": "",
                "cuentasAlcanzadas": "",
                "variacionCuentasAlcanzadasVsMesAnterior": "",
            },
            "audiencia": {"ubicaciones": [], "edades": [], "genero": {"mujeres": "", "hombres": ""}},
            "insightsAdicionales": ["x" * 181],
        }
        with pytest.raises(ValidationError, match="180 caracteres"):
            ReportInput(**data)

    def test_valid_insights(self) -> None:
        data = {
            "periodo": "M",
            "cuenta": "@c",
            "plataforma": "IG",
            "datosGenerales": {
                "visualizaciones": "",
                "porcentajeSeguidores": "",
                "porcentajeNoSeguidores": "",
                "interacciones": "",
                "nuevosSeguidores": "",
                "publicaciones": "",
                "cuentasAlcanzadas": "",
                "variacionCuentasAlcanzadasVsMesAnterior": "",
            },
            "audiencia": {"ubicaciones": [], "edades": [], "genero": {"mujeres": "", "hombres": ""}},
            "insightsAdicionales": ["  insight con espacios  "],
        }
        report = ReportInput(**data)
        assert report.insightsAdicionales[0] == "insight con espacios"


class TestAiQueryInput:
    def test_valid(self) -> None:
        q = AiQueryInput(prompt="¿Cómo mejorar el reach?", provider="gemini")
        assert q.provider == "gemini"
        assert q.prompt == "¿Cómo mejorar el reach?"

    def test_empty_prompt_raises(self) -> None:
        with pytest.raises(ValidationError):
            AiQueryInput(prompt="  ", provider="openai")

    def test_invalid_provider_raises(self) -> None:
        with pytest.raises(ValidationError):
            AiQueryInput(prompt="hola", provider="claude")  # type: ignore[arg-type]


class TestCalendarCreateInput:
    def test_valid(self) -> None:
        cal = CalendarCreateInput(name="Calendario Mayo", month=5, year=2026)
        assert cal.name == "Calendario Mayo"
        assert cal.status == "draft"

    def test_create_without_month_year(self) -> None:
        """Calendars are timeless — month/year are optional metadata."""
        cal = CalendarCreateInput(name="Solo nombre")
        assert cal.name == "Solo nombre"
        assert cal.month is None
        assert cal.year is None
        assert cal.status == "draft"

    def test_invalid_month(self) -> None:
        with pytest.raises(ValidationError):
            CalendarCreateInput(name="Mal", month=13, year=2026)

    def test_invalid_year(self) -> None:
        with pytest.raises(ValidationError):
            CalendarCreateInput(name="Mal", month=1, year=1999)


class TestCalendarItemCreateInput:
    def test_valid(self) -> None:
        item = CalendarItemCreateInput(
            scheduled_date="2026-05-15",
            content_type="reel",
            title="Video promocional",
        )
        assert item.content_type == "reel"
        assert item.priority == "medium"

    def test_invalid_color_tag(self) -> None:
        with pytest.raises(ValidationError):
            CalendarItemCreateInput(
                scheduled_date="2026-05-15",
                content_type="carousel",
                title="Test",
                color_tag="not-hex",
            )

    def test_valid_color_tag(self) -> None:
        item = CalendarItemCreateInput(
            scheduled_date="2026-05-15",
            content_type="story",
            title="Historia",
            color_tag="#FF5733",
        )
        assert item.color_tag == "#FF5733"


class TestConnectionRenameInput:
    def test_valid(self) -> None:
        c = ConnectionRenameInput(nombre_conexion="Mi cuenta IG")
        assert c.nombre_conexion == "Mi cuenta IG"

    def test_empty_raises(self) -> None:
        with pytest.raises(ValidationError):
            ConnectionRenameInput(nombre_conexion="  ")
