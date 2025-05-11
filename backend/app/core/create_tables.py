"""
Скрипт для заполнения базы данных таблицами.
Запуск: python -m app.core.create_tables
"""

import logging

logging.basicConfig()

from app.core.database import Base, engine
import app.core.models

def create_tables():
    """Создание всех таблиц базы данных"""
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    create_tables()
    print("Таблицы успешно созданы.")