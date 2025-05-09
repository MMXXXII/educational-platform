"""
API endpoints for courses management
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status, Path
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.core.database import get_db
from app.core.models import Course, Category, CourseEnrollment, User
from app.core.schemas import (
    CategoryCreate, CategoryOut, CourseCreate, CourseOut, CourseUpdate,
    EnrollmentCreate, EnrollmentOut, EnrollmentUpdate,
    EnrollmentWithCourse, CoursesResponse, CategoriesResponse
)
from app.utils.auth import get_current_user
from app.utils.courses import (
    get_filtered_courses_query, get_paginated_courses, is_enrolled,
    get_user_course_progress, update_course_access_time,
    get_popular_courses, get_recent_courses, enroll_user_to_course,
    get_user_enrolled_courses, get_recommended_courses
)

router = APIRouter(prefix="/courses")


# Категории курсов
@router.get("/categories", response_model=CategoriesResponse)
async def list_categories(
    db: Session = Depends(get_db)
):
    """Получение списка всех категорий курсов"""
    try:
        categories = db.query(Category).all()
        return {
            "items": categories,
            "total": len(categories),
        }
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при получении категорий: {str(e)}"
        )


@router.get("/categories/{category_id}", response_model=CategoryOut)
async def get_category(
    category_id: int = Path(..., title="ID категории"),
    db: Session = Depends(get_db)
):
    """Получение информации о конкретной категории"""
    try:
        category = db.query(Category).filter(
            Category.id == category_id).first()
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Категория с ID {category_id} не найдена"
            )
        return category
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при получении категории: {str(e)}"
        )


@router.post("/categories", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
async def create_category(
    category: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Создание новой категории курсов (только для администраторов)"""
    try:
        if current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Недостаточно прав для выполнения операции"
            )

        # Проверка на дублирование
        existing = db.query(Category).filter(
            Category.slug == category.slug).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Категория с slug '{category.slug}' уже существует"
            )

        db_category = Category(**category.model_dump())
        db.add(db_category)
        db.commit()
        db.refresh(db_category)
        return db_category
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при создании категории: {str(e)}"
        )


# Курсы
@router.get("", response_model=CoursesResponse)
async def list_courses(
    page: int = Query(1, ge=1, description="Номер страницы"),
    size: int = Query(10, ge=1, le=100,
                      description="Количество элементов на странице"),
    category_id: Optional[int] = Query(
        None, description="Фильтр по ID категории"),
    level: Optional[str] = Query(
        None, description="Фильтр по уровню сложности"),
    search: Optional[str] = Query(
        None, description="Поиск по названию, описанию или тегам"),
    tags: Optional[List[str]] = Query(None, description="Фильтр по тегам"),
    author: Optional[str] = Query(None, description="Фильтр по автору"),
    sort_by: Optional[str] = Query(
        "created_at", description="Поле для сортировки"),
    sort_order: Optional[str] = Query(
        "desc", description="Порядок сортировки (asc/desc)"),
    db: Session = Depends(get_db)
):
    """Получение списка курсов с возможностью фильтрации и сортировки"""
    try:
        # Используем utils функцию для получения пагинированных курсов
        courses, total, pages = get_paginated_courses(
            db, page, size,
            sort_by=sort_by,
            sort_order=sort_order,
            category_id=category_id,
            level=level,
            search=search,
            tags=tags,
            author=author
        )

        return {
            "items": courses,
            "total": total,
            "page": page,
            "size": size,
            "pages": pages
        }
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при получении списка курсов: {str(e)}"
        )


@router.get("/popular", response_model=List[CourseOut])
async def list_popular_courses(
    limit: int = Query(5, ge=1, le=20, description="Количество курсов"),
    db: Session = Depends(get_db)
):
    """Получение списка самых популярных курсов"""
    try:
        return get_popular_courses(db, limit)
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при получении популярных курсов: {str(e)}"
        )


