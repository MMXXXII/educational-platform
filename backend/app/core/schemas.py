"""
Pydantic models for request/response validation
"""

from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List, Union
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    admin = "admin"
    teacher = "teacher"
    user = "user"


class CourseDifficulty(str, Enum):
    начинающий = "начинающий"
    средний = "средний"
    продвинутый = "продвинутый"


class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: Optional[UserRole] = UserRole.user

    @validator('role')
    def validate_role(cls, v):
        if isinstance(v, str) and v not in [role.value for role in UserRole]:
            raise ValueError(
                f"Role must be one of: {', '.join([role.value for role in UserRole])}")
        return v


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: Optional[UserRole] = UserRole.user

    @validator('role')
    def validate_role(cls, v):
        if isinstance(v, str) and v not in [role.value for role in UserRole]:
            raise ValueError(
                f"Role must be one of: {', '.join([role.value for role in UserRole])}")
        return v


class UserOut(UserBase):
    id: int
    disabled: bool
    vk_id: Optional[str] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    username: Optional[str] = None


class FolderCreate(BaseModel):
    name: str
    parent: Optional[int] = None


class FolderSchema(BaseModel):
    id: int
    name: str
    parent: Optional[int] = None

    class Config:
        from_attributes = True


class FileSchema(BaseModel):
    id: int
    name: str
    url: str
    size: int
    folder: Optional[int] = None
    thumbnail: str

    class Config:
        from_attributes = True


class CategoryBase(BaseModel):
    """Базовая схема для категории курсов"""
    name: str
    slug: str
    description: Optional[str] = None


class CategoryCreate(CategoryBase):
    """Схема для создания категории"""
    pass


class CategoryOut(CategoryBase):
    """Схема для вывода категории"""
    id: int

    class Config:
        from_attributes = True


class CourseBase(BaseModel):
    """Базовая схема для курса"""
    title: str
    description: str
    longdescription: Optional[str] = None
    difficulty: CourseDifficulty = CourseDifficulty.начинающий
    author: str
    lessons_count: int = Field(default=0, ge=0)
    image_url: Optional[str] = None

    @validator('difficulty')
    def validate_difficulty(cls, v):
        if isinstance(v, str) and v not in [d.value for d in CourseDifficulty]:
            raise ValueError(
                f"Difficulty must be one of: {', '.join([d.value for d in CourseDifficulty])}")
        return v


class CourseCreate(CourseBase):
    """Схема для создания курса"""
    category_ids: List[int]


class CourseUpdate(BaseModel):
    """Схема для обновления курса"""
    title: Optional[str] = None
    description: Optional[str] = None
    longdescription: Optional[str] = None
    difficulty: Optional[CourseDifficulty] = None
    author: Optional[str] = None
    lessons_count: Optional[int] = Field(default=None, ge=0)
    image_url: Optional[str] = None
    category_ids: Optional[List[int]] = None

    @validator('difficulty')
    def validate_difficulty(cls, v):
        if v is not None and isinstance(v, str) and v not in [d.value for d in CourseDifficulty]:
            raise ValueError(
                f"Difficulty must be one of: {', '.join([d.value for d in CourseDifficulty])}")
        return v


class CategoryForCourse(CategoryOut):
    """Схема для отображения категории в рамках курса"""
    pass


class CourseOut(CourseBase):
    """Схема для вывода курса"""
    id: int
    created_at: datetime
    updated_at: datetime
    students_count: int
    categories: List[CategoryOut]

    class Config:
        from_attributes = True


class EnrollmentBase(BaseModel):
    """Базовая схема для записи на курс"""
    course_id: int


class EnrollmentCreate(EnrollmentBase):
    """Схема для создания записи на курс"""
    pass


class EnrollmentUpdate(BaseModel):
    """Схема для обновления записи на курс"""
    progress: Optional[float] = Field(default=None, ge=0, le=100)
    completed: Optional[bool] = None
    last_accessed_at: Optional[datetime] = None


class EnrollmentOut(EnrollmentBase):
    """Схема для вывода записи на курс"""
    id: int
    user_id: int
    progress: float
    completed: bool
    enrolled_at: Optional[datetime]
    last_accessed_at: Optional[datetime]

    class Config:
        from_attributes = True


class EnrollmentWithCourse(EnrollmentOut):
    """Схема для вывода записи на курс с данными курса"""
    course: CourseOut

    class Config:
        from_attributes = True


class CourseWithProgress(CourseOut):
    """Схема для вывода курса с информацией о прогрессе пользователя"""
    enrollments: List[EnrollmentOut] = []

    class Config:
        from_attributes = True


class MyCoursesResponse(BaseModel):
    """Схема для вывода списка курсов пользователя с прогрессом"""
    items: List[CourseWithProgress]
    total: int
    page: int
    size: int
    pages: int


class CoursesResponse(BaseModel):
    """Схема для вывода списка курсов с пагинацией"""
    items: List[CourseOut]
    total: int
    page: int
    size: int
    pages: int


class CategoriesResponse(BaseModel):
    """Схема для вывода списка категорий"""
    items: List[CategoryOut]
    total: int


class LessonBase(BaseModel):
    """Базовая схема для урока"""
    title: str
    content: str
    order: int
    scene_data: Optional[str] = None


class LessonCreate(LessonBase):
    """Схема для создания урока"""
    course_id: int


class LessonUpdate(BaseModel):
    """Схема для обновления урока"""
    title: Optional[str] = None
    content: Optional[str] = None
    order: Optional[int] = None
    scene_data: Optional[str] = None


class LessonOut(LessonBase):
    """Схема для вывода урока"""
    id: int
    course_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CourseWithLessons(CourseOut):
    """Схема для вывода курса с уроками"""
    lessons: List[LessonOut] = []

    class Config:
        from_attributes = True


class CourseEditResponse(CourseOut):
    """Схема для получения курса для редактирования с уроками"""
    lessons: List[LessonOut] = []

    class Config:
        from_attributes = True
