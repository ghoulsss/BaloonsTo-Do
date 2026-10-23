from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.engine import Result
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Union

from sqlalchemy.orm import selectinload

from api_v1.tasks.schemas import TaskCreate, TaskUpdate
from core.models import Task, Folder, User


async def create_task(session: AsyncSession, task_in: TaskCreate) -> Task:
    await validate_references(session, task_in.user_id, task_in.folder_id)
    task = Task(**task_in.model_dump())
    session.add(task)
    await session.commit()
    await session.refresh(task)
    return task


async def read_task(
    session: AsyncSession,
    limit: int = 1000,
    folder_id: int | None = None,
    user_id: int | None = None,
    completed: bool | None = None,
) -> list[Task]:
    stmt = (
        select(Task)
        .options(
            selectinload(Task.folder),
            selectinload(Task.user),
        )
        .limit(limit)
        .order_by(Task.created_at.desc())
    )

    if folder_id is not None:
        stmt = stmt.where(Task.folder_id == folder_id)

    if user_id is not None:
        stmt = stmt.where(Task.user_id == user_id)

    if completed is not None:
        stmt = stmt.where(Task.completed == completed)

    result: Result = await session.execute(stmt)
    tasks = result.scalars().all()
    return tasks


async def read_task_by_id(session: AsyncSession, task_id: int) -> Task | None:
    # return await session.get(Task, task_id)
    stmt = select(Task).options(selectinload(Task.folder), selectinload(Task.user)).where(Task.id == task_id)
    result: Result = await session.execute(stmt)
    tasks = result.scalars().first()
    return tasks


async def update_task(
    session: AsyncSession, task: Task, task_changes: TaskUpdate
) -> Task:
    changes = task_changes.model_dump(exclude_unset=True)
    await validate_references(session, changes.get("user_id", task.user_id), changes.get("folder_id", task.folder_id))
    for name, value in changes.items():
        setattr(task, name, value)
    await session.commit()
    return task


async def delete_task(session: AsyncSession, task: Task) -> None:
    await session.delete(task)
    await session.commit()


async def validate_references(session, user_id, folder_id):
    if await session.get(User, user_id) is None:
        raise HTTPException(404, "User not found")
    if folder_id is not None:
        folder = await session.get(Folder, folder_id)
        if folder is None:
            raise HTTPException(404, "Folder not found")
        if folder.user_id != user_id:
            raise HTTPException(422, "Folder belongs to another user")
