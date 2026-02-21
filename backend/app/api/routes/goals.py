"""
Goals endpoints (HTTP layer only).

TODO endpoints:
- GET    /goals
- POST   /goals
- GET    /goals/{goal_id}
- PUT    /goals/{goal_id} (or PATCH)
- DELETE /goals/{goal_id}

RULE:
- Use get_current_user dependency
- Call goal_service methods
"""

from datetime import date
from app.api import get_db
from app.services import goal_service
from app.schemas.goal import GoalCreate, GoalOut, GoalUpdate
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import get_current_user

router = APIRouter(prefix="/goals", tags=["goals"])

@router.post("/", response_model=GoalOut)
async def create_goal(goal_data: GoalCreate, db=Depends(get_db), user = Depends(get_current_user)):
    return await goal_service.create_goal(db, goal_data, user=user)


@router.get("/", response_model=list[GoalOut])
async def list_goals(skip: int = 0, limit: int = 100, db=Depends(get_db), user = Depends(get_current_user)):
    return await goal_service.get_goals(db, skip=skip, limit=limit, user=user)

@router.put("/{goal_id}", response_model=GoalOut)
async def update_goal(goal_id: int, goal_data: GoalUpdate, db=Depends(get_db), user = Depends(get_current_user)):
    return await goal_service.update_goal(db, goal_id, goal_data, user=user)

@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_goal(goal_id: int, db=Depends(get_db), user = Depends(get_current_user)):
    await goal_service.delete_goal(db, goal_id, user=user)

@router.patch("/{goal_id}/complete", response_model=GoalOut)
async def update_goal_completion(goal_id: int, is_complete: bool=True, db=Depends(get_db), user = Depends(get_current_user)):
    return await goal_service.update_goal_completion(db, goal_id, is_complete, user=user)

@router.get("/by-date/{target_date}", response_model=list[GoalOut])
async def get_goals_by_date(target_date: date = date.today(), db=Depends(get_db), user = Depends(get_current_user)):
    return await goal_service.get_goal_by_date(db, target_date=target_date, user=user)

@router.get("/filter-by-completion", response_model=list[GoalOut])
async def get_goals_by_completion(skip: int = 0, limit: int = 100,is_complete: bool = False, db=Depends(get_db), user = Depends(get_current_user)):
    return await goal_service.filter_by_completion(db, is_complete=is_complete, skip=skip, limit=limit, user=user)

@router.get("/search")
async def  get_by_name(name:str, db=Depends(get_db), user=Depends(get_current_user), skip:int=0, take=100):
    return await goal_service.get_by_name(name, db, user, skip=skip, take=take)