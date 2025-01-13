"""
Authentication and authorization endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.models import User
from app.core.schemas import Token
from app.utils.auth import (
    get_current_active_user,
    create_access_token,
    create_refresh_token,
    save_refresh_token
)
from app.utils.users import authenticate_user
from app.utils.vk import vk_login, vk_callback

router = APIRouter()

@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    
    access_token = create_access_token(data={"sub": user.username, "role": user.role})
    refresh_token = create_refresh_token(data={"sub": user.username, "role": user.role})
    
    save_refresh_token(db, user.id, refresh_token)
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer"
    )

@router.post("/refresh", response_model=Token)
async def refresh_access_token(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    access_token = create_access_token(
        data={"sub": current_user.username, "role": current_user.role}
    )
    refresh_token = create_refresh_token(
        data={"sub": current_user.username, "role": current_user.role}
    )

    save_refresh_token(db, current_user.id, refresh_token)
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer"
    )

@router.get("/login/vk")
async def login_vk_route():
    return vk_login()

@router.get("/vk-callback")
async def vk_callback_route(code: str, db: Session = Depends(get_db)):
    return await vk_callback(code, db)