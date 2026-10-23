from datetime import datetime
from typing import Annotated
from pydantic import BaseModel, EmailStr, ConfigDict, Field, AfterValidator


def validate_password(value: str) -> str:
    if not value or len(value.encode("utf-8")) > 72:
        raise ValueError("Password must contain 1 to 72 UTF-8 bytes")
    return value


Password = Annotated[str, AfterValidator(validate_password)]
Username = Annotated[str, Field(min_length=3, max_length=15, pattern=r"^\S+$")]


class UserBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    username: Username
    email: EmailStr


class UserCreate(UserBase):
    password_hash: Password


class UserRead(UserBase):
    id: int
    active: bool
    created_at: datetime


class UserUpdate(BaseModel):
    username: Username = None
    email: EmailStr = None
    password_hash: Password = None
    active: bool = None


class User(UserRead):
    pass


class UserLogin(BaseModel):
    username: str
    password: Password
