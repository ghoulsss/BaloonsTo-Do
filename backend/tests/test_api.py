"""API regression checks using an isolated SQLite database, never production data."""
import os
os.environ['DB_URL'] = 'sqlite+aiosqlite:///:memory:'

import unittest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import event
from core.models import Base, db_helper
from main import app


@event.listens_for(db_helper.engine.sync_engine, 'connect')
def foreign_keys(connection, _):
    connection.execute('PRAGMA foreign_keys=ON')


class ApiTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        async with db_helper.engine.begin() as connection:
            await connection.run_sync(Base.metadata.create_all)
        self.client = AsyncClient(transport=ASGITransport(app=app), base_url='http://test/api/v1/')
        self.user = await self.request('POST', 'users/register', json={
            'username': 'alice', 'email': 'alice@example.com', 'password_hash': 'secret'})

    async def asyncTearDown(self):
        await self.client.aclose()
        async with db_helper.engine.begin() as connection:
            await connection.run_sync(Base.metadata.drop_all)
        await db_helper.engine.dispose()

    async def request(self, method, path, status=200, **kwargs):
        response = await self.client.request(method, path, **kwargs)
        self.assertEqual(response.status_code, status, response.text)
        data = response.json()
        self.assertNotIn('password_hash', response.text)
        return data

    async def folder(self):
        return await self.request('POST', 'folders/', json={'title': 'Home', 'user_id': self.user['id']})

    async def task(self, folder_id=None):
        return await self.request('POST', 'tasks/', json={
            'title': 'Test', 'user_id': self.user['id'], 'folder_id': folder_id})

    async def test_users_and_password_change(self):
        uid = self.user['id']
        self.assertEqual(len(await self.request('GET', 'users/')), 1)
        await self.request('GET', f'users/{uid}')
        await self.request('POST', 'users/login', json={'username': 'alice', 'password': 'secret'})
        await self.request('POST', 'users/login', 401, json={'username': 'alice', 'password': 'wrong'})
        await self.request('PATCH', f'users/{uid}', json={'password_hash': 'new-secret'})
        await self.request('POST', 'users/login', 401, json={'username': 'alice', 'password': 'secret'})
        await self.request('POST', 'users/login', json={'username': 'alice', 'password': 'new-secret'})
        await self.request('PATCH', f'users/{uid}', json={'active': False})
        self.assertEqual(await self.request('GET', 'users/?active=true'), [])
        await self.request('POST', 'users/login', 401, json={'username': 'alice', 'password': 'new-secret'})

    async def test_duplicate_user_and_conflicting_update(self):
        bob = await self.request('POST', 'users/register', json={
            'username': 'bobby', 'email': 'bob@example.com', 'password_hash': 'secret'})
        await self.request('POST', 'users/register', 409, json={
            'username': 'alice', 'email': 'bob@example.com', 'password_hash': 'secret'})
        await self.request('PATCH', f"users/{bob['id']}", 409, json={'username': 'alice'})

    async def test_folder_crud_and_cascade(self):
        folder = await self.folder()
        fid = folder['id']
        task = await self.task(fid)
        await self.request('PATCH', f'folders/{fid}', json={'title': 'Renamed'})
        detail = await self.request('GET', f'folders/{fid}')
        self.assertEqual((detail['title'], detail['count_tasks']), ('Renamed', 1))
        self.assertEqual(len(await self.request('GET', f"folders/?user_id={self.user['id']}&limit=1")), 1)
        extended = await self.request('GET', f'folders/{fid}/tasks')
        self.assertEqual(extended['tasks'][0]['id'], task['id'])
        await self.request('DELETE', f'folders/{fid}')
        await self.request('GET', f"tasks/{task['id']}", 404)

    async def test_task_crud_filters_and_partial_updates(self):
        folder = await self.folder()
        task = await self.task(folder['id'])
        tid = task['id']
        detail = await self.request('GET', f'tasks/{tid}')
        self.assertEqual(detail['user']['username'], 'alice')
        self.assertEqual(detail['folder']['title'], 'Home')
        await self.request('PATCH', f'tasks/{tid}', json={'completed': True})
        updated = await self.request('PATCH', f'tasks/{tid}', json={'title': 'Changed', 'folder_id': None})
        self.assertTrue(updated['completed'])
        self.assertIsNone(updated['folder_id'])
        self.assertEqual(await self.request('GET', 'tasks/?completed=false'), [])
        self.assertEqual(len(await self.request('GET', 'tasks/?completed=true&limit=1')), 1)
        self.assertEqual(await self.request('GET', f"tasks/?folder_id={folder['id']}"), [])
        self.assertEqual(await self.request('GET', 'tasks/?user_id=999'), [])
        await self.request('DELETE', f'tasks/{tid}')
        await self.request('GET', f'tasks/{tid}', 404)

    async def test_missing_records(self):
        for resource in ['users', 'tasks', 'folders']:
            await self.request('GET', f'{resource}/999', 404)
            await self.request('DELETE', f'{resource}/999', 404)
            await self.request('PATCH', f'{resource}/999', 404, json={})
        await self.request('GET', 'folders/999/tasks', 404)
        await self.request('POST', 'folders/', 404, json={'title': 'Test', 'user_id': 999})
        await self.request('POST', 'tasks/', 404, json={'title': 'Test', 'user_id': self.user['id'], 'folder_id': 999})

    async def test_malformed_stored_password(self):
        from utils.auth import verify_password
        self.assertFalse(verify_password('secret', 'legacy-plaintext'))

    async def test_validation(self):
        task = await self.task()
        folder = await self.folder()
        for field, value in [('title', ''), ('title', ' '), ('title', 'x'*26), ('description', 'x'*151), ('completed', None), ('user_id', None)]:
            await self.request('PATCH', f"tasks/{task['id']}", 422, json={field: value})
        await self.request('PATCH', f"folders/{folder['id']}", 422, json={'title': None})
        for resource in ['tasks', 'folders', 'users']:
            await self.request('GET', f'{resource}/?limit=-1', 422)
        for password in ['', 'я'*37]:
            response = await self.client.post('users/register', json={'username': 'valid', 'email': 'valid@example.com', 'password_hash': password})
            self.assertEqual(response.status_code, 422)

    async def test_folder_ownership_consistency(self):
        bob = await self.request('POST', 'users/register', json={
            'username': 'bobby', 'email': 'bob@example.com', 'password_hash': 'secret'})
        folder = await self.folder()
        await self.request('POST', 'tasks/', 422, json={
            'title': 'Test', 'user_id': bob['id'], 'folder_id': folder['id']})

    async def test_delete_user_cascades(self):
        folder = await self.folder()
        await self.task(folder['id'])
        await self.task()
        await self.request('DELETE', f"users/{self.user['id']}")
        self.assertEqual(await self.request('GET', 'tasks/'), [])
        self.assertEqual(await self.request('GET', 'folders/'), [])


if __name__ == '__main__':
    unittest.main()
