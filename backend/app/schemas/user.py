"""
User Pydantic schemas (DTOs).

TODO:
- UserCreate: full_name, email, password
- UserOut: id, full_name, email, image_url, is_active, verified
- UserUpdate: full_name?, image_url?, is_active? (careful)
- NEVER expose password_hash
"""

from pydantic import ConfigDict, EmailStr, HttpUrl
from pydantic import BaseModel
from typing import Optional

class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    image_url: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: int
    is_active: bool
    verified: bool

    model_config = ConfigDict(from_attributes=True)

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    image_url: Optional[str] = None