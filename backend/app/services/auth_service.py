"""
Auth service (business logic).

TODO:
- register(): validate email uniqueness, hash password, create user
- login(): verify password, issue access+refresh tokens
- refresh(): validate refresh token, issue new access token (+ maybe rotate refresh)
- logout(): invalidate refresh token (only possible if stored server-side)
- me_get/me_update(): read/update current user
- verify(): mark user verified using verification token
- change_password(): verify identity then update password_hash

NOTES:
- Keep JWT/hashing helpers in core.security
- Use db.dal.* modules for DB operations
"""
from typing import Annotated
from app.db.dal import user
from app.core.security import get_current_user as current_user, hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from app.schemas.auth import UserLoginRequest, TokenResponse, RefreshRequest, ChangePasswordRequest, VerifyRequest, UserSignupRequest
from app.db.models.user import User
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends, Depends, HTTPException, security, security, status

from app.schemas.user import UserOut
from app.db.session import get_db

oauth2_scheme = security.OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

async def login(db: AsyncSession, request: UserLoginRequest) -> TokenResponse:
    result = await user.get_by_email(db, email=request.email)
    if result is None or not verify_password(request.password, result.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    access_token = create_access_token({"sub": str(result.id)})
    refresh_token = create_refresh_token({"sub": str(result.id)})
    return TokenResponse(access_token=access_token, refresh_token=refresh_token, token_type="bearer")

async def register(db: AsyncSession, request: UserSignupRequest) -> User:
    existing_user = await user.get_user_by_email(db, email=request.email)
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    password_hash = hash_password(request.password)
    new_user = await user.create_user(db, email=request.email, password_hash=password_hash, full_name=request.full_name, image_url=request.image_url)
    return new_user

async def get_current_user(db: AsyncSession, token: str) -> UserOut:
    cur_user = current_user(token)
    if not cur_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user_out = UserOut.from_orm(cur_user)
    return user_out

async def get_optional_user(
    credentials: Annotated[security.HTTPAuthorizationCredentials | None, Depends(current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User | None:
    if credentials is None:
        return None
    try:
        return await get_current_user(db, credentials.credentials)
    except HTTPException:
        return None