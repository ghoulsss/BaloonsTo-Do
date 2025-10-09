from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.engine import Result
from sqlalchemy.ext.asyncio import AsyncSession

from sqlalchemy.exc import IntegrityError

from sqlalchemy.orm import selectinload

from api_v1.users.schemas import UserCreate, UserUpdate
from core.models import User
from utils.auth import verify_password, hash_password


async def create_user(session: AsyncSession, user: UserCreate) -> User:
    result = await session.execute(
        select(User).where(
            (User.email == user.email) | (User.username == user.username)
        )
    )
    existing_user = result.scalar_one_or_none()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"User of username {user.username} or email {user.email} already exists",
        )

    hashed_pw = hash_password(user.password_hash)
    user_data = user.model_dump(exclude={"password_hash"})
    db_user = User(**user_data, password_hash=hashed_pw)

    session.add(db_user)
    try:
        await session.commit()
        await session.refresh(db_user)
    except IntegrityError:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User with this email or username already exists (race condition)",
        )
    return db_user


async def read_user(
    session: AsyncSession,
    limit: int = 1000,
    active: bool | None = None,
) -> list[User] | None:
    stmt = (
        select(User)
        .options(
            selectinload(User.tasks),
            selectinload(User.folders),
        )
        .limit(limit)
        .order_by(User.id)
    )

    if active is not None:
        stmt = stmt.where(User.active == active)

    result: Result = await session.execute(stmt)
    users = result.scalars().all()
    return users


async def read_user_by_id(session: AsyncSession, user_id: int) -> User | None:
    # return await session.get(User, user_id)
    stmt = (
        select(User)
        .options(
            selectinload(User.tasks),
            selectinload(User.folders),
        )
        .where(User.id == user_id)
    )
    result: Result = await session.execute(stmt)
    users = result.scalars().first()
    return users


async def update_user(
    session: AsyncSession, user: User, user_changes: UserUpdate
) -> User:
    for name, value in user_changes.model_dump(exclude_unset=True).items():
        setattr(user, name, value)
    await session.commit()
    return user


async def delete_user(session: AsyncSession, user: User) -> None:
    await session.delete(user)
    await session.commit()


async def get_user_by_username(session: AsyncSession, username: str) -> User | None:
    stmt = select(User).where(User.username == username)
    result = await session.execute(stmt)
    return result.scalar_one_or_none()


async def login_user(session: AsyncSession, username: str, password: str) -> dict:
    user = await get_user_by_username(session, username)
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )
    return {
        "success": True,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
        },
    }
