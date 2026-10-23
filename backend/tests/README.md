# API regression tests

Run from `backend` in an environment with the application dependencies and `httpx` installed:

```sh
python -m unittest discover -s tests -v
```

Tests override `DB_URL` with in-memory SQLite and enable foreign key enforcement.
They cover users, login, password updates, duplicate accounts, task and folder CRUD,
filtering, validation, missing records, ownership consistency and cascade deletion.
They do not connect to the configured application database.

SQLite checks do not validate PostgreSQL-specific Alembic migrations.
