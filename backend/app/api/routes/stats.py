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
    return await stat_service.add_stat(db, goal_id, stat_data, user=user)


@router.get("/goal/{goal_id}", response_model=list[StatOut])
async def get_goal_stats(goal_id: int, db=Depends(get_db), user = Depends(get_current_user)):
    return await stat_service.get_goal_stats(db, goal_id=goal_id,  user=user)

@router.get("/overall", response_model=OverallOut)
async def get_overall_stats(db=Depends(get_db), user = Depends(get_current_user)):
    return await stat_service.overall(db, user=user)

@router.get("/{goal_id}/by-date-range", response_model=list[StatOut])
async def get_stats_by_date_range(goal_id: int, start_date: str, end_date: str, db=Depends(get_db), user = Depends(get_current_user)):
    return await stat_service.get_stats_by_date_range(db, goal_id, start_date, end_date, user=user)


# @router.get("/{goal_id}/by-type", response_model=list[StatOut])
# async def get_stats_by_type(goal_id: int, type: stat_service.Type, db=Depends(get_db), user = Depends(get_current_user)):
#     return await stat_service.get_stats_by_type(db, goal_id, type, user=user)

@router.get("/overall-by-type")
async def get_overall_stats_by_type(type: stat_service.Type=stat_service.Type.one_time, db=Depends(get_db), user = Depends(get_current_user)):
    return await stat_service.get_overall_stats_by_type(db, type=type, user=user)

