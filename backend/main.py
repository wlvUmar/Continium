"""
Entry point for FastAPI app.
"""

from contextlib import asynccontextmanager

from app.api.router import api_router
from app.core.config import settings
from app.core.logging_setup import setup_logging
from app.db import models  # noqa: F401 — ensures all models are registered with Base
from app.db.base import Base
from app.db.session import engine
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(title="Continium API", lifespan=lifespan)

# In dev mode allow every origin (covers file://, any localhost port, Live Server, etc.)
# allow_credentials must be False when allow_origins=["*"] — CORS spec forbids the combo.
_dev_mode = settings.env == "dev"
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if _dev_mode else settings.cors_origins,
    allow_credentials=False if _dev_mode else settings.cors_allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(api_router, prefix="/api/v1")


@app.get("/health", tags=["health"])
async def health():
    return {"status": "ok"}
