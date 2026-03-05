import asyncio
import logging
from typing import Annotated
from app.db.dal import user
from app.core.security import (
    get_current_user as current_user,
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    create_one_time_token,
    verify_verification_token,
    verify_refresh_token,
)
from app.schemas.auth import (
    UserLoginRequest,
    TokenResponse,
    RefreshRequest,
    ChangePasswordRequest,
    VerifyRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
)
from app.db.models.user import User
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends, HTTPException, security, status
from app.schemas.user import UserCreate, UserOut
from app.db.session import get_db
from app.utils.stmp import send_verification_email, send_password_reset_email

logger = logging.getLogger(__name__)


async def _fire(coro):
    """Run a coroutine as a background task; log any errors instead of silently dropping them."""
    try:
        await coro
    except Exception as exc:
        logger.error("Background task failed: %s: %s", type(exc).__name__, exc)


oauth2_scheme = security.OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def login(db: AsyncSession, request: UserLoginRequest) -> TokenResponse:
    result = await user.get_by_email(db, email=request.email)
    if result is None or not verify_password(request.password, result.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    access_token = create_access_token({"sub": str(result.id)})
    refresh_token = create_refresh_token({"sub": str(result.id)})
    return TokenResponse(access_token=access_token, refresh_token=refresh_token, token_type="bearer")


async def register(db: AsyncSession, request: UserCreate) -> User:
    existing_user = await user.get_by_email(db, email=request.email)
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    password_hash = hash_password(request.password)
    new_user = User(email=request.email, password_hash=password_hash, full_name=request.full_name, image_url=request.image_url)
    created = await user.create(db, new_user)
    token = create_one_time_token(created.id, "email_verify", ttl_seconds=86400)
    asyncio.create_task(_fire(send_verification_email(created.email, token)))
    return created


async def verify_email(db: AsyncSession, request: VerifyRequest) -> dict:
    user_id = verify_verification_token(request.token, "email_verify")
    db_user = await user.get_by_id(db, int(user_id))
    if not db_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    await user.set_verified(db, db_user.id, True)
    return {"message": "Email verified successfully"}


async def forgot_password(db: AsyncSession, request: ForgotPasswordRequest) -> dict:
    db_user = await user.get_by_email(db, request.email)
    if db_user:
        token = create_one_time_token(db_user.id, "password_reset", ttl_seconds=3600)
        asyncio.create_task(_fire(send_password_reset_email(db_user.email, token)))
    # Always return the same response to prevent email enumeration
    return {"message": "If that email is registered, a reset link has been sent"}


async def reset_password(db: AsyncSession, request: ResetPasswordRequest) -> dict:
    user_id = verify_verification_token(request.token, "password_reset")
    db_user = await user.get_by_id(db, int(user_id))
    if not db_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    await user.update(db, db_user.id, {"password_hash": hash_password(request.new_password)})
    return {"message": "Password reset successfully"}


async def refresh(db: AsyncSession, request: RefreshRequest) -> TokenResponse:
    user_id = verify_refresh_token(request.refresh_token)
    db_user = await user.get_by_id(db, int(user_id))
    if not db_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    access_token = create_access_token({"sub": str(db_user.id)})
    new_refresh = create_refresh_token({"sub": str(db_user.id)})
    return TokenResponse(access_token=access_token, refresh_token=new_refresh, token_type="bearer")


async def change_password(db: AsyncSession, current: User, request: ChangePasswordRequest) -> dict:
    if not verify_password(request.current_password, current.password_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")
    await user.update(db, current.id, {"password_hash": hash_password(request.new_password)})
    return {"message": "Password changed successfully"}


async def get_optional_user(
    credentials: Annotated[security.HTTPAuthorizationCredentials | None, Depends(current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User | None:
    if credentials is None:
        return None
    try:
        return await current_user(credentials, db)
    except HTTPException:
        return None