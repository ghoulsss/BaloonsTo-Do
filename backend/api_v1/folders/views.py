from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from api_v1.folders.schemas import Folder, FolderCreate, FolderUpdate, FolderRead
from core.models import db_helper
from . import crud
from .dependencies import folder_by_id

router = APIRouter(tags=["Folders"])


@router.post("/", response_model=FolderRead)
async def create_folder(
    folder: FolderCreate,
    session: AsyncSession = Depends(db_helper.session_dependency),
):
    return await crud.create_folder(session=session, folder_in=folder)


@router.get("/", response_model=list[Folder])
async def get_folders(
    user_id: int | None = None,
    limit=10,
    session: AsyncSession = Depends(db_helper.session_dependency),
):
    return await crud.read_folders_with_count_tasks(
        session=session, limit=limit, user_id=user_id
    )


@router.get(
    "/{folder_id}",
)
async def get_folder_by_id(
    folder_id: int,
    session: AsyncSession = Depends(db_helper.session_dependency),
):
    return await crud.read_folder_with_count_tasks(session=session, folder_id=folder_id)


@router.patch("/{folder_id}")
async def change_folder(
    folder_changes: FolderUpdate,
    folder: Folder = Depends(folder_by_id),
    session: AsyncSession = Depends(db_helper.session_dependency),
):
    return await crud.update_folder(
        session=session,
        folder=folder,
        folder_changes=folder_changes,
    )


@router.delete("/{folder_id}")
async def delete_folder(
    folder: Folder = Depends(get_folder_by_id),
    session: AsyncSession = Depends(db_helper.session_dependency),
):
    return await crud.delete_folder(
        session=session,
        folder=folder,
    )


@router.get("/{folder_id}/tasks")
async def get_folder_tasks_extended(
    folder_id: int, session: AsyncSession = Depends(db_helper.session_dependency)
):
    return await crud.get_folder_tasks(session=session, folder_id=folder_id)
