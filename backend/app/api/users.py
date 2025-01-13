"""
User management endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Form, status
from typing import List
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.models import User
from app.core.schemas import UserOut, UserCreate
from app.utils.auth import get_current_active_user, RoleChecker
from app.utils.users import get_user_by_username, create_user, get_users

router = APIRouter()

@router.post("/users", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def create_new_user(
    username: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    role: str = Form("user"),
    db: Session = Depends(get_db)
):
    user = UserCreate(username=username, email=email, password=password, role=role)
    db_user = get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    return create_user(db=db, user=user)

@router.get("/users/me", response_model=UserOut)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user

@router.get("/users", response_model=List[UserOut])
async def read_all_users(
    db: Session = Depends(get_db),
    _: bool = Depends(RoleChecker(allowed_roles=["admin"]))
):
    return get_users(db)