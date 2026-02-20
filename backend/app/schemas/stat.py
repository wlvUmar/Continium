"""
Stat schemas.

TODO:
- StatCreate: goal_id, timestamp (optional default=now), duration
- StatOut: id, goal_id, timestamp, duration
- OverallOut: totals per day/week/month, or total_duration, streaks (your choice)
"""

"""
Stat schemas.

TODO:
- StatCreate: goal_id, timestamp (optional default=now), duration
- StatOut: id, goal_id, timestamp, duration
- OverallOut: totals per day/week/month, or total_duration, streaks (your choice)
"""

from datetime import datetime
from enum import Enum
from typing import Dict, Optional

from pydantic import BaseModel, ConfigDict, Field


class StatCreate(BaseModel):
    occurred_at: Optional[datetime] = None  # если не пришло — выставишь now() в сервисе
    duration_minutes: int = Field(..., ge=0)


class StatOut(BaseModel):
    id: int
    goal_id: int
    user_id: int
    occurred_at: datetime
    duration_minutes: int

    model_config = ConfigDict(from_attributes=True)


class OverallOut(BaseModel):
    total_stats : Dict[str, int]