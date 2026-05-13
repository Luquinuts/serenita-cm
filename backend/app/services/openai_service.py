from __future__ import annotations

from typing import Any

import httpx
from fastapi import HTTPException

from app.config import get_env, require_env


def openai_model() -> str:
    return get_env("OPENAI_MODEL", "gpt-4o-mini") or "gpt-4o-mini"


def gemini_model() -> str:
    return get_env("GEMINI_MODEL", "gemini-2.5-flash") or "gemini-2.5-flash"


def ai_max_output_tokens() -> int:
    raw_value = get_env("AI_MAX_OUTPUT_TOKENS", "4000") or "4000"
    try:
        value = int(raw_value)
    except ValueError:
        return 4000

    return max(256, min(value, 8000))


def is_openai_configured() -> bool:
    return bool(get_env("OPENAI_API_KEY"))


def is_gemini_configured() -> bool:
    return bool(get_env("GEMINI_API_KEY"))


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


def _openai_error_detail(response: httpx.Response) -> str:
    fallback = f"OpenAI no pudo procesar la consulta. Status {response.status_code}."

    try:
        data = response.json()
    except ValueError:
        body = response.text.strip().replace("\n", " ")
        if body:
            return f"{fallback} Respuesta: {body[:300]}"
        return fallback

    error = data.get("error")
    if not isinstance(error, dict):
        return f"{fallback} Respuesta: {str(data)[:300]}"

    message = error.get("message")
    code = error.get("code")
    error_type = error.get("type")

    if not isinstance(message, str) or not message.strip():
        return fallback

    public_reason = message.strip()
    if isinstance(code, str) and code.strip():
        public_reason = f"{public_reason} ({code.strip()})"
    elif isinstance(error_type, str) and error_type.strip():
        public_reason = f"{public_reason} ({error_type.strip()})"

    return f"OpenAI no pudo procesar la consulta: {public_reason}"


def _extract_gemini_text(response_data: dict[str, Any]) -> str:
    chunks: list[str] = []
    for candidate in response_data.get("candidates", []):
        if not isinstance(candidate, dict):
            continue

        content = candidate.get("content")
        if not isinstance(content, dict):
            continue

        for part in content.get("parts", []):
            if not isinstance(part, dict):
                continue

            text = part.get("text")
            if isinstance(text, str):
                chunks.append(text)

    return "\n".join(chunk.strip() for chunk in chunks if chunk.strip())


def _gemini_error_detail(response: httpx.Response) -> str:
    fallback = f"Gemini no pudo procesar la consulta. Status {response.status_code}."

    try:
        data = response.json()
    except ValueError:
        body = response.text.strip().replace("\n", " ")
        if body:
            return f"{fallback} Respuesta: {body[:300]}"
        return fallback

    error = data.get("error")
    if not isinstance(error, dict):
        return f"{fallback} Respuesta: {str(data)[:300]}"

    message = error.get("message")
    status = error.get("status")

    if not isinstance(message, str) or not message.strip():
        return fallback

    public_reason = message.strip()
    if isinstance(status, str) and status.strip():
        public_reason = f"{public_reason} ({status.strip()})"

    return f"Gemini no pudo procesar la consulta: {public_reason}"


async def generate_openai_answer(prompt: str) -> dict[str, str]:
    api_key = require_env("OPENAI_API_KEY")
    model = openai_model()

    payload = {
        "model": model,
        "input": prompt,
        "instructions": (
            "Sos un asistente de Serenita CM para consultas de marketing, redes sociales "
            "y gestion de reportes. Responde en espanol claro, con pasos accionables cuando aporte valor."
        ),
        "max_output_tokens": ai_max_output_tokens(),
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
        raise HTTPException(status_code=502, detail=_openai_error_detail(response))

    answer = _extract_text(response.json())
    if not answer:
        raise HTTPException(status_code=502, detail="OpenAI no devolvio una respuesta legible.")

    return {"answer": answer, "model": model}


async def generate_gemini_answer(prompt: str) -> dict[str, str]:
    api_key = require_env("GEMINI_API_KEY")
    model = gemini_model()

    payload = {
        "systemInstruction": {
            "parts": [
                {
                    "text": (
                        "Sos un asistente de Serenita CM para consultas de marketing, redes sociales "
                        "y gestion de reportes. Responde en espanol claro, con pasos accionables cuando aporte valor."
                    )
                }
            ]
        },
        "contents": [
            {
                "role": "user",
                "parts": [{"text": prompt}],
            }
        ],
        "generationConfig": {
            "maxOutputTokens": ai_max_output_tokens(),
        },
    }

    async with httpx.AsyncClient(timeout=45) as client:
        response = await client.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
            headers={
                "x-goog-api-key": api_key,
                "Content-Type": "application/json",
            },
            json=payload,
        )

    if response.status_code >= 400:
        raise HTTPException(status_code=502, detail=_gemini_error_detail(response))

    answer = _extract_gemini_text(response.json())
    if not answer:
        raise HTTPException(status_code=502, detail="Gemini no devolvio una respuesta legible.")

    return {"answer": answer, "model": model}


async def generate_ai_answer(prompt: str, provider: str) -> dict[str, str]:
    if provider == "gemini":
        answer = await generate_gemini_answer(prompt)
        return {**answer, "provider": "gemini"}

    answer = await generate_openai_answer(prompt)
    return {**answer, "provider": "openai"}
