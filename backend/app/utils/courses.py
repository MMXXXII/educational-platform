"""
Вспомогательные функции для работы с курсами
"""
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime
from sqlalchemy import func, desc, asc, and_, or_
from sqlalchemy.orm import Session, joinedload, contains_eager
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status

from app.core.models import Course, Category, CourseEnrollment, User, course_categories, Lesson


def get_filtered_courses_query(
    db: Session,
    category_id: Optional[int] = None,
    level: Optional[str] = None,
    search: Optional[str] = None,
    category_names: Optional[List[str]] = None,
    author: Optional[str] = None,
    sort_by: Optional[str] = "created_at",
    sort_order: Optional[str] = "desc"
) -> Any:
    """
    Создает SQLAlchemy запрос для фильтрации курсов с заданными параметрами

    Args:
        db: Сессия базы данных
        category_id: ID категории для фильтрации
        level: Уровень сложности курса
        search: Строка поиска только для заголовка и описания
        category_names: Список имен категорий для фильтрации
        author: Имя автора для фильтрации
        sort_by: Поле для сортировки
        sort_order: Порядок сортировки ("asc" или "desc")

    Returns:
        SQLAlchemy Query объект с примененными фильтрами
    """
    try:
        # Загружаем связанные категории для каждого курса
        query = db.query(Course).options(joinedload(Course.categories))

        # Фильтрация по ID категории
        if category_id:
            subquery = db.query(course_categories).filter(
                course_categories.c.course_id == Course.id,
                course_categories.c.category_id == category_id
            ).exists()
            query = query.filter(subquery)

        # Фильтрация по уровню
        if level:
            query = query.filter(Course.level == level)

        # Фильтрация по автору
        if author:
            search_author = f"%{author.lower()}%"
            query = query.filter(func.lower(Course.author).like(search_author))

        # Фильтрация по названиям категорий
        if category_names:
            category_conditions = []
            for name in category_names:
                subquery = db.query(course_categories).join(Category).filter(
                    course_categories.c.course_id == Course.id,
                    func.lower(Category.name).ilike(f"%{name.lower()}%")
                ).exists()
                category_conditions.append(subquery)
            query = query.filter(or_(*category_conditions))

        # Поиск по названию и описанию
        if search:
            search_term = f"%{search.lower()}%"
            query = query.filter(
                or_(
                    func.lower(Course.title).like(search_term),
                    func.lower(Course.description).like(search_term)
                )
            )

        # Сортировка
        sort_column = getattr(Course, sort_by, Course.created_at)
        if sort_order.lower() == "asc":
            query = query.order_by(asc(sort_column))
        else:
            query = query.order_by(desc(sort_column))

        return query

    except SQLAlchemyError as e:
        print(f"Database error in get_filtered_courses_query: {str(e)}")
        return db.query(Course).filter(Course.id == -1)


def get_paginated_courses(
    db: Session,
    page: int = 1,
    size: int = 10,
    sort_by: str = "created_at",
    sort_order: str = "desc",
    **filter_params
) -> Tuple[List[Course], int, int]:
    """
    Получает пагинированный список курсов с применением всех фильтров

    Args:
        db: Сессия базы данных
        page: Номер страницы (начиная с 1)
        size: Размер страницы
        sort_by: Поле для сортировки результатов
        sort_order: Порядок сортировки ('asc' или 'desc')
        **filter_params: Параметры фильтрации, передаваемые в get_filtered_courses_query

    Returns:
        Tuple из трех элементов:
        - Список объектов курсов
        - Общее количество курсов
        - Общее количество страниц
    """
    try:
        # Проверка и исправление входных параметров
        page = max(1, page)  # Страница не может быть меньше 1
        # Ограничиваем размер страницы от 1 до 100
        size = max(1, min(100, size))

        # Получаем базовый запрос с примененными фильтрами
        query = get_filtered_courses_query(
            db,
            sort_by=sort_by,
            sort_order=sort_order,
            **filter_params
        )

        # Подсчет общего количества записей для пагинации
        total = query.count()

        # Применение пагинации
        courses = query.offset((page - 1) * size).limit(size).all()

        # Расчет общего количества страниц
        # Округление вверх
        pages = (total + size - 1) // size if total > 0 else 0

        return courses, total, pages

    except SQLAlchemyError as e:
        # Логирование ошибки
        print(f"Database error in get_paginated_courses: {str(e)}")
        return [], 0, 0


