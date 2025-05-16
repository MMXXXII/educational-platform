"""
FastAPI application entry point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import CORS_ORIGINS, THUMBNAIL_DIR
from app.core.create_tables import create_tables
from app.api import auth, files, users, courses


async def lifespan(app: FastAPI):
    create_tables()
    yield

app = FastAPI(
    title="Backend API",
    root_path="/api",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for thumbnails
app.mount("/thumbnails", StaticFiles(directory=THUMBNAIL_DIR), name="thumbnails")

# Include routers
app.include_router(auth.router, tags=["auth"])
app.include_router(files.router, tags=["files"])
app.include_router(users.router, tags=["users"])
app.include_router(courses.router, tags=["courses"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000)
