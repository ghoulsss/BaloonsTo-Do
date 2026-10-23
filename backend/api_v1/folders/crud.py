from fastapi import HTTPException
from sqlalchemy import select, func
from sqlalchemy.engine import Result
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, joinedload

from api_v1.folders.schemas import FolderCreate, FolderUpdate
from core.models import Folder, Task, User


async def create_folder(session: AsyncSession, folder_in: FolderCreate) -> Folder:
    if await session.get(User, folder_in.user_id) is None:
        raise HTTPException(404, "User not found")
    folder = Folder(**folder_in.model_dump())
    session.add(folder)
    await session.commit()
    return folder


async def read_folders_with_count_tasks(
    session: AsyncSession, limit, user_id
) -> list[Folder]:
    stmt = (
        select(
            Folder.id,
            Folder.title,
            Folder.user_id,
            func.count(Task.id).label("count_tasks"),
        )
        .outerjoin(Task, Folder.id == Task.folder_id)
        .group_by(Folder.id)
        .limit(limit)
        .order_by(Folder.id)
    )

    if user_id is not None:
        stmt = stmt.where(Folder.user_id == user_id)

    result: Result = await session.execute(stmt)
    folders = result.all()
    return folders


# async def read_folder_with_count_tasks(
#     session: AsyncSession,
#     folder_id: int,
# ):
#     # return await session.get(Folder, folder_id)
#
#     return folders


# async def read_folder_count_tasks(session: AsyncSession, folder_id: int) -> int | None:
#     stmt = select(func.count()).select_from(Task).where(Task.folder_id == folder_id)
#     result = await session.execute(stmt)
#     count = result.scalar_one()
#     return count


async def update_folder(
    session: AsyncSession, folder: Folder, folder_changes: FolderUpdate
) -> Folder:
    for name, value in folder_changes.model_dump(exclude_unset=True).items():
        setattr(folder, name, value)
    await session.commit()
    return folder


async def delete_folder(session: AsyncSession, folder: Folder) -> None:
    await session.delete(folder)
    await session.commit()


async def get_folder_tasks(
    folder_id: int,
    session: AsyncSession,
):
    stmt = (
        select(Folder)
        .where(Folder.id == folder_id)
        .options(
            selectinload(Folder.tasks),
            selectinload(Folder.user),
        )
    )
    result: Result = await session.execute(stmt)
    folder = result.scalars().first()
    if folder is None:
        raise HTTPException(404, "Folder not found")
    return folder


async def read_folder_by_id(session: AsyncSession, folder_id: int):
    return await session.get(Folder, folder_id)


async def read_folder_with_count_tasks(session: AsyncSession, folder_id: int):
    folder = await read_folder_by_id(session, folder_id)
    if folder is None:
        raise HTTPException(404, "Folder not found")
    count = await session.scalar(select(func.count(Task.id)).where(Task.folder_id == folder_id))
    return {"id": folder.id, "title": folder.title, "user_id": folder.user_id, "count_tasks": count}
