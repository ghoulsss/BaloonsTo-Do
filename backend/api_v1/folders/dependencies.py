from typing import Annotated
from fastapi import Depends, Path, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.models import db_helper, Folder
from . import crud


async def folder_by_id(
    folder_id: Annotated[int, Path],
    session: AsyncSession = Depends(db_helper.session_dependency),
) -> Folder:
    folder = await crud.read_folder_by_id(session=session, folder_id=folder_id)
    if folder is not None:
        return folder
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND, detail=f"Folder:{folder_id} not found"
    )
