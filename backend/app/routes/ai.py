from __future__ import annotations

from fastapi import APIRouter, Header

from app.schemas import AiQueryInput, AiQueryOutput
from app.services.openai_service import (
    gemini_model,
    generate_ai_answer,
    is_gemini_configured,
    is_openai_configured,
    openai_model,
)
from app.services.supabase_service import get_authenticated_user

router = APIRouter(prefix="/api/ai", tags=["ia"])


@router.get("/status")
async def ai_status(authorization: str | None = Header(default=None)) -> dict:
    await get_authenticated_user(authorization)
    return {
        "providers": {
            "openai": {
                "configured": is_openai_configured(),
                "model": openai_model(),
            },
            "gemini": {
                "configured": is_gemini_configured(),
                "model": gemini_model(),
            },
        }
    }


@router.post("/query", response_model=AiQueryOutput)
async def query_ai(payload: AiQueryInput, authorization: str | None = Header(default=None)) -> AiQueryOutput:
    await get_authenticated_user(authorization)
    answer = await generate_ai_answer(payload.prompt, payload.provider)
    return AiQueryOutput(**answer)