@router.get("/recent", response_model=List[CourseOut])
async def list_recent_courses(
    limit: int = Query(5, ge=1, le=20, description="Количество курсов"),
    db: Session = Depends(get_db)
):
    """Получение списка недавно добавленных курсов"""
    try:
        return get_recent_courses(db, limit)
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при получении недавних курсов: {str(e)}"
        )


@router.get("/recommended", response_model=List[CourseOut])
async def list_recommended_courses(
    limit: int = Query(5, ge=1, le=20, description="Количество курсов"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Получение списка рекомендуемых курсов для текущего пользователя"""
    try:
        return get_recommended_courses(db, current_user.id, limit)
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при получении рекомендованных курсов: {str(e)}"
        )


@router.get("/{course_id}", response_model=CourseOut)
async def get_course(
    course_id: int = Path(..., title="ID курса"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Получение подробной информации о конкретном курсе"""
    try:
        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Курс с ID {course_id} не найден"
            )

        # Если пользователь авторизован, обновляем время доступа
        if current_user:
            if is_enrolled(db, current_user.id, course_id):
                update_course_access_time(db, current_user.id, course_id)

        return course
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при получении информации о курсе: {str(e)}"
        )


@router.get("/{course_id}/progress", response_model=dict)
async def get_course_progress(
    course_id: int = Path(..., title="ID курса"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Получение информации о прогрессе пользователя по курсу"""
    try:
        # Проверяем существование курса
        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Курс с ID {course_id} не найден"
            )

        # Получаем прогресс пользователя
        progress = get_user_course_progress(db, current_user.id, course_id)
        if not progress:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Вы не записаны на этот курс"
            )

        return progress
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при получении прогресса: {str(e)}"
        )


@router.post("", response_model=CourseOut, status_code=status.HTTP_201_CREATED)
async def create_course(
    course: CourseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Создание нового курса (только для администраторов)"""
    try:
        if current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Недостаточно прав для выполнения операции"
            )

        # Проверка существования категорий
        if not course.category_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Необходимо указать хотя бы одну категорию"
            )

        # Получаем категории для курса
        categories = []
        for category_id in course.category_ids:
            category = db.query(Category).filter(
                Category.id == category_id).first()
            if not category:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Категория с ID {category_id} не найдена"
                )
            categories.append(category)

        # Создаем курс без категорий
        course_data = course.model_dump(exclude={"category_ids"})
        db_course = Course(**course_data)

        # Добавляем категории
        db_course.categories = categories

        db.add(db_course)
        db.commit()
        db.refresh(db_course)
        return db_course
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при создании курса: {str(e)}"
        )


@router.put("/{course_id}", response_model=CourseOut)
async def update_course(
    course_update: CourseUpdate,
    course_id: int = Path(..., title="ID курса"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Обновление информации о курсе (только для администраторов)"""
    try:
        if current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Недостаточно прав для выполнения операции"
            )

        # Поиск курса
        db_course = db.query(Course).filter(Course.id == course_id).first()
        if not db_course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Курс с ID {course_id} не найден"
            )

        # Обновляем категории если они указаны
        if course_update.category_ids is not None:
            categories = []
            for category_id in course_update.category_ids:
                category = db.query(Category).filter(
                    Category.id == category_id).first()
                if not category:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Категория с ID {category_id} не найдена"
                    )
                categories.append(category)
            db_course.categories = categories

        # Обновление только предоставленных полей
        update_data = course_update.model_dump(
            exclude={"category_ids"}, exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_course, key, value)

        db.commit()
        db.refresh(db_course)
        return db_course
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при обновлении курса: {str(e)}"
        )


@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_course(
    course_id: int = Path(..., title="ID курса"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Удаление курса (только для администраторов)"""
    try:
        if current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Недостаточно прав для выполнения операции"
            )

        # Поиск курса
        db_course = db.query(Course).filter(Course.id == course_id).first()
        if not db_course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Курс с ID {course_id} не найден"
            )

        # Удаление курса
        db.delete(db_course)
        db.commit()
        return None
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при удалении курса: {str(e)}"
        )


