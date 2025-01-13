"""
VK OAuth implementation
"""
import httpx
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.config import VK_CLIENT_ID, VK_CLIENT_SECRET, VK_REDIRECT_URI
from app.core.schemas import UserCreate
from app.utils.users import get_user_by_username, create_user, update_user_vk_id
from app.utils.auth import create_access_token, create_refresh_token

def vk_login():
    return {
        "url": f"https://oauth.vk.com/authorize?client_id={VK_CLIENT_ID}"
        f"&display=page&redirect_uri={VK_REDIRECT_URI}"
        f"&scope=email&response_type=code&v=5.131"
    }

async def vk_callback(code: str, db: Session):
    async with httpx.AsyncClient() as client:
        # Get access token
        token_response = await client.get(
            f"https://oauth.vk.com/access_token"
            f"?client_id={VK_CLIENT_ID}"
            f"&client_secret={VK_CLIENT_SECRET}"
            f"&redirect_uri={VK_REDIRECT_URI}&code={code}"
        )
        token_data = token_response.json()
        
        if "access_token" not in token_data:
            raise HTTPException(status_code=400, detail="Failed to get access token")
        
        vk_access_token = token_data["access_token"]
        vk_user_id = token_data["user_id"]
        email = token_data.get("email")
        
        # Get user info
        user_response = await client.get(
            f"https://api.vk.com/method/users.get"
            f"?user_ids={vk_user_id}"
            f"&fields=first_name,last_name"
            f"&access_token={vk_access_token}&v=5.131"
        )
        user_data = user_response.json()["response"][0]
        
        # Create or get user
        username = f"vk_{vk_user_id}"
        user = get_user_by_username(db, username)
        if not user:
            user = create_user(
                db,
                UserCreate(
                    username=username,
                    email=email or f"{username}@example.com",
                    password="",
                    role="user"
                )
            )
            update_user_vk_id(db, user.id, str(vk_user_id))
        
        # Create tokens
        access_token = create_access_token(data={"sub": username, "role": user.role})
        refresh_token = create_refresh_token(data={"sub": username, "role": user.role})
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }