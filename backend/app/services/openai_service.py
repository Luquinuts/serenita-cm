from __future__ import annotations

from typing import Any

import httpx
from fastapi import HTTPException

from app.config import get_env, require_env


def openai_model() -> str:
    return get_env("OPENAI_MODEL", "gpt-4o-mini") or "gpt-4o-mini"


def is_openai_configured() -> bool:
    return bool(get_env("OPENAI_API_KEY"))


def _extract_text(response_data: dict[str, Any]) -> str:
    output_text = response_data.get("output_text")
    if isinstance(output_text, str) and output_text.strip():
        return output_text.strip()

    chunks: list[str] = []
    for item in response_data.get("output", []):
        if not isinstance(item, dict):
            continue

        for content in item.get("content", []):
            if not isinstance(content, dict):
                continue

            text = content.get("text")
            if isinstance(text, str):
                chunks.append(text)

    return "\n".join(chunk.strip() for chunk in chunks if chunk.strip())


async def generate_ai_answer(prompt: str) -> dict[str, str]:
    api_key = require_env("OPENAI_API_KEY")
    model = openai_model()

    payload = {
        "model": model,
        "input": prompt,
        "instructions": (
            "Sos un asistente de Serenita CM para consultas de marketing, redes sociales "
            "y gestion de reportes. Responde en espanol claro, con pasos accionables cuando aporte valor."
        ),
        "max_output_tokens": 900,
    }

    async with httpx.AsyncClient(timeout=45) as client:
        response = await client.post(
            "https://api.openai.com/v1/responses",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json=payload,
        )

    if response.status_code >= 400:
        raise HTTPException(status_code=502, detail="OpenAI no pudo procesar la consulta.")

    answer = _extract_text(response.json())
    if not answer:
        raise HTTPException(status_code=502, detail="OpenAI no devolvio una respuesta legible.")

    return {"answer": answer, "model": model}