# Записи на курсы
@router.post("/enroll", response_model=EnrollmentOut, status_code=status.HTTP_201_CREATED)
async def enroll_in_course(
    enrollment: EnrollmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Запись пользователя на курс"""
    try:
        # Проверка существования курса
        course = db.query(Course).filter(
            Course.id == enrollment.course_id).first()
        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Курс с ID {enrollment.course_id} не найден"
            )

        # Используем функцию is_enrolled для проверки
        if is_enrolled(db, current_user.id, enrollment.course_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Вы уже записаны на этот курс"
            )

        # Используем вспомогательную функцию для записи на курс
        db_enrollment = enroll_user_to_course(
            db, current_user.id, enrollment.course_id)
        if not db_enrollment:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Ошибка при записи на курс"
            )

        return db_enrollment
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при записи на курс: {str(e)}"
        )


@router.get("/enrollments", response_model=List[EnrollmentWithCourse])
async def get_user_enrollments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Получение списка курсов, на которые записан текущий пользователь"""
    try:
        enrollments = db.query(CourseEnrollment).filter(
            CourseEnrollment.user_id == current_user.id
        ).order_by(
            CourseEnrollment.last_accessed_at.desc()
        ).all()
        return enrollments
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при получении списка записей: {str(e)}"
        )


@router.get("/my-courses", response_model=CoursesResponse)
async def get_my_courses(
    page: int = Query(1, ge=1, description="Номер страницы"),
    size: int = Query(10, ge=1, le=100,
                      description="Количество элементов на странице"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Получение списка курсов пользователя с пагинацией"""
    try:
        courses, total, pages = get_user_enrolled_courses(
            db, current_user.id, page, size)

        return {
            "items": courses,
            "total": total,
            "page": page,
            "size": size,
            "pages": pages
        }
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при получении списка курсов: {str(e)}"
        )


@router.put("/enrollments/{enrollment_id}", response_model=EnrollmentOut)
async def update_enrollment(
    enrollment_update: EnrollmentUpdate,
    enrollment_id: int = Path(..., title="ID записи на курс"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Обновление информации о прогрессе прохождения курса"""
    try:
        # Поиск записи
        db_enrollment = db.query(CourseEnrollment).filter(
            CourseEnrollment.id == enrollment_id,
            CourseEnrollment.user_id == current_user.id
        ).first()

        if not db_enrollment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Запись с ID {enrollment_id} не найдена или не принадлежит вам"
            )

        # Обновление только предоставленных полей
        update_data = enrollment_update.model_dump(exclude_unset=True)

        # Проверка и нормализация значения прогресса если оно предоставлено
        if "progress" in update_data:
            update_data["progress"] = max(0, min(100, update_data["progress"]))

            # Автоматическое определение статуса завершения по прогрессу
            if update_data["progress"] >= 100 and "completed" not in update_data:
                update_data["completed"] = True

        # Обновляем время последнего доступа
        update_data["last_accessed_at"] = datetime.utcnow()

        for key, value in update_data.items():
            setattr(db_enrollment, key, value)

        db.commit()
        db.refresh(db_enrollment)
        return db_enrollment
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при обновлении записи: {str(e)}"
        )


@router.delete("/enrollments/{enrollment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def unenroll_from_course(
    enrollment_id: int = Path(..., title="ID записи на курс"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Отмена записи на курс"""
    try:
        # Поиск записи
        db_enrollment = db.query(CourseEnrollment).filter(
            CourseEnrollment.id == enrollment_id,
            CourseEnrollment.user_id == current_user.id
        ).first()

        if not db_enrollment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Запись с ID {enrollment_id} не найдена или не принадлежит вам"
            )

        # Удаление записи
        db.delete(db_enrollment)
        db.commit()
        return None
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при отмене записи на курс: {str(e)}"
        )
