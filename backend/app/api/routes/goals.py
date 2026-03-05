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
    ## Create Goal

    Create a new goal for the authenticated user.

    >  **Requires** `Authorization: Bearer <access_token>`

    ### Request body
    | Field | Type | Required | Description |
    |---|---|---|---|
    | `title` | string |  | Goal name (max 200 chars) |
    | `type` | string |  | e.g. `"One Time"` or `"Repeating"` |
    | `start_date` | date |  | ISO 8601 date — `YYYY-MM-DD` |
    | `deadline` | date |  | ISO 8601 date — `YYYY-MM-DD` |
    | `frequency` | string |  | One of `daily`, `weekly`, `monthly` |
    | `duration_min` | integer |  | Daily target duration in **minutes** (≥ 0) |

    ### Responses
    - **200** — Goal created. Returns the new `GoalOut` object.
    - **401** — Not authenticated.
    - **422** — Validation error.
    """
    return await goal_service.create_goal(db, goal_data, user=user)


@router.get("/", response_model=list[GoalOut])
async def list_goals(skip: int = 0, limit: int = 100, db=Depends(get_db), user = Depends(get_current_user)):
    """
    ## List Goals

    Return all goals belonging to the authenticated user.

    >  **Requires** `Authorization: Bearer <access_token>`

    ### Query parameters
    | Parameter | Type | Default | Description |
    |---|---|---|---|
    | `skip` | integer | `0` | Number of records to skip (pagination offset) |
    | `limit` | integer | `100` | Maximum number of records to return |

    ### Responses
    - **200** — Array of `GoalOut` objects (may be empty).
    - **401** — Not authenticated.
    """
    return await goal_service.get_goals(db, skip=skip, limit=limit, user=user)

@router.get("/search")
async def get_by_name(name: str, db=Depends(get_db), user=Depends(get_current_user), skip: int = 0, take: int = 100):
    """
    ## Search Goals by Name

    Full-text search (case-insensitive) across the authenticated user's goal titles.

    >  **Requires** `Authorization: Bearer <access_token>`

    ### Query parameters
    | Parameter | Type | Required | Description |
    |---|---|---|---|
    | `name` | string |  | Substring to search for in goal titles |
    | `skip` | integer | `0` | Pagination offset |
    | `take` | integer | `100` | Maximum number of results |

    ### Responses
    - **200** — Array of matching `GoalOut` objects (may be empty).
    - **401** — Not authenticated.
    """
    return await goal_service.get_by_name(name, db, user, skip=skip, take=take)

@router.get("/by-date/{target_date}", response_model=list[GoalOut])
async def get_goals_by_date(target_date: date = date.today(), db=Depends(get_db), user = Depends(get_current_user)):
    """
    ## Get Goals Active on a Date

    Return all goals whose `start_date ≤ target_date ≤ deadline`.

    >  **Requires** `Authorization: Bearer <access_token>`

    ### Path parameters
    | Parameter | Type | Description |
    |---|---|---|
    | `target_date` | date | ISO 8601 date — `YYYY-MM-DD` |

    ### Responses
    - **200** — Array of `GoalOut` objects active on that date (may be empty).
    - **401** — Not authenticated.
    - **422** — Invalid date format.
    """
    return await goal_service.get_goal_by_date(db, target_date=target_date, user=user)

@router.get("/filter-by-completion", response_model=list[GoalOut])
async def get_goals_by_completion(skip: int = 0, limit: int = 100, is_complete: bool = False, db=Depends(get_db), user = Depends(get_current_user)):
    """
    ## Filter Goals by Completion Status

    Return the authenticated user's goals filtered by `is_complete`.

    >  **Requires** `Authorization: Bearer <access_token>`

    ### Query parameters
    | Parameter | Type | Default | Description |
    |---|---|---|---|
    | `is_complete` | boolean | `false` | `true` for completed goals, `false` for active |
    | `skip` | integer | `0` | Pagination offset |
    | `limit` | integer | `100` | Maximum number of results |

    ### Responses
    - **200** — Array of `GoalOut` objects matching the filter (may be empty).
    - **401** — Not authenticated.
    """
    return await goal_service.filter_by_completion(db, is_complete=is_complete, skip=skip, limit=limit, user=user)

@router.get("/{goal_id}", response_model=GoalOut)
async def get_goal(goal_id: int, db=Depends(get_db), user = Depends(get_current_user)):
    """
    ## Get Goal

    Fetch a single goal by ID. Only returns the goal if it belongs to the authenticated user.

    >  **Requires** `Authorization: Bearer <access_token>`

    ### Path parameters
    | Parameter | Type | Description |
    |---|---|---|
    | `goal_id` | integer | ID of the goal to retrieve |

    ### Responses
    - **200** — Returns the `GoalOut` object.
    - **401** — Not authenticated.
    - **404** — Goal not found or does not belong to you.
    """
    return await goal_service.get_goal(db, user, goal_id)

@router.put("/{goal_id}", response_model=GoalOut)
async def update_goal(goal_id: int, goal_data: GoalUpdate, db=Depends(get_db), user = Depends(get_current_user)):
    """
    ## Update Goal

    Update one or more fields of an existing goal. Only the owner can update their goal.

    >  **Requires** `Authorization: Bearer <access_token>`

    ### Path parameters
    | Parameter | Type | Description |
    |---|---|---|
    | `goal_id` | integer | ID of the goal to update |

    ### Request body
    All fields are **optional** — only provided fields are updated.

    | Field | Type | Description |
    |---|---|---|
    | `title` | string | New goal title |
    | `type` | string | Goal type |
    | `start_date` | date | New start date (`YYYY-MM-DD`) |
    | `deadline` | date | New deadline (`YYYY-MM-DD`) |
    | `frequency` | string | `daily`, `weekly`, or `monthly` |
    | `duration_min` | integer | Daily target in minutes |
    | `is_complete` | boolean | Mark goal as complete/incomplete |

    ### Responses
    - **200** — Returns updated `GoalOut`.
    - **401** — Not authenticated.
    - **404** — Goal not found or does not belong to you.
    - **422** — Validation error.
    """
    return await goal_service.update_goal(db, goal_id, goal_data, user=user)

@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_goal(goal_id: int, db=Depends(get_db), user = Depends(get_current_user)):
    """
    ## Delete Goal

    Permanently delete a goal and all its associated stats. Only the owner can delete their goal.

    >  **Requires** `Authorization: Bearer <access_token>`

    ### Path parameters
    | Parameter | Type | Description |
    |---|---|---|
    | `goal_id` | integer | ID of the goal to delete |

    ### Responses
    - **204** — Goal deleted successfully (no content).
    - **401** — Not authenticated.
    - **404** — Goal not found or does not belong to you.
    """
    await goal_service.delete_goal(db, goal_id, user=user)

@router.patch("/{goal_id}/complete", response_model=GoalOut)
async def update_goal_completion(goal_id: int, is_complete: bool = True, db=Depends(get_db), user = Depends(get_current_user)):
    """
    ## Mark Goal Complete / Incomplete

    Shortcut endpoint to toggle a goal's completion status without sending a full update body.

    >  **Requires** `Authorization: Bearer <access_token>`

    ### Path parameters
    | Parameter | Type | Description |
    |---|---|---|
    | `goal_id` | integer | ID of the goal |

    ### Query parameters
    | Parameter | Type | Default | Description |
    |---|---|---|---|
    | `is_complete` | boolean | `true` | `true` to mark complete, `false` to reopen |

    ### Responses
    - **200** — Returns updated `GoalOut`.
    - **401** — Not authenticated.
    - **404** — Goal not found or does not belong to you.
    """
    return await goal_service.update_goal_completion(db, goal_id, is_complete, user=user)
