"""
Stats DAL module (DB access only).

TODO:
- create_stat(db, stat_data)
- list_stats_for_goal(db, goal_id, filters)
- aggregate_overall_for_user(db, user_id, range/type)
"""

from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.db.models.stat import Stat

async def create_stat(db: AsyncSession, stat_data: dict) -> Stat:
    new_stat = Stat(**stat_data)
    db.add(new_stat)
    await db.commit()
    await db.refresh(new_stat)
    return new_stat

async def list_stats_for_goal(db: AsyncSession, goal_id: int, filters: dict) -> List[Stat]:
    query = select(Stat).where(Stat.goal_id == goal_id)
    # Apply filters (e.g., date range)
    if "start_date" in filters:
        query = query.where(Stat.timestamp >= filters["start_date"])
    if "end_date" in filters:
        query = query.where(Stat.timestamp <= filters["end_date"])
    result = await db.execute(query)
    return result.scalars().all()

async def aggregate_overall_for_user(db: AsyncSession, user_id: int, range_type: str) -> dict:
    # Example: aggregate total count of stats for the user in the specified range
    query = select(func.count(Stat.id)).join(Stat.goal).where(Stat.goal.has(user_id=user_id))
    # Apply range/type filters (e.g., last 7 days, this month)
    if range_type == "last_7_days":
        query = query.where(Stat.timestamp >= func.now() - func.interval('7 days'))
    elif range_type == "this_month":
        query = query.where(func.extract('month', Stat.timestamp) == func.extract('month', func.now()))
    result = await db.execute(query)
    total_stats = result.scalar()
    return {"total_stats": total_stats}