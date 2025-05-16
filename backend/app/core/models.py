"""
SQLAlchemy ORM models
"""

from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text, Float, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="user")
    disabled = Column(Boolean, default=False)
    vk_id = Column(String, unique=True, nullable=True)

    refresh_tokens = relationship("RefreshToken", back_populates="user")
    files = relationship("UserFile", back_populates="user")
    enrollments = relationship("CourseEnrollment", back_populates="user")


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(Integer, primary_key=True, index=True)
    token = Column(String, unique=True, index=True)
    expires_at = Column(DateTime)
    user_id = Column(Integer, ForeignKey("users.id"))

    user = relationship("User", back_populates="refresh_tokens")


class UserFile(Base):
    __tablename__ = "user_files"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    filename = Column(String)
    relative_path = Column(String)
    is_folder = Column(Boolean, default=False)
    parent_id = Column(Integer, ForeignKey("user_files.id"), nullable=True)
    created_at = Column(DateTime)
    updated_at = Column(DateTime)

    user = relationship("User", back_populates="files")
    parent = relationship("UserFile", remote_side=[
                          id], back_populates="children")
    children = relationship("UserFile", back_populates="parent")


# Промежуточная таблица для связи многие-ко-многим между курсами и категориями
course_categories = Table(
    "course_categories",
    Base.metadata,
    Column("course_id", Integer, ForeignKey(
        "courses.id", ondelete="CASCADE"), primary_key=True),
    Column("category_id", Integer, ForeignKey(
        "categories.id", ondelete="CASCADE"), primary_key=True)
)


class Category(Base):
    """Модель категорий курсов"""
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    slug = Column(String, unique=True, index=True)
    description = Column(Text, nullable=True)

    # Связь с курсами через промежуточную таблицу
    courses = relationship(
        "Course", secondary=course_categories, back_populates="categories")

    def __repr__(self):
        return f"<Category {self.name}>"


class Course(Base):
    """Модель курсов"""
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    longdescription = Column(Text)
    level = Column(String)  # начинающий, средний, продвинутый

    # Метаданные курса
    author = Column(String)
    image_url = Column(String, nullable=True)
    lessons_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow)

    # Связи с категориями через промежуточную таблицу
    categories = relationship(
        "Category", secondary=course_categories, back_populates="courses")

    # Связи с записями на курс
    enrollments = relationship("CourseEnrollment", back_populates="course")

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
    user_id = Column(Integer, ForeignKey("users.id"))
    course_id = Column(Integer, ForeignKey("courses.id"))

    # Прогресс и статус обучения
    progress = Column(Float, default=0.0)  # процент завершения 0-100
    completed = Column(Boolean, default=False)

    # Дата записи и последнего доступа
    enrolled_at = Column(DateTime, default=datetime.utcnow)
    last_accessed_at = Column(DateTime, default=datetime.utcnow)

    # Связи
    user = relationship("User", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")

    def __repr__(self):
        return f"<CourseEnrollment {self.user_id} - {self.course_id}>"


class Lesson(Base):
    """Модель уроков курса"""
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"))
    title = Column(String)
    content = Column(Text)  # теоретический материал урока
    order = Column(Integer)  # порядок уроков в курсе
    scene_data = Column(Text)  # JSON данные для интерактивной сцены
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow)

    # Связь с курсом
    course = relationship("Course", back_populates="lessons")
