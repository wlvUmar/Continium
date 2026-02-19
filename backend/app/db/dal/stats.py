"""
Stats DAL module (DB access only).

TODO:
- create_stat(db, stat_data)
- list_stats_for_goal(db, goal_id, filters)
- aggregate_overall_for_user(db, user_id, range/type)
"""

from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update
from app.db.models.stats import Stats

async def create_stat(db: AsyncSession, stat_data: dict, goal_id: int) -> Stats:
    new_stat = Stats(**stat_data, goal_id=goal_id)
    db.add(new_stat)
    await db.commit()
    await db.refresh(new_stat)
    return new_stat

async def list_stats_for_goal(db: AsyncSession, goal_id: int, filters: dict) -> List[Stats]:
    query = select(Stats).where(Stats.goal_id == goal_id)
    if "start_date" in filters:
        query = query.where(Stats.timestamp >= filters["start_date"])
    if "end_date" in filters:
        query = query.where(Stats.timestamp <= filters["end_date"])
    result = await db.execute(query)
    return result.scalars().all()

async def aggregate_overall_for_user(db: AsyncSession, user_id: int, range_type: str) -> dict:
    query = select(func.count(Stats.id)).join(Stats.goal).where(Stats.goal.has(user_id=user_id))
    if range_type == "last_7_days":
        query = query.where(Stats.timestamp >= func.now() - func.interval('7 days'))
    elif range_type == "this_month":
        query = query.where(func.extract('month', Stats.timestamp) == func.extract('month', func.now()))
    result = await db.execute(query)
    total_stats = result.scalar()
    return {"total_stats": total_stats}

async def get_stat(db: AsyncSession, stat_id: int) -> Optional[Stats]:
    query = select(Stats).where(Stats.id == stat_id)
    result = await db.execute(query)
    return result.scalar()

async def update_stat(db: AsyncSession, stat_id: int, fields: dict) -> Optional[Stats]:
    await db.execute(update(Stats).where(Stats.id == stat_id).values(**fields))
    await db.commit()
    return await get_stat(db, stat_id)

async def get_stats_by_date(db: AsyncSession, user_id: int, target_date: str) -> List[Stats]:
    query = select(Stats).join(Stats.goal).where(
        Stats.goal.has(user_id=user_id),
        func.date(Stats.occurred_at) == target_date
    )
    result = await db.execute(query)
    return result.scalars().all()



async def get_stats_by_type(db: AsyncSession, user_id: int, type: str) -> List[Stats]:
    query = select(Stats).join(Stats.goal).where(
        Stats.goal.has(user_id=user_id),
        Stats.type == type
    )
    result = await db.execute(query)
    return result.scalars().all()


