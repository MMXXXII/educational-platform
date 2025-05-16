"""
Utility functions for file storage operations without async dependencies
"""

import os
import uuid
import shutil
from pathlib import Path
from fastapi import UploadFile, HTTPException

# Директория для сохранения файлов
UPLOAD_DIR = os.path.join(os.getcwd(), "static", "uploads")
COURSE_IMAGES_DIR = os.path.join(UPLOAD_DIR, "course_images")

# Создаем директории, если они не существуют
Path(COURSE_IMAGES_DIR).mkdir(parents=True, exist_ok=True)

# Допустимые типы изображений
ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"]


def save_course_image(image: UploadFile, user_id: int) -> str:
    """
    Save course image and return the URL

    Args:
        image: Uploaded image file
        user_id: ID of the user uploading the file

    Returns:
        URL path to the saved image
    """
    if not image:
        return None

    # Проверяем тип файла
    if image.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Supported types: {', '.join(ALLOWED_IMAGE_TYPES)}"
        )

    # Создаем уникальное имя файла
    file_ext = os.path.splitext(image.filename)[1]
    unique_filename = f"{user_id}_{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(COURSE_IMAGES_DIR, unique_filename)

    # Сохраняем файл
    try:
        # Создаем временный файл
        with open(file_path, "wb") as buffer:
            # Копируем содержимое загруженного файла
            shutil.copyfileobj(image.file, buffer)

        # Возвращаем относительный URL для фронтенда
        return f"/static/uploads/course_images/{unique_filename}"

    except Exception as e:
        # В случае ошибки удаляем файл, если он был создан
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=500, detail=f"Error saving file: {str(e)}")


def delete_file(file_path: str) -> bool:
    """
    Delete a file from the server

    Args:
        file_path: Relative path to the file

    Returns:
        True if successful, False otherwise
    """
    # Получаем абсолютный путь к файлу
    abs_path = os.path.join(os.getcwd(), file_path.lstrip('/'))

    # Проверяем, существует ли файл
    if not os.path.exists(abs_path):
        return False

    # Удаляем файл
    try:
        os.remove(abs_path)
        return True
    except Exception as e:
        print(f"Error deleting file: {str(e)}")
        return False
