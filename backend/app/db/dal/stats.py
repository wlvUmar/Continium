"""
Stats DAL module (DB access only).

TODO:
- create_stat(db, stat_data)
- list_stats_for_goal(db, goal_id, filters)
- aggregate_overall_for_user(db, user_id, range/type)
"""

from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update
from app.db.models.stats import Stats

async def create_stat(
    db: AsyncSession,
    goal_id: int,
    user_id: int,
    duration_minutes: int,
    occurred_at: datetime | None = None,
) -> Stats:
    if occurred_at is None:
        occurred_at = datetime.now(timezone.utc)

    obj = Stats(
        goal_id=goal_id,
        user_id=user_id,
        duration_minutes=duration_minutes,
        occurred_at=occurred_at,
    )
    db.add(obj)
    await db.commit()
    await db.refresh(obj)
    return obj

async def list_stats_for_goal(db: AsyncSession, goal_id: int, filters: dict) -> List[Stats]:
    query = select(Stats).where(Stats.goal_id == goal_id)
    if "start_date" in filters:
        query = query.where(Stats.timestamp >= filters["start_date"])
    if "end_date" in filters:
        query = query.where(Stats.timestamp <= filters["end_date"])
    result = await db.execute(query)
    return result.scalars().all()

async def aggregate_overall_for_user(db: AsyncSession, user_id: int) -> dict:
    query = select(func.sum(Stats.duration_minutes)).where(Stats.user_id == user_id)
    result = await db.execute(query)
    total = result.scalar() or 0
    return {"total_minutes": total}

async def get_stat_by_goal_and_date(
    db: AsyncSession,
    user_id: int,
    goal_id: int,
    date: datetime | None,
) -> Optional[Stats]:
    if date is None:
        date = datetime.now(timezone.utc)
    
    # Extract just the date part for comparison
    target_date = date.date() if hasattr(date, 'date') else date
    
    query = select(Stats).where(
        Stats.user_id == user_id,
        Stats.goal_id == goal_id,
        func.date(Stats.occurred_at) == target_date,
    )
    result = await db.execute(query)
    return result.scalars().first()


async def get_stat(db: AsyncSession, stat_id: int) -> Optional[Stats]:
    query = select(Stats).where(Stats.id == stat_id)
    result = await db.execute(query)
    return result.scalar()

async def update_stat(db: AsyncSession, stat_id: int, fields: dict) -> Optional[Stats]:
    await db.execute(update(Stats).where(Stats.id == stat_id).values(**fields))
    await db.commit()
    return await get_stat(db, stat_id)

async def get_stats_by_date(db: AsyncSession, user_id: int, target_date: str) -> List[Stats]:
    # Parse target_date if it's a string (expecting YYYY-MM-DD format)
    from datetime import datetime as dt
    if isinstance(target_date, str):
        target_date = dt.strptime(target_date, '%Y-%m-%d').date()
    
    query = select(Stats).join(Stats.goal).where(
        Stats.goal.has(user_id=user_id),
        func.date(Stats.occurred_at) == target_date
    )
    result = await db.execute(query)
    return result.scalars().all()



async def get_stats_by_type(db: AsyncSession,user_id: int, type: str) -> List[Stats]:
    query = select(Stats).join(Stats.goal).where(
        Stats.goal.has(user_id=user_id),
        Stats.goal.has(type=type)
                )
    result = await db.execute(query)
    return result.scalars().all()

async def get_stats_by_date_range(
    db: AsyncSession,
    user_id: int,
    goal_id: int,
    start_date: datetime,
    end_date: datetime,
):
    # Extract just the date parts for comparison
    start = start_date.date() if hasattr(start_date, 'date') else start_date
    end = end_date.date() if hasattr(end_date, 'date') else end_date
    
    query = (
        select(Stats)
        .join(Stats.goal)
        .where(
            Stats.goal.has(user_id=user_id),
            Stats.goal_id == goal_id,
            func.date(Stats.occurred_at) >= start,
            func.date(Stats.occurred_at) <= end,
        )
        .order_by(Stats.occurred_at)
    )

    result = await db.execute(query)
    return result.scalars().all()


async def get_stats_by_goal(db: AsyncSession, goal_id:int,  user_id: int) -> List[Stats]:
    query = select(Stats).join(Stats.goal).where(
        Stats.goal.has(user_id=user_id),
        Stats.goal_id == goal_id
    )
    result = await db.execute(query)
    return result.scalars().all()