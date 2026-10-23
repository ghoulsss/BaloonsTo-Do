# ToDo Baloons

Запустите Docker и выполните в директории проекта:

```bash
docker compose up --build -d
```

Откройте http://localhost:5173.

Чтобы добавить тестовый аккаунт и 15 задач:

```bash
docker compose exec backend python seed_demo.py
```

Логин: `demo`. Пароль: `demo`.

Остановить проект:

```bash
docker compose down
```
