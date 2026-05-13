from __future__ import annotations

import secrets
from datetime import datetime, timedelta, timezone
from typing import Any
from urllib.parse import urlencode

import httpx
from fastapi import HTTPException

from app.config import frontend_url, get_env, meta_graph_version, require_env
from app.services.supabase_service import insert_record, select_records, update_record

DEFAULT_SCOPES = ["public_profile"]


def meta_oauth_scopes() -> list[str]:
    raw_scopes = get_env("META_OAUTH_SCOPES")
    if not raw_scopes:
        return DEFAULT_SCOPES

    scopes = [scope.strip() for scope in raw_scopes.split(",") if scope.strip()]
    return scopes or DEFAULT_SCOPES


def _oauth_redirect_uri() -> str:
    return require_env("META_REDIRECT_URI")


def _meta_base_url() -> str:
    return f"https://graph.facebook.com/{meta_graph_version()}"


async def create_oauth_authorization_url(user_id: str) -> str:
    state = secrets.token_urlsafe(32)
    await insert_record(
        "oauth_states",
        {
            "user_id": user_id,
            "provider": "meta",
            "state": state,
            "redirect_to": "/?view=connections",
            "expires_at": (datetime.now(timezone.utc) + timedelta(minutes=10)).isoformat(),
        },
    )

    params = {
        "client_id": require_env("META_APP_ID"),
        "redirect_uri": _oauth_redirect_uri(),
        "state": state,
        "response_type": "code",
        "scope": ",".join(meta_oauth_scopes()),
    }
    return f"https://www.facebook.com/{meta_graph_version()}/dialog/oauth?{urlencode(params)}"


async def consume_oauth_state(state: str) -> dict[str, Any]:
    records = await select_records(
        "oauth_states",
        f"select=id,user_id,expires_at,consumed_at,state&state=eq.{state}&provider=eq.meta&limit=1",
    )

    if not records:
        raise HTTPException(status_code=400, detail="Estado OAuth invalido.")

    record = records[0]
    if record.get("consumed_at"):
        raise HTTPException(status_code=400, detail="Estado OAuth ya utilizado.")

    expires_at = datetime.fromisoformat(record["expires_at"].replace("Z", "+00:00"))
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Estado OAuth expirado.")

    await update_record(
        "oauth_states",
        f"id=eq.{record['id']}",
        {"consumed_at": datetime.now(timezone.utc).isoformat()},
    )
    return record


async def exchange_code_for_token(code: str) -> dict[str, Any]:
    params = {
        "client_id": require_env("META_APP_ID"),
        "client_secret": require_env("META_APP_SECRET"),
        "redirect_uri": _oauth_redirect_uri(),
        "code": code,
    }

    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.get(f"{_meta_base_url()}/oauth/access_token", params=params)

    if response.status_code >= 400:
        raise HTTPException(status_code=400, detail="Meta no pudo intercambiar el codigo OAuth.")

    return response.json()


async def fetch_meta_profile(access_token: str) -> dict[str, Any]:
    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.get(
            f"{_meta_base_url()}/me",
            params={"fields": "id,name", "access_token": access_token},
        )

    if response.status_code >= 400:
        return {}

    return response.json()


async def save_social_connection(user_id: str, token_data: dict[str, Any], profile: dict[str, Any]) -> dict[str, Any]:
    expires_in = token_data.get("expires_in")
    token_expiration = None
    if isinstance(expires_in, int):
        token_expiration = (datetime.now(timezone.utc) + timedelta(seconds=expires_in)).isoformat()

    provider_name = str(profile.get("name") or profile.get("id") or "Instagram")
    payload = {
        "user_id": user_id,
        "nombre_conexion": f"Instagram - {provider_name}",
        "plataforma": "instagram",
        "provider_user_id": profile.get("id"),
        "provider_username": profile.get("name"),
        "access_token": token_data["access_token"],
        "refresh_token": token_data.get("refresh_token"),
        "token_expiration": token_expiration,
        "scopes": meta_oauth_scopes(),
        "status": "active",
        "metadata": {"provider": "meta"},
    }
    return await insert_record("social_connections", payload)


def oauth_success_redirect(connection_id: str) -> str:
    return f"{frontend_url()}/?view=connections&connection_id={connection_id}&oauth=success"


def oauth_error_redirect(message: str) -> str:
    return f"{frontend_url()}/?view=connections&oauth=error&message={urlencode({'m': message})[2:]}"
