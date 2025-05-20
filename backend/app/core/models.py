"""
SQLAlchemy ORM models
"""

from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text, Float, Table, Enum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
from app.core.database import Base


# Определение классов Enum для ограниченных значений
class UserRole(str, enum.Enum):
    admin = "admin"
    teacher = "teacher"
    user = "user"


class CourseDifficulty(str, enum.Enum):
    начинающий = "начинающий"
    средний = "средний"
    продвинутый = "продвинутый"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.user, nullable=False)
    disabled = Column(Boolean, default=False, nullable=False)
    vk_id = Column(String, unique=True)

    refresh_tokens = relationship(
        "RefreshToken", back_populates="user", cascade="all, delete-orphan")
    files = relationship("UserFile", back_populates="user",
                         cascade="all, delete-orphan")
    enrollments = relationship(
        "CourseEnrollment", back_populates="user", cascade="all, delete-orphan")


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(Integer, primary_key=True, index=True)
    token = Column(String, unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    user_id = Column(Integer, ForeignKey(
        "users.id", ondelete="CASCADE"), nullable=False)

    user = relationship("User", back_populates="refresh_tokens")


class UserFile(Base):
    __tablename__ = "user_files"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey(
        "users.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String, nullable=False)
    relative_path = Column(String, nullable=False)
    is_folder = Column(Boolean, default=False, nullable=False)
    parent_id = Column(Integer, ForeignKey(
        "user_files.id", ondelete="CASCADE"))
    created_at = Column(DateTime, default=datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=datetime.now(
        timezone.utc), onupdate=datetime.now(timezone.utc))

    user = relationship("User", back_populates="files")
    parent = relationship("UserFile", remote_side=[
                          id], back_populates="children")
    children = relationship(
        "UserFile", back_populates="parent", cascade="all, delete-orphan")


# Промежуточная таблица для связи многие-ко-многим между курсами и категориями
course_categories = Table(
    "course_categories",
    Base.metadata,
    Column("course_id", Integer, ForeignKey(
        "courses.id", ondelete="CASCADE"), primary_key=True, nullable=False),
    Column("category_id", Integer, ForeignKey(
        "categories.id", ondelete="CASCADE"), primary_key=True, nullable=False)
)


class Category(Base):
    """Модель категорий курсов"""
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text)

    # Связь с курсами через промежуточную таблицу
    courses = relationship(
        "Course", secondary=course_categories, back_populates="categories")

    def __repr__(self):
        return f"<Category {self.name}>"


class Course(Base):
    """Модель курсов"""
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=False)
    longdescription = Column(Text)
    difficulty = Column(Enum(CourseDifficulty),
                        default=CourseDifficulty.начинающий, nullable=False)

    # Метаданные курса
    author = Column(String, nullable=False)
    image_url = Column(String)
    lessons_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=datetime.now(
        timezone.utc), onupdate=datetime.now(timezone.utc))

    # Связи с категориями через промежуточную таблицу
    categories = relationship(
        "Category", secondary=course_categories, back_populates="courses")

    # Связи с записями на курс
    enrollments = relationship(
        "CourseEnrollment", back_populates="course", cascade="all, delete-orphan")

    # Связь с lessons
    lessons = relationship(
        "Lesson", back_populates="course", cascade="all, delete-orphan")

    @property
    def students_count(self):
        """Количество студентов на курсе"""
        return len(self.enrollments)

    def __repr__(self):
        return f"<Course {self.title}>"


class CourseEnrollment(Base):
    """Модель для отслеживания записи студентов на курсы"""
    __tablename__ = "course_enrollments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey(
        "users.id", ondelete="CASCADE"), nullable=False)
    course_id = Column(Integer, ForeignKey(
        "courses.id", ondelete="CASCADE"), nullable=False)

    # Прогресс и статус обучения
    # процент завершения 0-100
    progress = Column(Float, default=0.0, nullable=False)
    completed = Column(Boolean, default=False, nullable=False)

    # Дата записи и последнего доступа
    enrolled_at = Column(DateTime, default=datetime.now(timezone.utc))
    last_accessed_at = Column(DateTime, default=datetime.now(timezone.utc))

    # Связи
    user = relationship("User", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")

    def __repr__(self):
        return f"<CourseEnrollment {self.user_id} - {self.course_id}>"


class Lesson(Base):
    """Модель уроков курса"""
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey(
        "courses.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)  # теоретический материал урока
    order = Column(Integer, nullable=False)  # порядок уроков в курсе
    # JSON данные для интерактивной сцены может быть NULL для обычных уроков
    scene_data = Column(Text)
    created_at = Column(DateTime, default=datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=datetime.now(
        timezone.utc), onupdate=datetime.now(timezone.utc))

    # Связь с курсом
    course = relationship("Course", back_populates="lessons")
