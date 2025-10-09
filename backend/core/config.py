from pathlib import Path
from typing import ClassVar

from pydantic_settings import BaseSettings


BASE_DIR = Path(__file__).parent.parent


class Settings(BaseSettings):
    api_v1_url: str = "/api/v1"
    # db_url: str = f"sqlite+aiosqlite:///{BASE_DIR}/todo.sqlite3"
    db_url: ClassVar[str] = (
        "postgresql+asyncpg://todo_user:todo_password@postgres:5432/todo_db"

    )

    db_echo: bool = False
    # db_echo: bool = True


settings = Settings()