def is_enrolled(db: Session, user_id: int, course_id: int) -> bool:
    """
    Проверяет, записан ли пользователь на курс

    Args:
        db: Сессия базы данных
        user_id: ID пользователя
        course_id: ID курса

    Returns:
        True если пользователь записан на курс, иначе False
    """
    try:
        enrollment = db.query(CourseEnrollment).filter(
            CourseEnrollment.user_id == user_id,
            CourseEnrollment.course_id == course_id
        ).first()

        return enrollment is not None

    except SQLAlchemyError as e:
        # Логирование ошибки
        print(f"Database error in is_enrolled: {str(e)}")
        return False


def get_user_course_progress(db: Session, user_id: int, course_id: int) -> Optional[Dict[str, Any]]:
    """
    Получает информацию о прогрессе пользователя на конкретном курсе

    Args:
        db: Сессия базы данных
        user_id: ID пользователя
        course_id: ID курса

    Returns:
        Словарь с информацией о прогрессе или None, если пользователь не записан
    """
    try:
        enrollment = db.query(CourseEnrollment).filter(
            CourseEnrollment.user_id == user_id,
            CourseEnrollment.course_id == course_id
        ).first()

        if not enrollment:
            return None

        return {
            "enrollment_id": enrollment.id,
            "progress": enrollment.progress,
            "completed": enrollment.completed,
            "enrolled_at": enrollment.enrolled_at,
            "last_accessed_at": enrollment.last_accessed_at
        }

    except SQLAlchemyError as e:
        # Логирование ошибки
        print(f"Database error in get_user_course_progress: {str(e)}")
        return None


def update_course_access_time(db: Session, user_id: int, course_id: int) -> bool:
    """
    Обновляет время последнего доступа к курсу

    Args:
        db: Сессия базы данных
        user_id: ID пользователя
        course_id: ID курса

    Returns:
        True если обновление успешно, иначе False
    """
    try:
        enrollment = db.query(CourseEnrollment).filter(
            CourseEnrollment.user_id == user_id,
            CourseEnrollment.course_id == course_id
        ).first()

        if not enrollment:
            return False

        enrollment.last_accessed_at = datetime.utcnow()
        db.commit()
        return True

    except SQLAlchemyError as e:
        # Логирование ошибки и откат транзакции
        print(f"Database error in update_course_access_time: {str(e)}")
        db.rollback()
        return False


def update_course_progress(db: Session, user_id: int, course_id: int, progress: float,
                           completed: Optional[bool] = None) -> bool:
    """
    Обновляет прогресс пользователя по курсу

    Args:
        db: Сессия базы данных
        user_id: ID пользователя
        course_id: ID курса
        progress: Новое значение прогресса (0-100)
        completed: Статус завершения курса

    Returns:
        True если обновление успешно, иначе False
    """
    try:
        enrollment = db.query(CourseEnrollment).filter(
            CourseEnrollment.user_id == user_id,
            CourseEnrollment.course_id == course_id
        ).first()

        if not enrollment:
            return False

        # Проверка и нормализация значения прогресса
        progress = max(0, min(100, progress))
        enrollment.progress = progress

        # Обновление статуса завершения, если указано
        if completed is not None:
            enrollment.completed = completed
        # Автоматическое определение статуса завершения по прогрессу
        elif progress >= 100:
            enrollment.completed = True

        enrollment.last_accessed_at = datetime.utcnow()
        db.commit()
        return True

    except SQLAlchemyError as e:
        # Логирование ошибки и откат транзакции
        print(f"Database error in update_course_progress: {str(e)}")
        db.rollback()
        return False


