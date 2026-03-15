"""
User DAL module (DB access only).

TODO:
- get_by_id(db, user_id)
- get_by_email(db, email)
- create(db, user_data)  # expects already-hashed password
- update(db, user_id, fields)
- set_verified(db, user_id, verified=True)
- store_refresh_token/db strategy (optional)
"""
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update as sa_update
from app.db.models.user import User

async def get_by_id(db: AsyncSession, user_id: int) -> Optional[User]:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalars().first()

async def get_by_email(db: AsyncSession, email: str) -> Optional[User]:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalars().first()

async def create(db: AsyncSession,new_user: User) -> User:
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

async def update(db: AsyncSession, user_id: int, fields: dict) -> Optional[User]:
    await db.execute(sa_update(User).where(User.id == user_id).values(**fields))
    await db.commit()
    return await get_by_id(db, user_id)


async def set_verified(db: AsyncSession, user_id: int, verified: bool = True) -> Optional[User]:
    return await update(db, user_id, {"verified": verified})

