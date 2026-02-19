"""
Stat schemas.

TODO:
- StatCreate: goal_id, timestamp (optional default=now), duration
- StatOut: id, goal_id, timestamp, duration
- OverallOut: totals per day/week/month, or total_duration, streaks (your choice)
"""

import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class StatCreate(BaseModel):
    goal_id: int
    timestamp: Optional[datetime.datetime] = None  # default to now in service layer
    duration: int  # e.g., minutes spent on the goal
    
class StatOut(BaseModel):
    id: int
    goal_id: int
    timestamp: datetime.datetime
    duration: int
    model_config = ConfigDict(from_attributes=True)

class OverallOut(BaseModel):
    total_stats: int  