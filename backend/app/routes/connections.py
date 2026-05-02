from __future__ import annotations

from urllib.parse import quote

from fastapi import APIRouter, Header, HTTPException
from fastapi.responses import RedirectResponse

from app.schemas import ConnectionRenameInput
from app.services.meta_oauth_service import (
    consume_oauth_state,
    create_oauth_authorization_url,
    exchange_code_for_token,
    fetch_meta_profile,
    oauth_error_redirect,
    oauth_success_redirect,
    save_social_connection,
)
from app.services.supabase_service import get_authenticated_user, select_records, update_record

router = APIRouter(prefix="/api", tags=["conexiones"])


def _public_connection(record: dict) -> dict:
    return {
        "id": record["id"],
        "nombre_conexion": record["nombre_conexion"],
        "plataforma": record["plataforma"],
        "provider_username": record.get("provider_username"),
        "token_expiration": record.get("token_expiration"),
        "status": record.get("status", "active"),
        "created_at": record["created_at"],
        "updated_at": record["updated_at"],
    }


@router.get("/connections")
async def list_connections(authorization: str | None = Header(default=None)) -> dict[str, list[dict]]:
    user = await get_authenticated_user(authorization)
    records = await select_records(
        "social_connections",
        (
            "select=id,nombre_conexion,plataforma,provider_username,token_expiration,status,created_at,updated_at"
            f"&user_id=eq.{user['id']}&order=created_at.desc"
        ),
    )
    return {"connections": [_public_connection(record) for record in records]}


@router.post("/connections/oauth/meta/start")
async def start_meta_oauth(authorization: str | None = Header(default=None)) -> dict[str, str]:
    user = await get_authenticated_user(authorization)
    authorization_url = await create_oauth_authorization_url(user["id"])
    return {"authorization_url": authorization_url}


@router.get("/oauth/meta/callback")
async def meta_oauth_callback(code: str | None = None, state: str | None = None, error: str | None = None) -> RedirectResponse:
    if error:
        return RedirectResponse(oauth_error_redirect(quote(error)))

    if not code or not state:
        return RedirectResponse(oauth_error_redirect("callback_incompleto"))

    try:
        state_record = await consume_oauth_state(state)
        token_data = await exchange_code_for_token(code)
        profile = await fetch_meta_profile(token_data["access_token"])
        connection = await save_social_connection(state_record["user_id"], token_data, profile)
    except HTTPException as exc:
        return RedirectResponse(oauth_error_redirect(str(exc.detail)))
    except Exception:
        return RedirectResponse(oauth_error_redirect("no_se_pudo_guardar_la_conexion"))

    return RedirectResponse(oauth_success_redirect(connection["id"]))


@router.patch("/connections/{connection_id}")
async def rename_connection(
    connection_id: str,
    payload: ConnectionRenameInput,
    authorization: str | None = Header(default=None),
) -> dict:
    user = await get_authenticated_user(authorization)
    record = await update_record(
        "social_connections",
        f"id=eq.{connection_id}&user_id=eq.{user['id']}",
        {"nombre_conexion": payload.nombre_conexion},
    )

    if not record:
        raise HTTPException(status_code=404, detail="Conexion no encontrada.")

    return _public_connection(record)
