from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from api_v1.folders.schemas import FolderRead
from api_v1.users.schemas import UserRead


class TaskBase(BaseModel):
    model_config = ConfigDict(from_attributes=True, str_strip_whitespace=True)
    title: str = Field(min_length=1, max_length=25)
    description: str | None = Field(default=None, max_length=150)
    folder_id: int | None = Field(default=None, gt=0)
    user_id: int = Field(gt=0)


class TaskCreate(TaskBase):
    pass


class TaskRead(TaskBase):
    id: int
    completed: bool
    created_at: datetime


class TaskUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")
    title: str = Field(default=None, min_length=1, max_length=25)
    description: str | None = Field(default=None, max_length=150)
    completed: bool = None
    folder_id: int | None = Field(default=None, gt=0)
    user_id: int = Field(default=None, gt=0)


class Task(TaskRead):
    folder: FolderRead | None
    user: UserRead | None
