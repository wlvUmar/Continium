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
from typing_extensions import Annotated
from fastapi import APIRouter, Depends
from app.schemas.auth import UserLoginRequest, TokenResponse
from app.services import auth_service
from app.api import get_db
from app.schemas.user import UserOut
from app.db.models.user import User
from app.core.security import get_current_user

router = APIRouter(tags=["auth"])

@router.post("/login", response_model=TokenResponse)
async def login(request: UserLoginRequest, db=Depends(get_db)):
    return await auth_service.login(db, request)


@router.get("/me", response_model=UserOut)
async def get_me(user: Annotated[User, Depends(get_current_user)]) -> UserOut:
    return UserOut.model_validate(user)

