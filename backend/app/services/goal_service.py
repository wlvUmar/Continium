"""
Goal service (business logic).

TODO:
- Create/update/delete goals but enforce:
  - goal belongs to current user
  - deadline >= start_date
  - frequency enum validation
- Optionally: prevent stats creation if goal is_complete
"""
from typing_extensions import Annotated
from app.db.dal import goal
from app.core.security import current_user, get_current_user
from app.db.models.goal import Goal
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends, HTTPException, status

from app.schemas.goal import GoalCreate, GoalOut, GoalUpdate
from app.db.models.user import User


async def create_goal(
    db: AsyncSession,
    goal_data: GoalCreate,
    user: User
) -> GoalOut:

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized"
        )

    # превращаем модель в словарь
    goal_dict = goal_data.model_dump()

    new_goal = await goal.create_goal(
        db,
        user_id=user.id,
        goal_data=goal_dict
    )

    return GoalOut.model_validate(new_goal)

async def get_goals(db: AsyncSession, user:User, skip: int = 0, limit: int = 100) -> list[GoalOut]:
    cur_user = user
    if not cur_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    goals = await goal.list_goals(db, user_id=cur_user.id, skip=skip, limit=limit)
    return [GoalOut.from_orm(g) for g in goals]

async def update_goal(db: AsyncSession, goal_id: int, goal_data: GoalUpdate, user:User) -> GoalOut:
    cur_user = user
    if not cur_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    existing_goal = await goal.get_goal(db, goal_id)
    if not existing_goal or existing_goal.user_id != cur_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")
    updated_goal = await goal.update_goal(db, goal_id, fields=goal_data.dict(exclude_unset=True))
    return GoalOut.from_orm(updated_goal)


async def delete_goal(db: AsyncSession, goal_id: int, user:User) -> None:
    cur_user = user
    if not cur_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    existing_goal = await goal.get_goal_by_id(db, goal_id)
    if not existing_goal or existing_goal.user_id != cur_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")
    await goal.delete_goal(db, goal_id)

async def update_goal_completion(db: AsyncSession, goal_id: int, is_complete: bool, user:User) -> GoalOut:
    cur_user = user
    if not cur_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    existing_goal = await goal.get_goal(db, goal_id)
    if not existing_goal or existing_goal.user_id != cur_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")
    updated_goal = await goal.update_goal(db, goal_id, fields={"is_complete": is_complete})
    return GoalOut.from_orm(updated_goal)

async def get_goal_by_id(db: AsyncSession, goal_id: int, user:User) -> GoalOut:
    cur_user = user
    if not cur_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    existing_goal = await goal.get_goal_by_id(db, goal_id)
    if not existing_goal or existing_goal.user_id != cur_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")
    return GoalOut.from_orm(existing_goal)


async def get_goal_by_date(db: AsyncSession, target_date, user:User) -> list[GoalOut]:
    cur_user = user
    if not cur_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    goals = await goal.get_goal_by_date(db, user_id=cur_user.id, target_date=target_date)
    return [GoalOut.from_orm(g) for g in goals]


async def filter_by_completion(db: AsyncSession, is_complete: bool , user: User,  skip: int = 0, limit: int = 100) -> list[GoalOut]:
    cur_user = user
    if not cur_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    goals = await goal.filter_incomplete(db, user_id=cur_user.id, is_complete=is_complete, skip=skip, limit=limit)
    return [GoalOut.from_orm(g) for g in goals]

async def get_by_name(name:str, db:AsyncSession, user:User, skip:int=0, take:int=100)-> list[GoalOut]:
    current_user = user
    if not current_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="UnAuthorized")
    goals = await goal.get_by_name(db, name, skip, take)
    return [GoalOut.from_orm(g) for g in goals]