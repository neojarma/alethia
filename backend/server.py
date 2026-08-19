import os
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response

load_dotenv()

NEXT_INTERNAL_URL = os.getenv("NEXT_INTERNAL_URL", "http://127.0.0.1:3000").rstrip("/")
PROXY_TIMEOUT_SECONDS = float(os.getenv("PROXY_TIMEOUT_SECONDS", "180"))
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "alethia")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    app.state.http = httpx.AsyncClient(
        base_url=NEXT_INTERNAL_URL,
        timeout=httpx.Timeout(PROXY_TIMEOUT_SECONDS),
        follow_redirects=False,
    )
    yield
    await app.state.http.aclose()


app = FastAPI(title="Alethia Emergent Gateway", lifespan=lifespan)

configured_origins = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "").split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=configured_origins or ["*"],
    allow_credentials=bool(configured_origins),
    allow_methods=["*"],
    allow_headers=["*"],
)

HOP_BY_HOP_HEADERS = {
    "connection",
    "content-encoding",
    "content-length",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailers",
    "transfer-encoding",
    "upgrade",
}


@app.get("/api/")
async def root() -> dict[str, str]:
    return {
        "service": "Alethia Emergent Gateway",
        "status": "ok",
        "upstream": NEXT_INTERNAL_URL,
        "database": DB_NAME,
    }


@app.api_route(
    "/api/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
)
async def proxy_to_next(path: str, request: Request) -> Response:
    body = await request.body()
    headers = {
        key: value
        for key, value in request.headers.items()
        if key.lower() not in HOP_BY_HOP_HEADERS and key.lower() != "host"
    }
    headers["x-forwarded-host"] = request.headers.get("host", "")
    headers["x-forwarded-proto"] = request.url.scheme

    try:
        upstream = await request.app.state.http.request(
            request.method,
            f"/api/{path}",
            params=request.query_params,
            content=body,
            headers=headers,
        )
    except httpx.RequestError as error:
        if path == "health":
            return JSONResponse(
                status_code=200,
                content={
                    "status": "starting",
                    "service": "Alethia Emergent Gateway",
                    "upstream": "unavailable",
                },
            )
        return JSONResponse(
            status_code=503,
            content={"error": "Alethia frontend API is unavailable", "detail": str(error)},
        )

    response = Response(content=upstream.content, status_code=upstream.status_code)
    for key, value in upstream.headers.multi_items():
        if key.lower() not in HOP_BY_HOP_HEADERS:
            response.headers.append(key, value)
    return response
