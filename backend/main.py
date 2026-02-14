"""
Entry point for FastAPI app.
"""

from fastapi import FastAPI

from app.api.router import api_router
from app.core.logging_setup import setup_logging
setup_logging()

app = FastAPI(title="Continium API")
app.include_router(api_router, prefix="/api/v1")

