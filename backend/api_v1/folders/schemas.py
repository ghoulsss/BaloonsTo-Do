from annotated_types import MaxLen
from pydantic import BaseModel, ConfigDict
from typing import Annotated, TYPE_CHECKING


# from api_v1.tasks.schemas import Task


class FolderBase(BaseModel):  # Для скелета просто
    title: Annotated[str, MaxLen(25)]
    user_id: int


class FolderCreate(FolderBase):  # Для создания данных
    pass


class FolderUpdate(FolderBase):  # Для создания данных
    pass


class FolderRead(FolderBase):  # Для возвращения данных
    id: int
    # count_tasks: int | None = None


class Folder(FolderBase):  # Для возвращения данных
    model_config = ConfigDict(
        from_attributes=True
    )  # в ручках мы возращаем объекты SQLAlchemy, а не словари на вывод фронтенду.
    # Это конфигурация в которой мы указываем что нужно брать свойства с атрибутов объекта
    # FastAPI с ConfigDict(from_attributes=True) умеет автоматически брать данные из ORM-модели и превращать их в Pydantic-схему.
    id: int

    # tasks: list[Task] | None = None
    count_tasks: int | None = None
