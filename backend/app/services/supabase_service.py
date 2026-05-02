from __future__ import annotations

from typing import Any

import httpx
from fastapi import HTTPException, status

from app.config import require_env


def _supabase_headers(use_user_token: str | None = None) -> dict[str, str]:
    service_role_key = require_env("SUPABASE_SERVICE_ROLE_KEY")
    return {
        "apikey": service_role_key,
        "Authorization": f"Bearer {use_user_token or service_role_key}",
        "Content-Type": "application/json",
    }


def supabase_url() -> str:
    return require_env("SUPABASE_URL").rstrip("/")


async def get_authenticated_user(authorization: str | None) -> dict[str, Any]:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Falta token de sesion.")

    token = authorization.split(" ", 1)[1].strip()
    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.get(
            f"{supabase_url()}/auth/v1/user",
            headers={
                "apikey": require_env("SUPABASE_SERVICE_ROLE_KEY"),
                "Authorization": f"Bearer {token}",
            },
        )

    if response.status_code >= 400:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sesion invalida o expirada.")

    return response.json()


async def insert_record(table: str, payload: dict[str, Any]) -> dict[str, Any]:
    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.post(
            f"{supabase_url()}/rest/v1/{table}",
            headers={**_supabase_headers(), "Prefer": "return=representation"},
            json=payload,
        )

    if response.status_code >= 400:
        raise HTTPException(status_code=500, detail=f"No se pudo guardar en {table}.")

    data = response.json()
    return data[0] if isinstance(data, list) and data else data


async def select_records(table: str, query: str) -> list[dict[str, Any]]:
    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.get(
            f"{supabase_url()}/rest/v1/{table}?{query}",
            headers=_supabase_headers(),
        )

    if response.status_code >= 400:
        raise HTTPException(status_code=500, detail=f"No se pudo consultar {table}.")

    data = response.json()
    return data if isinstance(data, list) else []


async def update_record(table: str, query: str, payload: dict[str, Any]) -> dict[str, Any] | None:
    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.patch(
            f"{supabase_url()}/rest/v1/{table}?{query}",
            headers={**_supabase_headers(), "Prefer": "return=representation"},
            json=payload,
        )

    if response.status_code >= 400:
        raise HTTPException(status_code=500, detail=f"No se pudo actualizar {table}.")

    data = response.json()
    if isinstance(data, list) and data:
        return data[0]
    return None
