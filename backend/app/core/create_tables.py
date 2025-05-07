import logging
from sqlalchemy import inspect

logging.basicConfig()
logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)

from app.core.database import Base, engine
import app.core.models

def create_tables():
    """Создание всех таблиц базы данных"""
    Base.metadata.create_all(bind=engine)
    
    # Проверка и вывод списка созданных таблиц
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print(f"Созданные таблицы: {tables}")

if __name__ == "__main__":
    create_tables()
    print("Таблицы успешно созданы.")