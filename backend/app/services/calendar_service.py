from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from urllib.parse import quote

from fastapi import HTTPException

from app.schemas import CalendarCreateInput, CalendarItemCreateInput
from app.services.supabase_service import insert_record, select_records, update_record


def _eq(column: str, value: str) -> str:
    return f"{column}=eq.{quote(value, safe='')}"


async def list_user_organizations(user_id: str) -> list[dict[str, Any]]:
    return await select_records(
        "organization_members",
        f"select=organization_id,role,organizations(id,name)&{_eq('user_id', user_id)}",
    )


async def resolve_organization_id(user_id: str, organization_id: str | None = None) -> str:
    memberships = await list_user_organizations(user_id)
    if organization_id:
        if any(record.get("organization_id") == organization_id for record in memberships):
            return organization_id
        raise HTTPException(status_code=403, detail="No tenes permisos sobre esta organizacion.")

    if memberships:
        return str(memberships[0]["organization_id"])

    organization = await insert_record(
        "organizations",
        {
            "name": "Mi organizacion",
            "subscription_status": "manual",
        },
    )
    await insert_record(
        "organization_members",
        {
            "organization_id": organization["id"],
            "user_id": user_id,
            "role": "owner",
        },
    )
    return str(organization["id"])


async def assert_calendar_access(calendar_id: str, user_id: str) -> dict[str, Any]:
    records = await select_records(
        "content_calendars",
        (
            "select=id,organization_id,user_id,name,description,month,year,status,metadata,created_at,updated_at"
            f"&{_eq('id', calendar_id)}&deleted_at=is.null&limit=1"
        ),
    )
    if not records:
        raise HTTPException(status_code=404, detail="Calendario no encontrado.")

    organization_id = str(records[0]["organization_id"])
    memberships = await list_user_organizations(user_id)
    if not any(record.get("organization_id") == organization_id for record in memberships):
        raise HTTPException(status_code=403, detail="No tenes permisos sobre este calendario.")

    return records[0]


async def assert_item_access(item_id: str, user_id: str) -> dict[str, Any]:
    records = await select_records(
        "content_calendar_items",
        (
            "select=id,calendar_id,scheduled_date,content_type,title,description,objective,status,priority,"
            "observations,color_tag,position_in_day,metadata,created_at,updated_at"
            f"&{_eq('id', item_id)}&deleted_at=is.null&limit=1"
        ),
    )
    if not records:
        raise HTTPException(status_code=404, detail="Item no encontrado.")

    await assert_calendar_access(str(records[0]["calendar_id"]), user_id)
    return records[0]


async def create_calendar(payload: CalendarCreateInput, user_id: str) -> dict[str, Any]:
    organization_id = await resolve_organization_id(user_id, payload.organization_id)
    return await insert_record(
        "content_calendars",
        {
            "organization_id": organization_id,
            "user_id": user_id,
            "name": payload.name,
            "description": payload.description,
            "month": payload.month,
            "year": payload.year,
            "status": payload.status,
            "metadata": payload.metadata,
        },
    )


async def create_calendar_item(calendar_id: str, payload: CalendarItemCreateInput, user_id: str) -> dict[str, Any]:
    await assert_calendar_access(calendar_id, user_id)
    return await insert_record(
        "content_calendar_items",
        {
            "calendar_id": calendar_id,
            "scheduled_date": payload.scheduled_date.isoformat(),
            "content_type": payload.content_type,
            "title": payload.title,
            "description": payload.description,
            "objective": payload.objective,
            "status": payload.status,
            "priority": payload.priority,
            "observations": payload.observations,
            "color_tag": payload.color_tag,
            "position_in_day": payload.position_in_day,
            "metadata": payload.metadata,
        },
    )


async def duplicate_calendar(calendar_id: str, user_id: str) -> dict[str, Any]:
    calendar = await assert_calendar_access(calendar_id, user_id)
    duplicated = await insert_record(
        "content_calendars",
        {
            "organization_id": calendar["organization_id"],
            "user_id": user_id,
            "name": f"{calendar['name']} - copia",
            "description": calendar.get("description"),
            "month": calendar["month"],
            "year": calendar["year"],
            "status": "draft",
            "metadata": {**(calendar.get("metadata") or {}), "duplicated_from": calendar_id},
        },
    )

    items = await select_records(
        "content_calendar_items",
        (
            "select=scheduled_date,content_type,title,description,objective,status,priority,observations,color_tag,"
            f"position_in_day,metadata&{_eq('calendar_id', calendar_id)}&deleted_at=is.null&order=scheduled_date.asc,position_in_day.asc"
        ),
    )
    for item in items:
        await insert_record(
            "content_calendar_items",
            {
                **item,
                "calendar_id": duplicated["id"],
                "status": "pendiente",
                "metadata": {**(item.get("metadata") or {}), "duplicated_from_calendar": calendar_id},
            },
        )

    return duplicated


async def soft_delete_calendar(calendar_id: str, user_id: str) -> dict[str, Any] | None:
    await assert_calendar_access(calendar_id, user_id)
    deleted_at = datetime.now(timezone.utc).isoformat()
    await update_record("content_calendar_items", f"{_eq('calendar_id', calendar_id)}&deleted_at=is.null", {"deleted_at": deleted_at})
    return await update_record("content_calendars", f"{_eq('id', calendar_id)}", {"deleted_at": deleted_at})
