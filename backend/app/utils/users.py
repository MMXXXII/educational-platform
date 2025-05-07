"""
User management utilities
"""
from sqlalchemy.orm import Session
from app.core.models import User
from app.core.schemas import UserCreate
from app.utils.auth import get_password_hash, verify_password

def authenticate_user(db: Session, username_or_email: str, password: str):
    user = get_user_by_username(db, username_or_email)
    if not user:
        user = get_user_by_email(db, username_or_email)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def get_user(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(User).offset(skip).limit(limit).all()

def create_user(db: Session, user: UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user_vk_id(db: Session, user_id: int, vk_id: str):
    user = get_user(db, user_id)
    if user:
        user.vk_id = vk_id
        db.commit()
        db.refresh(user)
    return user