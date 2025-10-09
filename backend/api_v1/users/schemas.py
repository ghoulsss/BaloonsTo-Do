from datetime import datetime
from typing import Annotated, List, TYPE_CHECKING

from annotated_types import MinLen, MaxLen
from pydantic import BaseModel, EmailStr, ConfigDict

# if TYPE_CHECKING:
# from api_v1.folders.schemas import FolderRead
# from api_v1.tasks.schemas import TaskRead


# from api_v1.tasks.schemas import Task


class UserBase(BaseModel):
    username: Annotated[str, MinLen(3), MaxLen(15)]
    email: EmailStr


class UserCreate(UserBase):  # Для создания данных
    password_hash: str


class UserRead(UserBase):  # Для возвращения данных
    id: int
    active: bool | None = True
    created_at: datetime


class UserUpdate(UserBase):  # Для создания данных
    username: str | None = None
    email: EmailStr | None = None
    password_hash: str | None = None
    active: bool | None = None


class User(UserBase):  # Для возвращения данных
    model_config = ConfigDict(
        from_attributes=True
    )  # в ручках мы возращаем объекты SQLAlchemy, а не словари на вывод фронтенду.
    # Это конфигурация в которой мы указываем что нужно брать свойства с атрибутов объекта
    # FastAPI с ConfigDict(from_attributes=True) умеет автоматически брать данные из ORM-модели и превращать их в Pydantic-схему.
    id: int
    active: bool | None = True
    created_at: datetime


class UserLogin(BaseModel):
    username: str
    password: str
