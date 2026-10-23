from pydantic import BaseModel, ConfigDict, Field


class FolderBase(BaseModel):
    model_config = ConfigDict(from_attributes=True, str_strip_whitespace=True)
    title: str = Field(min_length=1, max_length=25)
    user_id: int = Field(gt=0)


class FolderCreate(FolderBase):
    pass


class FolderUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")
    title: str = Field(default=None, min_length=1, max_length=25)


class FolderRead(FolderBase):
    id: int


class Folder(FolderRead):
    count_tasks: int = 0
