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
from app.schemas.auth import (
    UserLoginRequest,
    TokenResponse,
    RefreshRequest,
    ChangePasswordRequest,
    VerifyRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
)
from app.services import auth_service
from app.api import get_db
from app.schemas.user import UserCreate, UserOut
from app.db.models.user import User
from app.core.security import get_current_user

router = APIRouter(tags=["auth"])

@router.post("/login", response_model=TokenResponse)
async def login(request: UserLoginRequest, db=Depends(get_db)):
    """
    Authenticate with email and password. Returns an access token and refresh token.

    - **401** — Invalid credentials
    """
    return await auth_service.login(db, request)


@router.get("/me", response_model=UserOut)
async def get_me(user: Annotated[User, Depends(get_current_user)]) -> UserOut:
    """
    Return the profile of the currently authenticated user.

    Requires `Authorization: Bearer <access_token>`.
    """
    return UserOut.model_validate(user)

@router.post("/register", response_model=UserOut)
async def register(user_data: UserCreate, db=Depends(get_db)):
    """
    Create a new user account. Sends a verification email automatically.

    - **400** — Email already registered
    """
    return await auth_service.register(db, user_data)


@router.post("/verify")
async def verify_email(request: VerifyRequest, db=Depends(get_db)):
    """Verify email address using the token sent after registration."""
    return await auth_service.verify_email(db, request)


@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, db=Depends(get_db)):
    """Request a password reset email. Always returns 200 to prevent email enumeration."""
    return await auth_service.forgot_password(db, request)


@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest, db=Depends(get_db)):
    """Reset password using the token from the reset email."""
    return await auth_service.reset_password(db, request)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(request: RefreshRequest, db=Depends(get_db)):
    """Rotate tokens: exchange a valid refresh token for a new access + refresh token pair."""
    return await auth_service.refresh(db, request)


@router.post("/change-password")
async def change_password(
    request: ChangePasswordRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db=Depends(get_db),
):
    """Change password for the currently authenticated user."""
    return await auth_service.change_password(db, current_user, request)