def get_popular_courses(db: Session, limit: int = 5) -> List[Course]:
    """
    Получает список популярных курсов на основе количества зачислений

    Args:
        db: Сессия базы данных
        limit: Максимальное количество курсов для возврата

    Returns:
        Список объектов курсов, отсортированных по популярности
    """
    try:
        # Ограничение значения limit для предотвращения перегрузки
        limit = max(1, min(50, limit))

        # Подсчитываем количество записей на каждый курс
        subquery = db.query(
            CourseEnrollment.course_id,
            func.count(CourseEnrollment.id).label('enrollments_count')
        ).group_by(CourseEnrollment.course_id).subquery()

        # Присоединяем подзапрос к основному запросу и сортируем по количеству записей
        query = db.query(Course).options(joinedload(Course.categories)).join(
            subquery,
            Course.id == subquery.c.course_id
        ).order_by(
            desc(subquery.c.enrollments_count)
        ).limit(limit)

        return query.all()

    except SQLAlchemyError as e:
        # Логирование ошибки
        print(f"Database error in get_popular_courses: {str(e)}")
        return []


def get_recent_courses(db: Session, limit: int = 5) -> List[Course]:
    """
    Получает список недавно добавленных курсов

    Args:
        db: Сессия базы данных
        limit: Максимальное количество курсов для возврата

    Returns:
        Список объектов курсов, отсортированных по дате создания
    """
    try:
        # Ограничение значения limit для предотвращения перегрузки
        limit = max(1, min(50, limit))

        return db.query(Course).options(
            joinedload(Course.categories)
        ).order_by(
            desc(Course.created_at)
        ).limit(limit).all()

    except SQLAlchemyError as e:
        # Логирование ошибки
        print(f"Database error in get_recent_courses: {str(e)}")
        return []


def get_user_enrolled_courses(db: Session, user_id: int,
                              page: int = 1, size: int = 10) -> Tuple[List[Course], int, int]:
    """
    Получает список курсов, на которые записан пользователь, с пагинацией

    Args:
        db: Сессия базы данных
        user_id: ID пользователя
        page: Номер страницы
        size: Размер страницы

    Returns:
        Tuple из трех элементов:
        - Список объектов курсов
        - Общее количество курсов
        - Общее количество страниц
    """
    try:
        # Проверка и исправление входных параметров
        page = max(1, page)
        size = max(1, min(100, size))

        # Запрос для получения курсов с присоединением таблицы записей
        query = db.query(Course).join(
            CourseEnrollment,
            CourseEnrollment.course_id == Course.id
        ).options(
            joinedload(Course.categories),
            contains_eager(Course.enrollments)
        ).filter(
            CourseEnrollment.user_id == user_id
        ).order_by(
            desc(CourseEnrollment.last_accessed_at)
        )

        # Подсчет общего количества записей
        total = query.count()

        # Применение пагинации
        courses = query.offset((page - 1) * size).limit(size).all()

        # Расчет общего количества страниц
        pages = (total + size - 1) // size if total > 0 else 0

        return courses, total, pages

    except SQLAlchemyError as e:
        # Логирование ошибки
        print(f"Database error in get_user_enrolled_courses: {str(e)}")
        return [], 0, 0


def get_course_by_id(db: Session, course_id: int) -> Course:
    """
    Получает детальную информацию о курсе по его ID или выдает ошибку 404

    Args:
        db: Сессия базы данных
        course_id: ID курса

    Returns:
        Объект курса

    Raises:
        HTTPException: если курс не найден
    """
    try:
        course = db.query(Course).options(
            joinedload(Course.categories)
        ).filter(
            Course.id == course_id
        ).first()

        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Курс с ID {course_id} не найден"
            )

        return course

    except SQLAlchemyError as e:
        # Логирование ошибки
        print(f"Database error in get_course_by_id: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при получении курса: {str(e)}"
        )


