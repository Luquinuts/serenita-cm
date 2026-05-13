from __future__ import annotations

from datetime import date
from typing import Any, List, Literal

from pydantic import BaseModel, Field, field_validator


class MetricaPublicacion(BaseModel):
    label: str = Field(default="", max_length=40)
    valor: str = Field(default="", max_length=40)


class TopPublicacion(BaseModel):
    orden: int = Field(..., gt=0)
    tipo: str = Field(default="", max_length=30)
    titulo: str = Field(default="", max_length=120)
    metricas: List[MetricaPublicacion] = Field(default_factory=list, max_length=8)


class UbicacionAudiencia(BaseModel):
    nombre: str = Field(default="", max_length=40)
    porcentaje: str = Field(default="", max_length=20)


class EdadAudiencia(BaseModel):
    rango: str = Field(default="", max_length=40)
    porcentaje: str = Field(default="", max_length=20)


class GeneroAudiencia(BaseModel):
    mujeres: str = Field(default="", max_length=20)
    hombres: str = Field(default="", max_length=20)


class DatosGenerales(BaseModel):
    visualizaciones: str = Field(default="", max_length=40)
    porcentajeSeguidores: str = Field(default="", max_length=20)
    porcentajeNoSeguidores: str = Field(default="", max_length=20)
    interacciones: str = Field(default="", max_length=40)
    nuevosSeguidores: str = Field(default="", max_length=40)
    publicaciones: str = Field(default="", max_length=40)
    cuentasAlcanzadas: str = Field(default="", max_length=40)
    variacionCuentasAlcanzadasVsMesAnterior: str = Field(default="", max_length=80)


class Audiencia(BaseModel):
    ubicaciones: List[UbicacionAudiencia] = Field(default_factory=list, max_length=10)
    edades: List[EdadAudiencia] = Field(default_factory=list, max_length=10)
    genero: GeneroAudiencia = Field(default_factory=GeneroAudiencia)


class ReportInput(BaseModel):
    periodo: str = Field(..., min_length=1, max_length=40)
    cuenta: str = Field(..., min_length=1, max_length=80)
    plataforma: str = Field(..., min_length=1, max_length=80)
    datosGenerales: DatosGenerales
    topPublicaciones: List[TopPublicacion] = Field(default_factory=list, max_length=12)
    audiencia: Audiencia
    insightsAdicionales: List[str] = Field(default_factory=list, max_length=8)
    sugerenciasProximoMes: List[str] = Field(default_factory=list, max_length=8)

    @field_validator("insightsAdicionales")
    @classmethod
    def validate_insights(cls, values: List[str]) -> List[str]:
        cleaned = []
        for value in values:
            normalized = value.strip()
            if len(normalized) > 180:
                raise ValueError("Cada insight debe tener hasta 180 caracteres.")
            cleaned.append(normalized)
        return cleaned

    @field_validator("sugerenciasProximoMes")
    @classmethod
    def validate_suggestions(cls, values: List[str]) -> List[str]:
        cleaned = []
        for value in values:
            normalized = value.strip()
            if len(normalized) > 180:
                raise ValueError("Cada sugerencia debe tener hasta 180 caracteres.")
            cleaned.append(normalized)
        return cleaned


class ConnectionRenameInput(BaseModel):
    nombre_conexion: str = Field(..., min_length=1, max_length=80)

    @field_validator("nombre_conexion")
    @classmethod
    def validate_nombre_conexion(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("El nombre de la conexion es obligatorio.")
        return normalized


class AiQueryInput(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=4000)
    provider: Literal["openai", "gemini"] = "openai"

    @field_validator("prompt")
    @classmethod
    def validate_prompt(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("La consulta es obligatoria.")
        return normalized


class AiQueryOutput(BaseModel):
    answer: str
    model: str
    provider: Literal["openai", "gemini"]


CalendarStatus = Literal["draft", "active", "archived"]
ContentType = Literal["reel", "carousel", "story", "content_creation"]
ContentItemStatus = Literal["pendiente", "en_progreso", "aprobado", "publicado"]
ContentItemPriority = Literal["low", "medium", "high", "urgent"]


class CalendarCreateInput(BaseModel):
    organization_id: str | None = None
    name: str = Field(..., min_length=1, max_length=120)
    description: str | None = Field(default=None, max_length=800)
    month: int = Field(..., ge=1, le=12)
    year: int = Field(..., ge=2020, le=2100)
    status: CalendarStatus = "draft"
    metadata: dict[str, Any] = Field(default_factory=dict)

    @field_validator("name")
    @classmethod
    def validate_calendar_name(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("El nombre del calendario es obligatorio.")
        return normalized


class CalendarUpdateInput(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    description: str | None = Field(default=None, max_length=800)
    month: int | None = Field(default=None, ge=1, le=12)
    year: int | None = Field(default=None, ge=2020, le=2100)
    status: CalendarStatus | None = None
    metadata: dict[str, Any] | None = None


class CalendarItemCreateInput(BaseModel):
    scheduled_date: date
    content_type: ContentType
    title: str = Field(..., min_length=1, max_length=160)
    description: str | None = Field(default=None, max_length=1200)
    objective: str | None = Field(default=None, max_length=500)
    status: ContentItemStatus = "pendiente"
    priority: ContentItemPriority = "medium"
    observations: str | None = Field(default=None, max_length=1000)
    color_tag: str | None = Field(default=None, pattern=r"^#[0-9A-Fa-f]{6}$")
    position_in_day: int = Field(default=0, ge=0)
    metadata: dict[str, Any] = Field(default_factory=dict)

    @field_validator("title")
    @classmethod
    def validate_item_title(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("El titulo del item es obligatorio.")
        return normalized


class CalendarItemUpdateInput(BaseModel):
    scheduled_date: date | None = None
    content_type: ContentType | None = None
    title: str | None = Field(default=None, min_length=1, max_length=160)
    description: str | None = Field(default=None, max_length=1200)
    objective: str | None = Field(default=None, max_length=500)
    status: ContentItemStatus | None = None
    priority: ContentItemPriority | None = None
    observations: str | None = Field(default=None, max_length=1000)
    color_tag: str | None = Field(default=None, pattern=r"^#[0-9A-Fa-f]{6}$")
    position_in_day: int | None = Field(default=None, ge=0)
    metadata: dict[str, Any] | None = None


class CalendarItemReorderInput(BaseModel):
    item_ids: list[str] = Field(..., min_length=1, max_length=100)
