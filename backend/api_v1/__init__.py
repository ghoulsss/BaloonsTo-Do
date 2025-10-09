from fastapi import APIRouter

from .tasks.views import router as tasks_router
from .folders.views import router as folders_router
from .users.views import router as users_router


router = APIRouter()

router.include_router(router=tasks_router, prefix="/tasks")
router.include_router(router=folders_router, prefix="/folders")
router.include_router(router=users_router, prefix="/users")