def enroll_user_to_course(db: Session, user_id: int, course_id: int) -> Optional[CourseEnrollment]:
    """
    Записывает пользователя на курс

    Args:
        db: Сессия базы данных
        user_id: ID пользователя
        course_id: ID курса

    Returns:
        Объект записи на курс или None в случае ошибки
    """
    try:
        # Проверяем, что пользователь еще не записан на курс
        existing_enrollment = db.query(CourseEnrollment).filter(
            CourseEnrollment.user_id == user_id,
            CourseEnrollment.course_id == course_id
        ).first()

        if existing_enrollment:
            # Обновляем время последнего доступа
            existing_enrollment.last_accessed_at = datetime.utcnow()
            db.commit()
            return existing_enrollment

        # Создаем новую запись
        new_enrollment = CourseEnrollment(
            user_id=user_id,
            course_id=course_id,
            progress=0.0,
            completed=False,
            enrolled_at=datetime.utcnow(),
            last_accessed_at=datetime.utcnow()
        )

        db.add(new_enrollment)
        db.commit()
        db.refresh(new_enrollment)

        return new_enrollment

    except SQLAlchemyError as e:
        # Логирование ошибки и откат транзакции
        print(f"Database error in enroll_user_to_course: {str(e)}")
        db.rollback()
        return None


def get_recommended_courses(db: Session, user_id: int, limit: int = 5) -> List[Course]:
    """
    Получает рекомендованные курсы для пользователя на основе его интересов

    Args:
        db: Сессия базы данных
        user_id: ID пользователя
        limit: Максимальное количество курсов для возврата

    Returns:
        Список рекомендованных курсов
    """
    try:
        # Получаем категории курсов, на которые уже записан пользователь
        enrolled_categories = db.query(Category.id).join(
            course_categories
        ).join(
            Course
        ).join(
            CourseEnrollment
        ).filter(
            CourseEnrollment.user_id == user_id
        ).distinct().all()

        # Получаем IDs категорий
        category_ids = [cat[0] for cat in enrolled_categories]

        if not category_ids:
            # Если нет записей на курсы, возвращаем популярные курсы
            return get_popular_courses(db, limit)

        # Получаем курсы из тех же категорий, на которые пользователь не записан
        enrolled_course_ids = db.query(CourseEnrollment.course_id).filter(
            CourseEnrollment.user_id == user_id
        ).all()

        # Получаем IDs курсов
        enrolled_ids = [c[0] for c in enrolled_course_ids]

        # Запрос на рекомендованные курсы
        query = db.query(Course).join(
            course_categories
        ).filter(
            course_categories.c.category_id.in_(category_ids),
            ~Course.id.in_(enrolled_ids) if enrolled_ids else True
        ).options(
            joinedload(Course.categories)
        ).order_by(
            desc(Course.created_at)
        ).limit(limit)

        return query.all()

    except SQLAlchemyError as e:
        # Логирование ошибки
        print(f"Database error in get_recommended_courses: {str(e)}")
        return []


def check_course_owner(course: Course, user) -> bool:
    """
    Проверяет, является ли пользователь владельцем курса или администратором

    Args:
        course: Объект курса
        user: Объект пользователя

    Returns:
        True, если пользователь является владельцем или администратором

    Raises:
        HTTPException: если пользователь не имеет прав для редактирования курса
    """
    # В текущей версии автор хранится как строка (имя пользователя)
    # В будущем, когда поле author заменится на username, эту функцию нужно будет обновить
    if course.author != user.username and user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Недостаточно прав для изменения этого курса"
        )
    return True


def reorder_lessons(db: Session, course_id: int) -> bool:
    """
    Переупорядочивает уроки курса после удаления или изменения порядка

    Args:
        db: Сессия базы данных
        course_id: ID курса

    Returns:
        True, если операция выполнена успешно
    """
    try:
        lessons = db.query(Lesson).filter(
            Lesson.course_id == course_id
        ).order_by(Lesson.order).all()

        # Обновляем порядок уроков, чтобы он был последовательным
        for idx, lesson in enumerate(lessons):
            lesson.order = idx + 1

        db.commit()
        return True

    except SQLAlchemyError as e:
        # Логирование ошибки и откат транзакции
        print(f"Database error in reorder_lessons: {str(e)}")
        db.rollback()
        return False
