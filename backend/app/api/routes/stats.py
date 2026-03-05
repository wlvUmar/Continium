"""
Stats endpoints (HTTP layer only).

TODO endpoints:
- POST /stats
- GET  /stats/{goal_id}?type=
- GET  /stats/overall

RULE:
- Use get_current_user dependency
- Call stat_service methods
"""

from app.api import get_db
from fastapi import APIRouter, Depends, HTTPException, status
from app.services import stat_service
from app.schemas.stat import StatCreate, StatOut, OverallOut
from app.db.models.user import User
from app.core.security import get_current_user
from typing_extensions import Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date





router = APIRouter(prefix="/stats", tags=["stats"])



@router.post("/goal/{goal_id}", response_model=StatOut)
async def add_stat(goal_id: int, stat_data: StatCreate, db=Depends(get_db), user = Depends(get_current_user)):
    """
    ## Log a Session

    Record a tracked work session for a specific goal.

    If a stat entry already exists for the same goal on the same **calendar day**, the
    `duration_minutes` is **added** to the existing record rather than creating a duplicate.

    >  **Requires** `Authorization: Bearer <access_token>`

    ### Path parameters
    | Parameter | Type | Description |
    |---|---|---|
    | `goal_id` | integer | ID of the goal this session belongs to |

    ### Request body
    | Field | Type | Required | Description |
    |---|---|---|---|
    | `duration_minutes` | integer |  | Session length in minutes (≥ 0) |
    | `occurred_at` | datetime |  | ISO 8601 datetime. Defaults to **now** if omitted |

    ### Responses
    - **200** — Returns the created or updated `StatOut`.
    - **401** — Not authenticated.
    - **422** — Validation error.
    """
    return await stat_service.add_stat(db, goal_id, stat_data, user=user)


@router.get("/goal/{goal_id}", response_model=list[StatOut])
async def get_goal_stats(goal_id: int, db=Depends(get_db), user = Depends(get_current_user)):
    """
    ## Get Stats for a Goal

    Return all session records logged for a specific goal by the authenticated user.

    >  **Requires** `Authorization: Bearer <access_token>`

    ### Path parameters
    | Parameter | Type | Description |
    |---|---|---|
    | `goal_id` | integer | ID of the goal |

    ### Responses
    - **200** — Array of `StatOut` objects (may be empty).
    - **401** — Not authenticated.
    """
    return await stat_service.get_goal_stats(db, goal_id=goal_id,  user=user)

@router.get("/overall", response_model=OverallOut)
async def get_overall_stats(db=Depends(get_db), user = Depends(get_current_user)):
    """
    ## Overall Statistics

    Aggregate total tracked minutes across **all goals** for the authenticated user.

    >  **Requires** `Authorization: Bearer <access_token>`

    ### Response shape
    ```json
    {
      "total_stats": {
        "Learn Spanish": 120,
        "Read Books": 45
      }
    }
    ```
    Values are in **minutes**. Keys are goal titles.

    ### Responses
    - **200** — Returns `OverallOut`.
    - **401** — Not authenticated.
    """
    return await stat_service.overall(db, user=user)

@router.get("/overall-by-type")
async def get_overall_stats_by_type(type: stat_service.Type=stat_service.Type.one_time, db=Depends(get_db), user = Depends(get_current_user)):
    """
    ## Overall Statistics by Goal Type

    Aggregate total tracked minutes grouped by goal title, filtered by goal **type**.

    >  **Requires** `Authorization: Bearer <access_token>`

    ### Query parameters
    | Parameter | Type | Default | Description |
    |---|---|---|---|
    | `type` | string | `One Time` | Goal type filter. One of `One Time`, `Repeating` |

    ### Response shape
    ```json
    {
      "total_stats": {
        "Learn Spanish": 300
      }
    }
    ```
    Values are in **minutes**.

    ### Responses
    - **200** — Returns aggregated stats object.
    - **401** — Not authenticated.
    - **422** — Invalid `type` value.
    """
    return await stat_service.get_overall_stats_by_type(db, type=type, user=user)

@router.get("/{goal_id}/by-date-range", response_model=list[StatOut])
async def get_stats_by_date_range(goal_id: int, start_date: str, end_date: str, db=Depends(get_db), user = Depends(get_current_user)):
    """
    ## Get Stats by Date Range

    Return session records for a goal within a given date range (inclusive on both ends).

    >  **Requires** `Authorization: Bearer <access_token>`

    ### Path parameters
    | Parameter | Type | Description |
    |---|---|---|
    | `goal_id` | integer | ID of the goal |

    ### Query parameters
    | Parameter | Type | Description |
    |---|---|---|
    | `start_date` | string | Start of range — ISO 8601 (`YYYY-MM-DD` or datetime) |
    | `end_date` | string | End of range — ISO 8601 (`YYYY-MM-DD` or datetime) |

    ### Responses
    - **200** — Array of `StatOut` objects within the range, ordered by `occurred_at`.
    - **401** — Not authenticated.
    - **422** — Invalid date format.
    """
    return await stat_service.get_stats_by_date_range(db, goal_id, start_date, end_date, user=user)


