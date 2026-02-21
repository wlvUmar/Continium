"""
Auth schemas.

TODO:
- LoginRequest: email, password
- TokenResponse: access_token, refresh_token, token_type="bearer"
- RefreshRequest: refresh_token
- ChangePasswordRequest: email (or better: current_password + new_password)
- VerifyRequest: token, type (email_verify/reset)
"""
from pydantic import BaseModel
from typing import Optional

class UserLoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class RefreshRequest(BaseModel):
    refresh_token: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class VerifyRequest(BaseModel):
    token: str
    type: str  # "email_verify" or "reset"


class UserSignupRequest(BaseModel):
    email: str
    password: str
    full_name: str
    image_url: Optional[str] = None
