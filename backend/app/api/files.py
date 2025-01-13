"""
File management endpoints
"""
from fastapi import APIRouter, Depends, UploadFile, Form, status
from typing import List, Optional
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.models import User
from app.core.schemas import FileSchema, FolderSchema, FolderCreate
from app.utils.auth import get_current_active_user
from app.utils.files import (
    get_folders, create_folder, delete_folder,
    get_files, upload_file, delete_file,
    download_file, read_file_content
)

router = APIRouter()

@router.get("/folders", response_model=List[FolderSchema])
async def list_folders(
    parent: Optional[int] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return get_folders(db, current_user, parent)

@router.post("/folders", response_model=FolderSchema, status_code=status.HTTP_201_CREATED)
async def create_new_folder(
    folder: FolderCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return create_folder(db, current_user, folder.name, folder.parent)

@router.delete("/folders/{folder_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_folder(
    folder_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    delete_folder(db, current_user, folder_id)
    return {"status": "success"}

@router.get("/files", response_model=List[FileSchema])
async def list_files(
    folder: Optional[int] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return get_files(db, current_user, folder)

@router.post("/files", response_model=FileSchema)
async def upload_new_file(
    file: UploadFile,
    folder: Optional[int] = Form(None),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return upload_file(db, current_user, file, folder)

@router.delete("/files/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_file(
    file_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    delete_file(db, current_user, file_id)
    return {"status": "success"}

@router.get("/files/{file_id}/download")
async def download_single_file(
    file_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return download_file(db, current_user, file_id)

@router.get("/files/{file_id}/read")
async def read_file_contents(
    file_id: int,
    db: Session = Depends(get_db)
):
    return read_file_content(db, file_id)