import logging
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.config import settings
from app.db.base import engine
from app.routes import ask, auth, entries, stats

logging.basicConfig(level=settings.log_level)
logger = logging.getLogger(__name__)

_start_time = time.time()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting %s v%s [%s]", settings.app_name, settings.app_version, settings.environment)
    yield
    logger.info("Shutdown complete")


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI-powered developer learning journal with RAG over your notes.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=(
        ["http://localhost:5173", "http://localhost:3000"]
        if not settings.is_production
        else []
    ),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(entries.router)
app.include_router(ask.router)
app.include_router(stats.router)


@app.get("/health", tags=["system"])
async def health_check() -> dict:
    db_status = "ok"
    try:
        async with engine.connect() as connection:
            await connection.execute(text("SELECT 1"))
    except Exception as exc:
        logger.warning("Health check database probe failed: %s", exc)
        db_status = "error"

    return {
        "status": "ok" if db_status == "ok" else "degraded",
        "database": db_status,
        "uptime_seconds": round(time.time() - _start_time, 2),
        "environment": settings.environment,
    }


@app.get("/")
async def root() -> dict:
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "docs": "/docs",
    }
