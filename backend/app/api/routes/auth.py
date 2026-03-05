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
    ## Login

    Authenticate with email and password.

    Returns a **JWT access token** and a **refresh token**.

    ### Request body
    | Field | Type | Description |
    |---|---|---|
    | `email` | string | Registered email address |
    | `password` | string | Account password |

    ### Responses
    - **200** — Login successful. Returns `access_token`, `refresh_token`, `token_type`.
    - **401** — Invalid credentials.
    - **422** — Validation error (malformed request body).
    """
    return await auth_service.login(db, request)


@router.get("/me", response_model=UserOut)
async def get_me(user: Annotated[User, Depends(get_current_user)]) -> UserOut:
    """
    ## Get Current User

    Returns the profile of the currently authenticated user.

    >  **Requires** `Authorization: Bearer <access_token>`

    ### Responses
    - **200** — Returns `UserOut` (id, full_name, email, image_url, is_active, verified).
    - **401** — Missing or invalid token.
    - **403** — Account is inactive.
    """
    return UserOut.model_validate(user)

@router.post("/register", response_model=UserOut)
async def register(user_data: UserCreate, db=Depends(get_db)):
    """
    ## Register

    Create a new user account. A verification email is sent automatically.

    ### Request body
    | Field | Type | Required | Description |
    |---|---|---|---|
    | `full_name` | string |  | Display name |
    | `email` | string |  | Must be unique |
    | `password` | string |  | Plain-text password (hashed server-side) |
    | `image_url` | string |  | Optional profile picture URL |

    ### Responses
    - **200** — Account created. Returns the new `UserOut` object.
    - **400** — Email already registered.
    - **422** — Validation error (malformed request body).
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

