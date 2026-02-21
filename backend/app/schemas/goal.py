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

from pydantic import BaseModel, ConfigDict, Field


class GoalFrequency(str, Enum):
    daily = "daily"
    weekly = "weekly"
    monthly = "monthly"


class GoalCreate(BaseModel):
    title: str = Field(..., max_length=200)
    type: str = Field(..., max_length=50)
    start_date: date
    deadline: date
    frequency: GoalFrequency
    duration_min: int = Field(..., ge=0) 


class GoalUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    type: Optional[str] = Field(None, max_length=50)
    start_date: Optional[date] = None
    deadline: Optional[date] = None
    frequency: Optional[GoalFrequency] = None
    duration_min: Optional[int] = Field(None, ge=0)
    is_complete: Optional[bool] = None



class GoalOut(BaseModel):
    id: int
    user_id: int
    title: str
    type: str
    start_date: date
    deadline: date
    frequency: GoalFrequency
    duration_min: int
    is_complete: bool

    model_config = ConfigDict(from_attributes=True)
