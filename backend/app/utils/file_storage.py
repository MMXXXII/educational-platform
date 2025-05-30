"""
Utility functions for file storage operations without async dependencies
"""

import os
import uuid
import shutil
from pathlib import Path
from fastapi import UploadFile, HTTPException

from app.core.config import BASE_URL

# Определяем базовый путь для загрузки файлов
UPLOAD_DIR = Path("static/uploads")
COURSE_IMAGES_DIR = UPLOAD_DIR / "course_images"

# Создаем директории, если они не существуют
UPLOAD_DIR.mkdir(exist_ok=True)
COURSE_IMAGES_DIR.mkdir(exist_ok=True)

# Допустимые типы изображений
ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"]


def save_course_image(image: UploadFile, user_id: int) -> str:
    """
    Сохраняет изображение курса на сервере

    Args:
        image: Загруженный файл изображения
        user_id: ID пользователя, загрузившего изображение

    Returns:
        URL изображения для доступа через веб
    """
    try:
        # Проверяем, что загружено изображение
        content_type = image.content_type
        if not content_type or not content_type.startswith("image/"):
            raise HTTPException(
                status_code=400,
                detail="Файл должен быть изображением"
            )

        # Создаем уникальное имя файла
        filename = f"{user_id}_{uuid.uuid4()}{os.path.splitext(image.filename)[1]}"
        file_path = COURSE_IMAGES_DIR / filename

        # Сохраняем файл
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

        # Возвращаем URL для доступа к изображению
        # Используем формат относительно API, чтобы обеспечить совместимость с фронтендом
        return f"/static/uploads/course_images/{filename}"
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при сохранении изображения: {str(e)}"
        )


def delete_course_image(image_url: str) -> bool:
    """
    Удаляет изображение курса с сервера

    Args:
        image_url: URL изображения для удаления

    Returns:
        True если удаление успешно, False в противном случае
    """
    try:
        if not image_url:
            return False

        # Извлекаем имя файла из URL
        # Обрабатываем URL в различных форматах:
        # - полный URL: http://domain.com/static/uploads/course_images/filename.jpg
        # - относительный URL: /static/uploads/course_images/filename.jpg
        # - только путь к файлу: static/uploads/course_images/filename.jpg

        # Сначала получаем только часть пути после "course_images/"
        if "course_images/" in image_url:
            filename = image_url.split("course_images/")[-1]
        else:
            # Если не удалось разбить по паттерну, берем basename
            filename = os.path.basename(image_url)

        file_path = COURSE_IMAGES_DIR / filename

        # Проверяем существование файла и удаляем его
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
        return False
    except Exception as e:
        # Логируем ошибку, но не выбрасываем исключение
        print(f"Error deleting image file: {str(e)}")
        return False


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
