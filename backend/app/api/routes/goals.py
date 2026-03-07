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
    """
    Create a new goal for the authenticated user.

    Requires `Authorization: Bearer <access_token>`.
    """
    return await goal_service.create_goal(db, goal_data, user=user)


@router.get("/", response_model=list[GoalOut])
async def list_goals(skip: int = 0, limit: int = 100, db=Depends(get_db), user = Depends(get_current_user)):
    """
    Return all goals for the authenticated user. Supports `skip` and `limit` pagination.

    Requires `Authorization: Bearer <access_token>`.
    """
    return await goal_service.get_goals(db, skip=skip, limit=limit, user=user)

@router.get("/search")
async def get_by_name(name: str, db=Depends(get_db), user=Depends(get_current_user), skip: int = 0, take: int = 100):
    """
    Search goals by title (case-insensitive substring match). Returns matching goals for the authenticated user.

    Requires `Authorization: Bearer <access_token>`.
    """
    return await goal_service.get_by_name(name, db, user, skip=skip, take=take)

@router.get("/by-date/{target_date}", response_model=list[GoalOut])
async def get_goals_by_date(target_date: date = date.today(), db=Depends(get_db), user = Depends(get_current_user)):
    """
    Return all goals active on a given date (`start_date <= target_date <= deadline`).

    Requires `Authorization: Bearer <access_token>`.
    """
    return await goal_service.get_goal_by_date(db, target_date=target_date, user=user)

@router.get("/filter-by-completion", response_model=list[GoalOut])
async def get_goals_by_completion(skip: int = 0, limit: int = 100, is_complete: bool = False, db=Depends(get_db), user = Depends(get_current_user)):
    """
    Filter goals by completion status. Pass `is_complete=true` for completed goals, `false` for active.

    Requires `Authorization: Bearer <access_token>`.
    """
    return await goal_service.filter_by_completion(db, is_complete=is_complete, skip=skip, limit=limit, user=user)

@router.get("/{goal_id}", response_model=GoalOut)
async def get_goal(goal_id: int, db=Depends(get_db), user = Depends(get_current_user)):
    """
    Fetch a single goal by ID. Returns 404 if not found or not owned by the requester.

    Requires `Authorization: Bearer <access_token>`.
    """
    return await goal_service.get_goal(db, user, goal_id)

@router.put("/{goal_id}", response_model=GoalOut)
async def update_goal(goal_id: int, goal_data: GoalUpdate, db=Depends(get_db), user = Depends(get_current_user)):
    """
    Update one or more fields of an existing goal. All fields are optional.

    Requires `Authorization: Bearer <access_token>`. Returns 404 if not owned by requester.
    """
    return await goal_service.update_goal(db, goal_id, goal_data, user=user)

@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_goal(goal_id: int, db=Depends(get_db), user = Depends(get_current_user)):
    """
    Delete a goal and all its associated stats. Returns 404 if not owned by requester.

    Requires `Authorization: Bearer <access_token>`.
    """
    await goal_service.delete_goal(db, goal_id, user=user)

@router.patch("/{goal_id}/complete", response_model=GoalOut)
async def update_goal_completion(goal_id: int, is_complete: bool = True, db=Depends(get_db), user = Depends(get_current_user)):
    """
    Toggle a goal's completion status. Pass `is_complete=true` to complete, `false` to reopen.

    Requires `Authorization: Bearer <access_token>`.
    """
    return await goal_service.update_goal_completion(db, goal_id, is_complete, user=user)
