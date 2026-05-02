import asyncio

from app.routes.report import healthcheck


def test_healthcheck() -> None:
    response = asyncio.run(healthcheck())
    assert response == {"status": "ok"}
