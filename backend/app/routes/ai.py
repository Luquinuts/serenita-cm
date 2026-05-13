from __future__ import annotations

from fastapi import APIRouter, Header

from app.schemas import AiQueryInput, AiQueryOutput
from app.services.openai_service import generate_ai_answer, is_openai_configured, openai_model
from app.services.supabase_service import get_authenticated_user

router = APIRouter(prefix="/api/ai", tags=["ia"])


@router.get("/status")
async def ai_status(authorization: str | None = Header(default=None)) -> dict[str, str | bool]:
    await get_authenticated_user(authorization)
    return {
        "configured": is_openai_configured(),
        "model": openai_model(),
    }


@router.post("/query", response_model=AiQueryOutput)
async def query_ai(payload: AiQueryInput, authorization: str | None = Header(default=None)) -> AiQueryOutput:
    await get_authenticated_user(authorization)
    answer = await generate_ai_answer(payload.prompt)
    return AiQueryOutput(**answer)
