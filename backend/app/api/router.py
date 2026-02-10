"""
API router aggregator.
"""

from fastapi import APIRouter

api_router = APIRouter()

# TODO: include sub-routers:
# from backend.app.api.routes import auth, goals, stats
# api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
# api_router.include_router(goals.router, prefix="/goals", tags=["goals"])
# api_router.include_router(stats.router, prefix="/stats", tags=["stats"])
