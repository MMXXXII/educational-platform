"""
Скрипт для заполнения базы данных тестовыми данными для курсов и категорий.
Запуск: python -m app.scripts.seed_courses
"""
from app.core.create_tables import create_tables
from app.core.models import Category, Course
from app.core.database import SessionLocal, engine
import sys
import os
from sqlalchemy.orm import Session

# Добавление пути проекта в sys.path для импорта модулей
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def seed_data():
    """Заполнить базу данных тестовыми данными"""
    db = SessionLocal()
    try:
        # Создание категорий
        categories = [
            Category(
                name="Python",
                slug="python",
                description="Курсы по языку программирования Python для начинающих и опытных разработчиков"
            ),
            Category(
                name="Веб-разработка",
                slug="web",
                description="Frontend и backend разработка, HTML, CSS, JavaScript и другие технологии"
            ),
            Category(
                name="JavaScript",
                slug="javascript",
                description="Изучение JavaScript от основ до продвинутых тем"
            ),
            Category(
                name="Алгоритмы",
                slug="algorithms",
                description="Алгоритмы и структуры данных для эффективного решения задач"
            ),
            Category(
                name="Разработка игр",
                slug="game-dev",
                description="Создание игр для разных платформ и возрастов"
            ),
            Category(
                name="Робототехника",
                slug="robotics",
                description="Программирование роботов, электроника и проектирование устройств"
            ),
            Category(
                name="Data Science",
                slug="data-science",
                description="Анализ данных, машинное обучение и визуализация"
            ),
            Category(
                name="Frontend",
                slug="frontend",
                description="Разработка пользовательских интерфейсов веб-приложений"
            ),
        ]

        for category in categories:
            db.add(category)

        db.commit()

        # Загружаем все категории для создания связей
        python_cat = db.query(Category).filter(
            Category.slug == "python").first()
        web_cat = db.query(Category).filter(Category.slug == "web").first()
        js_cat = db.query(Category).filter(
            Category.slug == "javascript").first()
        algo_cat = db.query(Category).filter(
            Category.slug == "algorithms").first()
        game_cat = db.query(Category).filter(
            Category.slug == "game-dev").first()
        robot_cat = db.query(Category).filter(
            Category.slug == "robotics").first()
        data_cat = db.query(Category).filter(
            Category.slug == "data-science").first()
        frontend_cat = db.query(Category).filter(
            Category.slug == "frontend").first()

        # Создание курсов с привязкой к нескольким категориям
        courses = [
            Course(
                title="Основы программирования в Python",
                description="Научитесь основам программирования с помощью Python - простого и мощного языка для начинающих.",
                level="начинающий",
                author="Александр Иванов",
                lessons_count=12,
                image_url="/images/python-basics.jpg",
                categories=[python_cat]  # Привязка к категории Python
            ),
            Course(
                title="Создание веб-сайтов с HTML и CSS",
                description="Изучите основы веб-разработки и научитесь создавать свои первые веб-страницы.",
                level="начинающий",
                author="Мария Петрова",
                lessons_count=10,
                image_url="/images/html-css.jpg",
                # Привязка к двум категориям
                categories=[web_cat, frontend_cat]
            ),
            Course(
                title="JavaScript для детей",
                description="Интерактивный курс по JavaScript с играми и анимациями для юных программистов.",
                level="начинающий",
                author="Павел Смирнов",
                lessons_count=15,
                image_url="/images/js-kids.jpg",
                # Привязка к категориям JavaScript и Разработка игр
                categories=[js_cat, game_cat]
            ),
            Course(
                title="Алгоритмы и структуры данных",
                description="Изучите основные алгоритмы и структуры данных на примерах и интерактивных заданиях.",
                level="средний",
                author="Анна Козлова",
                lessons_count=20,
                image_url="/images/algorithms.jpg",
                categories=[algo_cat, python_cat]  # Привязка к двум категориям
            ),
            Course(
                title="Разработка игр в Scratch",
                description="Создавайте свои первые игры с помощью визуального языка программирования Scratch.",
                level="начинающий",
                author="Дмитрий Соколов",
                lessons_count=8,
                image_url="/images/scratch.jpg",
                categories=[game_cat]  # Привязка к категории Разработка игр
            ),
            Course(
                title="Робототехника с Arduino",
                description="Научитесь программировать микроконтроллеры Arduino и создавать свои электронные устройства.",
                level="средний",
                author="Екатерина Новикова",
                lessons_count=14,
                image_url="/images/arduino.jpg",
                categories=[robot_cat]  # Привязка к категории Робототехника
            ),
            Course(
                title="Python для анализа данных",
                description="Освойте инструменты Python для обработки и анализа данных: Pandas, NumPy, Matplotlib.",
                level="средний",
                author="Андрей Сидоров",
                lessons_count=18,
                image_url="/images/python-data.jpg",
                # Привязка к категориям Python и Data Science
                categories=[python_cat, data_cat]
            ),
            Course(
                title="Разработка на React",
                description="Научитесь создавать современные интерактивные пользовательские интерфейсы с помощью React.",
                level="продвинутый",
                author="Елена Власова",
                lessons_count=22,
                image_url="/images/react-dev.jpg",
                # Привязка к трем категориям
                categories=[web_cat, js_cat, frontend_cat]
            ),
            Course(
                title="Продвинутая робототехника",
                description="Курс для тех, кто хочет углубить свои знания в робототехнике и компьютерном зрении.",
                level="продвинутый",
                author="Сергей Кузнецов",
                lessons_count=16,
                image_url="/images/advanced-robotics.jpg",
                # Привязка к категориям Робототехника и Data Science
                categories=[robot_cat, data_cat]
            ),
        ]

        for course in courses:
            db.add(course)

        db.commit()
        print("База данных успешно заполнена тестовыми данными!")

    except Exception as e:
        print(f"Ошибка при заполнении базы данных: {e}")
        # Показываем полный стек ошибки для отладки
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    # Создание таблиц, если они не существуют
    create_tables()

    # Заполнение данными
    seed_data()
