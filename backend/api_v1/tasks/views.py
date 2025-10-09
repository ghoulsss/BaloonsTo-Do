from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from api_v1.tasks.schemas import Task, TaskCreate, TaskUpdate, TaskRead
from core.models import db_helper
from . import crud
from .dependencies import task_by_id

router = APIRouter(tags=["Tasks"])


@router.post("/", response_model=TaskRead)
async def create_task(
    task: TaskCreate,
    session: AsyncSession = Depends(db_helper.session_dependency),
):
    return await crud.create_task(session=session, task_in=task)


@router.get("/", response_model=list[Task])
async def get_tasks(
    folder_id: int | None = None,
    user_id: int | None = None,
    completed: bool | None = None,
    limit: int = None,
    session: AsyncSession = Depends(db_helper.session_dependency),
):
    return await crud.read_task(
        session=session,
        limit=limit,
        folder_id=folder_id,
        user_id=user_id,
        completed=completed,
    )


@router.get("/{task_id}", response_model=Task)
async def get_task_by_id(task: Task = Depends(task_by_id)):
    return task


@router.patch("/{task_id}")
async def update_task(
    task_changes: TaskUpdate,
    task: Task = Depends(task_by_id),
    session: AsyncSession = Depends(db_helper.session_dependency),
):
    return await crud.update_task(
        session=session,
        task=task,
        task_changes=task_changes,
    )


@router.delete("/{task_id}")
async def delete_task(
    task: Task = Depends(task_by_id),
    session: AsyncSession = Depends(db_helper.session_dependency),
):
    return await crud.delete_task(
        session=session,
        task=task,
    )
