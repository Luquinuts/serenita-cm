from __future__ import annotations

import os


def get_env(name: str, default: str | None = None) -> str | None:
    value = os.getenv(name, default)
    if value is None:
        return None
    return value.strip()


def require_env(name: str) -> str:
    value = get_env(name)
    if not value:
        raise RuntimeError(f"Falta configurar la variable de entorno {name}.")
    return value


def frontend_url() -> str:
    return (get_env("FRONTEND_URL") or "http://localhost:5173").rstrip("/")


def meta_graph_version() -> str:
    return get_env("META_GRAPH_VERSION", "v20.0") or "v20.0"
