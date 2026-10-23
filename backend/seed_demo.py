"""Add demo data without deleting or overwriting existing records.

Run: docker compose exec backend python seed_demo.py
"""
import asyncio
from datetime import datetime, timedelta, timezone

from sqlalchemy import select

from core.models import Folder, Task, User, db_helper
from utils.auth import hash_password

DEMO_USERNAME = "demo"
DEMO_EMAIL = "demo@example.com"
DEMO_PASSWORD = "demo"

# title, description, folder, completed
TASKS = [
    ("Составить план недели", "Выбрать три главные цели и распределить их по дням.", "Работа", False),
    ("Подготовить презентацию", "Собрать результаты проекта и подготовить пять слайдов.", "Работа", False),
    ("Проверить почту", "Ответить на важные письма и разобрать входящие.", "Работа", True),
    ("Обновить документацию", "Записать команды запуска и примеры работы с API.", "Работа", False),
    ("Купить продукты", "Молоко, яйца, хлеб, овощи и фрукты на неделю.", "Личное", False),
    ("Записаться к стоматологу", "Выбрать удобное время для планового осмотра.", "Личное", False),
    ("Полить растения", "Проверить влажность почвы и полить цветы.", "Личное", True),
    ("Разобрать рабочий стол", "Убрать лишние вещи и рассортировать документы.", "Личное", True),
    ("Прочитать главу книги", "Прочитать главу и записать основные идеи.", "Учёба", False),
    ("Повторить английский", "Выучить десять слов и составить с ними предложения.", "Учёба", False),
    ("Пройти урок Python", "Посмотреть урок про асинхронные функции и решить упражнения.", "Учёба", True),
    ("Разобраться с SQL", "Потренироваться писать JOIN и группировать результаты.", "Учёба", False),
    ("Прогуляться 30 минут", "Выйти на свежий воздух после работы.", None, False),
    ("Выбрать фильм на вечер", None, None, False),
    ("Сделать резервную копию", "Сохранить важные файлы на отдельный диск.", None, True),
]


async def seed():
    try:
        async with db_helper.session_factory() as session:
            async with session.begin():
                user = await session.scalar(select(User).where(User.username == DEMO_USERNAME))
                if user is None:
                    if await session.scalar(select(User).where(User.email == DEMO_EMAIL)):
                        raise RuntimeError("Demo email is already used by another account")
                    user = User(username=DEMO_USERNAME, email=DEMO_EMAIL,
                                password_hash=hash_password(DEMO_PASSWORD))
                    session.add(user)
                    await session.flush()
                elif user.email != DEMO_EMAIL:
                    raise RuntimeError("Username demo is already used by another account")

                folders = {}
                for title in ("Работа", "Личное", "Учёба"):
                    folder = await session.scalar(select(Folder).where(
                        Folder.user_id == user.id, Folder.title == title))
                    if folder is None:
                        folder = Folder(title=title, user_id=user.id)
                        session.add(folder)
                        await session.flush()
                    folders[title] = folder.id

                existing_titles = set((await session.scalars(
                    select(Task.title).where(Task.user_id == user.id))).all())
                added = 0
                now = datetime.now(timezone.utc).replace(tzinfo=None)
                for index, (title, description, folder, completed) in enumerate(TASKS):
                    if title in existing_titles:
                        continue
                    session.add(Task(
                        title=title, description=description, completed=completed,
                        folder_id=folders.get(folder), user_id=user.id,
                        created_at=now - timedelta(days=index % 7),
                    ))
                    added += 1
            print(f"Demo account: {DEMO_USERNAME}; added tasks: {added}")
    finally:
        await db_helper.engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed())
