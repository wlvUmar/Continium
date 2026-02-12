"""
Auth endpoints (HTTP layer only).

TODO endpoints:
- POST /auth/register
- POST /auth/login
- POST /auth/refresh
- POST /auth/logout
- GET  /auth/me
- PUT  /auth/me
- GET  /auth/verify
- POST /auth/change-password

RULE:
- Parse request -> call auth_service -> return schema/HTTP codes
- Do not write SQL here.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.auth import UserLoginRequest, TokenResponse, RefreshRequest, ChangePasswordRequest, VerifyRequest, UserSignupRequest
from app.services import auth_service
from app.api import get_db

router = APIRouter(tags=["auth"])

@router.post("/login", response_model=TokenResponse)
async def login(request: UserLoginRequest, db=Depends(get_db)):
    return await auth_service.login(db, request)
