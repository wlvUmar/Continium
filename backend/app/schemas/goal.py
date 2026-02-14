"""
Goal schemas.

TODO:
- GoalCreate: title, type, start_date, deadline, frequency, duration
- GoalUpdate: same fields optional + is_complete
- GoalOut: include id, user_id, is_complete, etc.
"""

from datetime import date
from typing import Optional

from pydantic import BaseModel


class GoalCreate(BaseModel):
    title: str
    type: str
    start_date: date
    deadline: date
    frequency: str  # e.g., "daily", "weekly", "monthly"
    duration: Optional[int] = None  # e.g., number of days/weeks/months

class GoalUpdate(BaseModel):
    title: Optional[str] = None
    type: Optional[str] = None
    start_date: Optional[date] = None
    deadline: Optional[date] = None
    frequency: Optional[str] = None
    duration: Optional[int] = None
    is_complete: Optional[bool] = None

class GoalOut(BaseModel):
    id: int
    user_id: int
    title: str
    type: str
    start_date: date
    deadline: date
    frequency: str
    duration: Optional[int] = None
    is_complete: bool

    class Config:
        orm_mode = True