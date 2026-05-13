from __future__ import annotations

from datetime import datetime, timezone
from urllib.parse import quote

from fastapi import APIRouter, Header

from app.schemas import (
    CalendarCreateInput,
    CalendarItemCreateInput,
    CalendarItemReorderInput,
    CalendarItemUpdateInput,
    CalendarUpdateInput,
)
from app.services.calendar_service import (
    assert_calendar_access,
    assert_item_access,
    create_calendar,
    create_calendar_item,
    duplicate_calendar,
    resolve_organization_id,
    soft_delete_calendar,
)
from app.services.supabase_service import get_authenticated_user, select_records, update_record

router = APIRouter(prefix="/api/calendars", tags=["calendarios"])


def _eq(column: str, value: str) -> str:
    return f"{column}=eq.{quote(value, safe='')}"


def _not_none(payload: dict) -> dict:
    return {key: value for key, value in payload.items() if value is not None}


@router.get("")
async def get_calendars(
    authorization: str | None = Header(default=None),
    organization_id: str | None = None,
    month: int | None = None,
    year: int | None = None,
    status: str | None = None,
    q: str | None = None,
) -> dict[str, list[dict]]:
    user = await get_authenticated_user(authorization)
    resolved_organization_id = await resolve_organization_id(user["id"], organization_id)

    filters = [
        "select=id,organization_id,user_id,name,description,month,year,status,metadata,created_at,updated_at",
        _eq("organization_id", resolved_organization_id),
        "deleted_at=is.null",
    ]
    if month:
        filters.append(f"month=eq.{month}")
    if year:
        filters.append(f"year=eq.{year}")
    if status:
        filters.append(f"status=eq.{quote(status, safe='')}")
    if q:
        filters.append(f"name=ilike.*{quote(q, safe='')}*")

    filters.append("order=year.desc,month.desc,updated_at.desc")
    records = await select_records("content_calendars", "&".join(filters))
    return {"calendars": records}


@router.post("")
async def create_calendar_endpoint(payload: CalendarCreateInput, authorization: str | None = Header(default=None)) -> dict:
    user = await get_authenticated_user(authorization)
    return await create_calendar(payload, user["id"])


@router.get("/{calendar_id}")
async def get_calendar_by_id(calendar_id: str, authorization: str | None = Header(default=None)) -> dict:
    user = await get_authenticated_user(authorization)
    calendar = await assert_calendar_access(calendar_id, user["id"])
    items = await select_records(
        "content_calendar_items",
        (
            "select=id,calendar_id,scheduled_date,content_type,title,description,objective,status,priority,"
            "observations,color_tag,position_in_day,metadata,created_at,updated_at"
            f"&{_eq('calendar_id', calendar_id)}&deleted_at=is.null&order=scheduled_date.asc,position_in_day.asc"
        ),
    )
    return {"calendar": calendar, "items": items}


@router.patch("/{calendar_id}")
async def update_calendar_endpoint(
    calendar_id: str,
    payload: CalendarUpdateInput,
    authorization: str | None = Header(default=None),
) -> dict:
    user = await get_authenticated_user(authorization)
    await assert_calendar_access(calendar_id, user["id"])
    return await update_record("content_calendars", _eq("id", calendar_id), _not_none(payload.model_dump())) or {}


@router.delete("/{calendar_id}")
async def delete_calendar_endpoint(calendar_id: str, authorization: str | None = Header(default=None)) -> dict[str, bool]:
    user = await get_authenticated_user(authorization)
    await soft_delete_calendar(calendar_id, user["id"])
    return {"deleted": True}


@router.post("/{calendar_id}/duplicate")
async def duplicate_calendar_endpoint(calendar_id: str, authorization: str | None = Header(default=None)) -> dict:
    user = await get_authenticated_user(authorization)
    return await duplicate_calendar(calendar_id, user["id"])


@router.post("/{calendar_id}/items")
async def create_calendar_item_endpoint(
    calendar_id: str,
    payload: CalendarItemCreateInput,
    authorization: str | None = Header(default=None),
) -> dict:
    user = await get_authenticated_user(authorization)
    return await create_calendar_item(calendar_id, payload, user["id"])


@router.patch("/items/{item_id}")
async def update_calendar_item_endpoint(
    item_id: str,
    payload: CalendarItemUpdateInput,
    authorization: str | None = Header(default=None),
) -> dict:
    user = await get_authenticated_user(authorization)
    await assert_item_access(item_id, user["id"])
    data = _not_none(payload.model_dump())
    if "scheduled_date" in data:
        data["scheduled_date"] = data["scheduled_date"].isoformat()
    return await update_record("content_calendar_items", _eq("id", item_id), data) or {}


@router.delete("/items/{item_id}")
async def delete_calendar_item_endpoint(item_id: str, authorization: str | None = Header(default=None)) -> dict[str, bool]:
    user = await get_authenticated_user(authorization)
    await assert_item_access(item_id, user["id"])
    await update_record(
        "content_calendar_items",
        _eq("id", item_id),
        {"deleted_at": datetime.now(timezone.utc).isoformat()},
    )
    return {"deleted": True}


@router.post("/{calendar_id}/items/reorder")
async def reorder_calendar_items_endpoint(
    calendar_id: str,
    payload: CalendarItemReorderInput,
    authorization: str | None = Header(default=None),
) -> dict[str, bool]:
    user = await get_authenticated_user(authorization)
    await assert_calendar_access(calendar_id, user["id"])
    for index, item_id in enumerate(payload.item_ids):
        item = await assert_item_access(item_id, user["id"])
        if item["calendar_id"] == calendar_id:
            await update_record("content_calendar_items", _eq("id", item_id), {"position_in_day": index})
    return {"reordered": True}
