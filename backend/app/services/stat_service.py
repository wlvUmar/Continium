"""
Stats service (business logic).

TODO:
- add_stat(): verify goal exists + belongs to current user
- get_goal_stats(): filters by type (day/week/month/custom)
- overall(): aggregate totals for current user
- Define what "type=" means (e.g., last_7_days, this_month, custom range)
"""
from typing_extensions import Annotated
from app.core.security import current_user, get_current_user
from app.db.models.stats import Stats
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends, HTTPException, status
from app.schemas.stat import StatCreate, StatOut, OverallOut
from app.db.models.user import User
from app.db.dal import stats
from datetime import date





async def add_stat(db: AsyncSession, goal_id: int, stat_data: StatCreate, user : Annotated[User, Depends(get_current_user)]) -> StatOut:
    cur_user = current_user()
    if not cur_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    old_stat = await stats.get_stat_by_goal_and_date(db, user_id=cur_user.id, goal_id=goal_id, date=stat_data.occurred_at)
    if old_stat is None:
        new_stat = await stats.create_stat(db, goal_id=goal_id, **stat_data.dict(exclude_unset=True))
    else:
        stat_data.duration = old_stat.duration + stat_data.duration
        new_stat = await stats.update_stat(db, old_stat.id, stat_data.dict(exclude_unset=True))
    return StatOut.from_orm(new_stat)


async def get_goal_stats(db: AsyncSession, goal_id: int, type: str, user : Annotated[User, Depends(get_current_user)]) -> list[StatOut]:
    cur_user = current_user()
    if not cur_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    stats = await stats.get_stats_by_goal(db, user_id=cur_user.id, goal_id=goal_id, type=type)
    return [StatOut.from_orm(s) for s in stats]

async def overall(db: AsyncSession, user : Annotated[User, Depends(get_current_user)]) -> OverallOut:
    cur_user = current_user()
    if not cur_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    total_stats = await stats.get_overall_stats(db, user_id=cur_user.id)
    return OverallOut(total_stats=total_stats)


async def get_stats_by_date_range(db: AsyncSession, goal_id: int, start_date: str, end_date: str, user : Annotated[User, Depends(get_current_user)]) -> list[StatOut]:
    cur_user = current_user()
    if not cur_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    stats = await stats.get_stats_by_date_range(db, user_id=cur_user.id, goal_id=goal_id, start_date=start_date, end_date=end_date)
    return [StatOut.from_orm(s) for s in stats]

async def get_stats_by_type(db: AsyncSession, goal_id: int, type: str, user : Annotated[User, Depends(get_current_user)]) -> list[StatOut]:
    cur_user = current_user()
    if not cur_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    stats = await stats.get_stats_by_type(db, user_id=cur_user.id, goal_id=goal_id, type=type)
    return [StatOut.from_orm(s) for s in stats]


async def get_overall_stats_by_type(db: AsyncSession, type: str, user : Annotated[User, Depends(get_current_user)]) -> OverallOut:
    cur_user = current_user()
    if not cur_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")

    all_stats = await stats.get_stats_by_type(db, user_id=cur_user.id, type=type)
    total_stats = sum(s.duration for s in all_stats)

    return OverallOut(total_stats=total_stats)

