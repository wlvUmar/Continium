"""
Goal DAL module (DB access only).

TODO:
- create_goal(db, user_id, goal_data)
- list_goals(db, user_id)
- get_goal(db, goal_id)
- update_goal(db, goal_id, fields)
- delete_goal(db, goal_id)
- IMPORTANT: DAL should NOT enforce ownership; service should.
"""

from datetime import date
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from app.db.models.goal import Goal

async def create_goal(db: AsyncSession, user_id: int, goal_data: dict) -> Goal:
    new_goal = Goal(user_id=user_id, **goal_data)
    db.add(new_goal)
    await db.commit()
    await db.refresh(new_goal)
    return new_goal

async def list_goals(db: AsyncSession, user_id: int, skip: int = 0, limit: int = 100) -> List[Goal]:
    result = await db.execute(select(Goal).where(Goal.user_id == user_id).offset(skip).limit(limit))
    return result.scalars().all()

async def get_goal(db: AsyncSession, goal_id: int) -> Optional[Goal]:
    result = await db.execute(select(Goal).where(Goal.id == goal_id))
    return result.scalars().first()

async def update_goal(db: AsyncSession, goal_id: int, fields: dict) -> Optional[Goal]:
    await db.execute(update(Goal).where(Goal.id == goal_id).values(**fields))
    await db.commit()
    return await get_goal(db, goal_id)

async def delete_goal(db: AsyncSession, goal_id: int) -> bool:
    result = await db.execute(delete(Goal).where(Goal.id == goal_id))
    await db.commit()
    return result.rowcount > 0


async def get_goal_by_id(db: AsyncSession, goal_id: int) -> Optional[Goal]:
    result = await db.execute(select(Goal).where(Goal.id == goal_id))
    return result.scalars().first()

async def get_goal_by_date(db: AsyncSession, user_id: int, target_date: date) -> List[Goal]:
    result = await db.execute(
        select(Goal).where(
            Goal.user_id == user_id,
            Goal.start_date <= target_date,
            Goal.deadline >= target_date
        )
    )
    return result.scalars().all()

async def filter_incomplete(db: AsyncSession, user_id: int, is_complete: bool, skip: int = 0, limit: int = 100) -> List[Goal]:
    result = await db.execute(
        select(Goal).where(
            Goal.user_id == user_id,
            Goal.is_complete == is_complete
        ).offset(skip).limit(limit)

    )
    return result.scalars().all()