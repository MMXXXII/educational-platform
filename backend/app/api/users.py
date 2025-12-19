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
from pydantic import BaseModel
from app.core.schemas import UserUpdate


router = APIRouter()


@router.post("/users", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def create_new_user(
    username: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    role: str = Form("user"),
    db: Session = Depends(get_db)
):
    user = UserCreate(username=username, email=email,
                      password=password, role=role)
    db_user = get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(
            status_code=400, detail="Username already registered")
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

class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str

# Добавить этот эндпоинт в роутер (например, после read_users_me)
@router.put("/users/me/password", response_model=UserOut)
async def change_user_password(
    password_data: PasswordChangeRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Проверяем старый пароль
    from app.utils.auth import verify_password
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Неверный текущий пароль"
        )
    
    # Хэшируем и устанавливаем новый пароль
    from app.utils.auth import get_password_hash
    current_user.hashed_password = get_password_hash(password_data.new_password)
    db.commit()
    db.refresh(current_user)
    return current_user

class UserUpdate(BaseModel):
    email: str | None = None
    role: str | None = None
    is_active: bool | None = None

# Эндпоинт для получения пользователя по ID
@router.get("/users/{user_id}", response_model=UserOut)
async def read_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: bool = Depends(RoleChecker(allowed_roles=["admin"]))
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# Эндпоинт для обновления пользователя
@router.put("/users/{user_id}", response_model=UserOut)
async def update_user(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    _: bool = Depends(RoleChecker(allowed_roles=["admin"]))
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Обновляем только переданные поля
    if user_update.email is not None:
        user.email = user_update.email
    if user_update.role is not None:
        user.role = user_update.role
    if user_update.is_active is not None:
        user.is_active = user_update.is_active
    
    db.commit()
    db.refresh(user)
    return user

# Эндпоинт для удаления пользователя
@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: bool = Depends(RoleChecker(allowed_roles=["admin"]))
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}