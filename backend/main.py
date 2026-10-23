import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api_v1 import router as api_v1_router
from core.config import settings


app = FastAPI()
app.include_router(router=api_v1_router, prefix=settings.api_v1_url)

origins = [
    "*",
    # "http://localhost",
    # "http://localhost:5173",
    # "http://10.140.1.250:5173",
    # "http://10.140.1.250:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"root": "baloons"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000)
