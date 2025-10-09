from sqlalchemy import select
from sqlalchemy.engine import Result
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Union

from sqlalchemy.orm import selectinload

from api_v1.tasks.schemas import TaskCreate, TaskUpdate
from core.models import Task


async def create_task(session: AsyncSession, task_in: TaskCreate) -> Task:
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
    stmt = select(Task).options(selectinload(Task.folder)).where(Task.id == task_id)
    result: Result = await session.execute(stmt)
    tasks = result.scalars().first()
    return tasks


async def update_task(
    session: AsyncSession, task: Task, task_changes: TaskUpdate
) -> Task:
    for name, value in task_changes.model_dump(exclude_unset=True).items():
        setattr(task, name, value)
    await session.commit()
    return task


async def delete_task(session: AsyncSession, task: Task) -> None:
    await session.delete(task)
    await session.commit()
