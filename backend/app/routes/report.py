from __future__ import annotations

from fastapi import APIRouter, HTTPException
from fastapi.responses import Response

from app.schemas import ReportInput
from app.services.report_service import generate_report_pdf

router = APIRouter(prefix="/api", tags=["reportes"])


@router.get("/health")
async def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


@router.post("/report/pdf")
async def create_report_pdf(payload: ReportInput) -> Response:
    try:
        pdf = generate_report_pdf(payload)
    except Exception as exc:  # pragma: no cover - defensive fallback
        raise HTTPException(status_code=500, detail=f"No se pudo generar el PDF: {exc}") from exc

    filename = f"serenita-cm-{payload.cuenta}-{payload.periodo}.pdf".replace(" ", "-").lower()
    headers = {"Content-Disposition": f'attachment; filename="{filename}"'}
    return Response(content=pdf, media_type="application/pdf", headers=headers)
