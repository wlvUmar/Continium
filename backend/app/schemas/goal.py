"""
Goal schemas.

TODO:
- GoalCreate: title, type, start_date, deadline, frequency, duration
- GoalUpdate: same fields optional + is_complete
- GoalOut: include id, user_id, is_complete, etc.
"""

from datetime import date
from enum import Enum
from typing import Optional

from pydantic import BaseModel, ConfigDict


class FrequencyEnum(str, Enum):
    daily = "daily"
    weekly = "weekly"
    monthly = "monthly"

class GoalCreate(BaseModel):
    title: str
    type: str
    start_date: date
    deadline: date
    frequency: FrequencyEnum  # e.g., "daily", "weekly", "monthly"
    duration: Optional[int] = None  # e.g., number of days/weeks/months


class GoalUpdate(BaseModel):
    title: Optional[str] = None
    type: Optional[str] = None
    start_date: Optional[date] = None
    deadline: Optional[date] = None
    frequency: Optional[FrequencyEnum] = None
    duration: Optional[int] = None
    is_complete: Optional[bool] = None


class GoalOut(BaseModel):
    id: int
    user_id: int
    title: str
    type: str
    start_date: date
    deadline: date
    frequency: FrequencyEnum = FrequencyEnum.daily
    duration: Optional[int] = None
    is_complete: bool
    model_config = ConfigDict(from_attributes=True)