from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    api_v1_url: str = "/api/v1"
    db_url: str = Field(
        default="postgresql+asyncpg://todo_user:todo_password@postgres:5432/todo_db",
        validation_alias=AliasChoices("DB_URL", "DATABASE_URL"),
    )
    db_echo: bool = False


settings = Settings()
