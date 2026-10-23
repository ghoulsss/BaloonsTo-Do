import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
await mkdir('.checks', { recursive: true });
const browser = await chromium.launch({headless:true});
const page = await browser.newPage({viewport:{width:1440,height:1000}});
const checks=[], errors=[], failures=[];
const name=`qa${Date.now().toString().slice(-10)}`;
let uid;
page.on('pageerror', err => errors.push(err.message));
page.on('requestfailed', req => failures.push(`${req.method()} ${req.url()} ${req.failure()?.errorText}`));
page.on('dialog', dialog => dialog.accept());
const pass = name => {checks.push(name); console.log('PASS', name)};
const api = async(method,path,data,status=200)=>{
 const response=await page.request.fetch(`http://localhost:18080/api/v1/${path}`,{method,data});
 assert.equal(response.status(),status,`${method} ${path}: ${await response.text()}`);
 return response.json();
};
async function rows(n) { await page.waitForFunction(n=>document.querySelectorAll('.task-item').length===n,n); }
async function login(password='Test-pass-123') {
 await page.locator('.layout__header-button').click();
 await page.getByPlaceholder('Введите логин...').fill(name);
 await page.getByPlaceholder('Введите пароль...').fill(password);
 await page.locator('form').getByRole('button',{name:'Войти',exact:true}).click();
}
try {
 await page.goto(process.env.APP_URL || 'http://localhost:5173');
 await page.getByText('Добро пожаловать в To-Do Baloons').waitFor(); pass('Home page loads');
 await page.locator('.layout__header-button').click();
 await page.getByText('Регистрация',{exact:true}).click();
 await page.getByPlaceholder('Введите логин...').fill(name);
 await page.getByPlaceholder('Введите пароль...').fill('Test-pass-123');
 await page.getByPlaceholder('Введите email...').fill(`${name}@example.com`);
 await page.getByRole('button',{name:'Зарегистрироваться'}).click();
 await page.locator('.modal-overlay').waitFor({state:'hidden'}); pass('Registration through UI');
 await login();
 await page.getByText(`Здравствуйте, ${name}`).waitFor();
 uid=await page.evaluate(()=>JSON.parse(localStorage.getItem('user')).id); pass('Login through UI');
 await page.getByRole('button',{name:'+ Добавить папку'}).click();
 await page.getByPlaceholder('Как назвать папку?').fill('QA folder');
 await page.getByRole('button',{name:'Добавить',exact:true}).click();
 await page.locator('.folder-item').filter({hasText:'QA folder'}).waitFor(); pass('Create folder');
 for(const [title,folder] of [['QA first',true],['QA second',false]]) {
  await page.getByRole('button',{name:'+ Добавить задачу'}).click();
  assert.equal(await page.getByRole('button',{name:'Добавить',exact:true}).isDisabled(),true);
  await page.getByPlaceholder('Что нужно сделать?').fill(title);
  await page.getByPlaceholder('Добавьте детали...').fill('Проверка описания');
  if(folder) await page.locator('select').selectOption({label:'QA folder'});
  await page.getByRole('button',{name:'Добавить',exact:true}).click();
  await page.getByText(title,{exact:true}).waitFor();
 }
 await rows(2); pass('Create tasks with and without folder; reject empty title');
 await page.getByPlaceholder('Поиск задач...').fill('FIRST'); await rows(1);
 assert.equal(await page.locator('.content__title').innerText(),'QA first');
 await page.getByPlaceholder('Поиск задач...').fill('no-matching-task'); await rows(0);
 await page.getByPlaceholder('Поиск задач...').fill(''); await rows(2); pass('Search including empty result');
 await page.locator('.folder-item').filter({hasText:'QA folder'}).click(); await rows(1);
 await page.locator('.main-page__title').filter({hasText:'QA folder'}).waitFor(); pass('Filter by folder');
 await page.locator('.task-item input[type=checkbox]').click();
 await page.locator('.main-page__completed-tasks .task-item').waitFor(); pass('Complete task');
 await page.locator('.task-item input[type=checkbox]').click();
 await page.locator('.main-page__active-tasks .task-item').waitFor(); pass('Reopen task');
 await page.reload(); await rows(2); pass('Tasks persist after reload');
 const missingImages=await page.locator('img').evaluateAll(images=>images.filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src));
 assert.deepEqual(missingImages,[]); pass('All displayed images load');
 await page.screenshot({path:'.checks/browser-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:'.checks/browser-mobile.png',fullPage:true});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth),true);
 await page.getByRole('button',{name:'+ Добавить задачу'}).click();
 assert.equal(await page.evaluate(()=>document.querySelector('.modal-add-task').getBoundingClientRect().right <= innerWidth),true);
 await page.getByRole('button',{name:'Отменить',exact:true}).click(); pass('Mobile viewport and task modal fit screen');
 await page.setViewportSize({width:1440,height:1000});
 await page.locator('.task-item').filter({hasText:'QA second'}).getByRole('button',{name:'Удалить задачу'}).click();
 await rows(1); pass('Delete task through UI');
 await page.getByRole('button',{name:'Выйти',exact:true}).click();
 await page.getByText('Добро пожаловать в To-Do Baloons').waitFor(); pass('Logout');
 await login(); await page.getByText(`Здравствуйте, ${name}`).waitFor(); await rows(1); pass('Login again with persisted task');
 const folders=await api('GET',`folders/?user_id=${uid}`);
 const folder=folders.find(f=>f.title==='QA folder');
 await api('PATCH',`folders/${folder.id}`,{title:'QA renamed'});
 const detail=await api('GET',`folders/${folder.id}`); assert.equal(detail.title,'QA renamed'); assert.equal(detail.count_tasks,1);
 const extended=await api('GET',`folders/${folder.id}/tasks`); assert.equal(extended.tasks.length,1); pass('Read and rename folder on PostgreSQL');
 const task=extended.tasks[0];
 await api('PATCH',`tasks/${task.id}`,{title:'QA edited',description:'Edited'});
 assert.equal((await api('GET',`tasks/${task.id}`)).title,'QA edited'); pass('Read and edit task on PostgreSQL');
 await api('DELETE',`folders/${folder.id}`);
 await api('GET',`tasks/${task.id}`,undefined,404); pass('Folder deletion cascades on PostgreSQL');
 await api('PATCH',`users/${uid}`,{password_hash:'Changed-pass-123'});
 await api('POST','users/login',{username:name,password:'Test-pass-123'},401);
 await api('POST','users/login',{username:name,password:'Changed-pass-123'}); pass('Change password on PostgreSQL');
 await page.reload(); await rows(0);
 await page.route('**/api/v1/tasks/**',route=>route.fulfill({status:500,body:'Error'}));
 await page.reload(); await page.getByRole('alert').waitFor();
 await page.unroute('**/api/v1/tasks/**'); await page.getByRole('button',{name:'Повторить'}).click();
 await page.getByRole('alert').waitFor({state:'hidden'}); pass('Load error and retry recovery');
 assert.deepEqual(errors,[]); assert.deepEqual(failures,[]); pass('No uncaught browser errors or failed network requests');
} catch(err) {
 await page.screenshot({path:'.checks/browser-failure.png',fullPage:true});
 console.error(err); process.exitCode=1;
} finally {
 if(uid) await api('DELETE',`users/${uid}`);
 await writeFile('.checks/browser-results.json',JSON.stringify({checks,errors,failures,passed:!process.exitCode},null,2));
 await browser.close();
}
