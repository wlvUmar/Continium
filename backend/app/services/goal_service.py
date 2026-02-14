"""
Goal service (business logic).

TODO:
- Create/update/delete goals but enforce:
  - goal belongs to current user
  - deadline >= start_date
  - frequency enum validation
- Optionally: prevent stats creation if goal is_complete
"""
from app.db.dal import goal
from app.core.security import current_user
from app.db.models.goal import Goal
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status


async def create_goal(db: AsyncSession, goal_data: dict) -> Goal:
    cur_user = current_user()
    if not cur_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    new_goal = await goal.create_goal(db, user_id=cur_user.id, **goal_data)
    return new_goal
