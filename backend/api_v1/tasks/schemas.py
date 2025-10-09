from annotated_types import MaxLen
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from typing import Annotated, TYPE_CHECKING, Optional

# if TYPE_CHECKING:
from api_v1.folders.schemas import FolderRead
from api_v1.users.schemas import UserRead


class TaskBase(BaseModel):  # Для скелета просто
    title: Annotated[str, MaxLen(25)]
    description: Annotated[str | None, MaxLen(150)]
    folder_id: int | None = None
    user_id: int


class TaskCreate(TaskBase):  # Для создания данных
    pass


class TaskRead(TaskBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    completed: bool | None = False
    created_at: datetime


class TaskUpdate(TaskBase):  # Для patch
    title: str | None = None
    description: str | None = None
    completed: bool | None = False
    folder_id: int | None = None
    user_id: int | None = None


class Task(TaskBase):  # Для возвращения данных
    model_config = ConfigDict(
        from_attributes=True
    )  # в ручках мы возращаем объекты SQLAlchemy, а не словари на вывод фронтенду.
    # Это конфигурация в которой мы указываем что нужно брать свойства с атрибутов объекта
    id: int
    completed: bool
    created_at: datetime

    folder: Optional[FolderRead]
    user: Optional[UserRead]  # | None = None
