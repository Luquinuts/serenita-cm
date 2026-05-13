from __future__ import annotations

from typing import List, Literal

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
