"""
Stats endpoints (HTTP layer only).

TODO endpoints:
- POST /stats
- GET  /stats/{goal_id}?type=
- GET  /stats/overall

RULE:
- Use get_current_user dependency
- Call stat_service methods
"""

from app.api import get_db
from fastapi import APIRouter, Depends, HTTPException, status
from app.services import stat_service
from app.schemas.stat import StatCreate, StatOut, OverallOut
from app.db.models.user import User
from app.core.security import get_current_user
from typing_extensions import Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date





router = APIRouter(prefix="/stats", tags=["stats"])



@router.post("/goal/{goal_id}", response_model=StatOut)
async def add_stat(goal_id: int, stat_data: StatCreate, db=Depends(get_db), user = Depends(get_current_user)):
    """
    Log a work session for a goal. If a record already exists for the same goal on the same day,
    `duration_minutes` is added to it rather than creating a duplicate row.

    Requires `Authorization: Bearer <access_token>`.
    """
    return await stat_service.add_stat(db, goal_id, stat_data, user=user)


@router.get("/goal/{goal_id}", response_model=list[StatOut])
async def get_goal_stats(goal_id: int, db=Depends(get_db), user = Depends(get_current_user)):
    """
    Return all session records logged for a specific goal by the authenticated user.

    Requires `Authorization: Bearer <access_token>`.
    """
    return await stat_service.get_goal_stats(db, goal_id=goal_id,  user=user)

@router.get("/overall", response_model=OverallOut)
async def get_overall_stats(db=Depends(get_db), user = Depends(get_current_user)):
    """
    Aggregate total tracked minutes per goal for the authenticated user.
    Returns `{ "total_stats": { "goal_title": minutes } }`.

    Requires `Authorization: Bearer <access_token>`.
    """
    return await stat_service.overall(db, user=user)

@router.get("/overall-by-type")
async def get_overall_stats_by_type(type: stat_service.Type=stat_service.Type.one_time, db=Depends(get_db), user = Depends(get_current_user)):
    """
    Same as `/overall` but filtered by goal type. Pass `type=One Time` or `type=Repeating`.

    Requires `Authorization: Bearer <access_token>`.
    """
    return await stat_service.get_overall_stats_by_type(db, type=type, user=user)

@router.get("/{goal_id}/by-date-range", response_model=list[StatOut])
async def get_stats_by_date_range(goal_id: int, start_date: str, end_date: str, db=Depends(get_db), user = Depends(get_current_user)):
    """
    Return session records for a goal within a date range (inclusive). Pass `start_date` and `end_date` as `YYYY-MM-DD`.

    Requires `Authorization: Bearer <access_token>`.
    """
    return await stat_service.get_stats_by_date_range(db, goal_id, start_date, end_date, user=user)


