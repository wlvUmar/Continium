"""
Entry point for FastAPI app.
"""

from fastapi import FastAPI

from backend.app.api.router import api_router
from backend.app.core.logging_setup import setup_logging

setup_logging()

app = FastAPI(title="Continium API")
app.include_router(api_router)
