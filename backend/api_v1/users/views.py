from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import APIRouter, Depends, Query

from core.models import db_helper
from utils.auth import hash_password, verify_password
from . import crud
from .dependencies import user_by_id
from .schemas import UserCreate, User, UserUpdate, UserRead, UserLogin

router = APIRouter(tags=["Users"])


# @router.post("/", response_model=UserRead)
# async def create_user(
#     user: UserCreate,
#     session: AsyncSession = Depends(db_helper.session_dependency),
# ):
#     return await crud.create_user(session=session, user_in=user)


@router.post("/register")
async def register(
    user: UserCreate, session: AsyncSession = Depends(db_helper.session_dependency)
) -> UserRead:
    return await crud.create_user(session=session, user=user)


@router.get("/", response_model=list[User])
async def get_users(
    active: bool | None = None,
    limit: int | None = Query(default=None, ge=1, le=1000),
    session: AsyncSession = Depends(db_helper.session_dependency),
) -> list[User]:
    return await crud.read_user(
        session=session,
        limit=limit,
        active=active,
    )


@router.get("/{user_id}", response_model=User)
async def get_user_by_id(user: User = Depends(user_by_id)):
    return user


@router.patch("/{user_id}", response_model=UserRead)
async def update_user(
    user_changes: UserUpdate,
    user: User = Depends(user_by_id),
    session: AsyncSession = Depends(db_helper.session_dependency),
):
    return await crud.update_user(
        session=session,
        user=user,
        user_changes=user_changes,
    )


@router.delete("/{user_id}")
async def delete_user(
    user: User = Depends(user_by_id),
    session: AsyncSession = Depends(db_helper.session_dependency),
):
    return await crud.delete_user(
        session=session,
        user=user,
    )


@router.post("/login")
async def login(
    data: UserLogin,
    session: AsyncSession = Depends(db_helper.session_dependency),
):
    return await crud.login_user(
        session=session,
        username=data.username,
        password=data.password,
    )
