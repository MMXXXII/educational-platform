import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router';
import { ArrowLeftIcon, PlusIcon, XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

// Импортируем API для работы с курсами
import { categoriesApi, coursesApi } from '../api/coursesService';
import LessonsManager from './LessonsManager';

export function EditCoursePage() {
    const { id: courseId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [lessons, setLessons] = useState([]);
    const [imagePreview, setImagePreview] = useState(null);
    const [existingImageUrl, setExistingImageUrl] = useState(null);

    // Состояние курса
    const [course, setCourse] = useState({
        title: '',
        description: '',
        longDescription: '',
        difficulty: '',
        category_id: '',
        image: null
    });

    // Состояние для отслеживания ошибок валидации
    const [errors, setErrors] = useState({});

    // Получаем категории с сервера
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoriesApi.getCategories();
                setCategories(response.items || []);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
                setCategories([]);
            }
        };

        fetchCategories();
    }, []);

    // Загрузка данных курса для редактирования
    useEffect(() => {
        const fetchCourseData = async () => {
            if (!courseId) return;

            try {
                setInitialLoading(true);
                const courseData = await coursesApi.getCourseForEdit(courseId);

                // Заполняем форму данными курса
                setCourse({
                    title: courseData.title || '',
                    description: courseData.description || '',
                    longDescription: courseData.longdescription || '',
                    difficulty: courseData.difficulty || '',
                    category_id: courseData.categories && courseData.categories.length > 0
                        ? courseData.categories[0].id.toString()
                        : '',
                    image: null
                });

                // Устанавливаем URL существующего изображения
                if (courseData.image_url) {
                    setExistingImageUrl(courseData.image_url);
                }

                // Загружаем уроки
                setLessons(courseData.lessons || []);

            } catch (error) {
                console.error('Failed to fetch course data:', error);
                setErrors({ fetch: 'Не удалось загрузить данные курса' });
            } finally {
                setInitialLoading(false);
            }
        };

        fetchCourseData();
    }, [courseId]);

    // Обработчик изменения полей курса
    const handleCourseChange = (e) => {
        const { name, value } = e.target;
        setCourse({
            ...course,
            [name]: value
        });

        // Сбрасываем ошибку для этого поля, если она была
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: null
            });
        }
    };

    // Обработчик изменения изображения
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCourse({
                ...course,
                image: file
            });

            // Создаем URL для предпросмотра изображения
            const imageUrl = URL.createObjectURL(file);
            setImagePreview(imageUrl);

            // Очищаем ошибку для изображения, если она была
            if (errors.image) {
                setErrors({
                    ...errors,
                    image: null
                });
            }
        }
    };

    // Валидация формы перед отправкой
    const validateForm = () => {
        const newErrors = {};

        if (!course.title.trim()) {
            newErrors.title = 'Название курса обязательно';
        }

        if (!course.description.trim()) {
            newErrors.description = 'Краткое описание обязательно';
        }

        if (!course.longDescription.trim()) {
            newErrors.longDescription = 'Подробное описание обязательно';
        }

        if (!course.difficulty) {
            newErrors.difficulty = 'Выберите уровень сложности';
        }

        if (!course.category_id) {
            newErrors.category_id = 'Выберите категорию';
        }

        setErrors(newErrors);

        // Форма валидна, если нет ошибок
        return Object.keys(newErrors).length === 0;
    };

    // Обработчик обновления уроков
    const handleLessonsUpdate = (updatedLessons) => {
        setLessons(updatedLessons);
    };

    // Функция для сохранения данных курса перед переходом к редактору сцен
    const saveCourseDataToLocalStorage = () => {
        const courseBackupData = {
            course: course,
            imagePreview: imagePreview,
            existingImageUrl: existingImageUrl,
            courseId: courseId
        };
        localStorage.setItem('editCourseFormBackup', JSON.stringify(courseBackupData));
    };

    // Восстановление данных курса при возврате из редактора сцен
    useEffect(() => {
        const savedCourseData = localStorage.getItem('editCourseFormBackup');
        if (savedCourseData) {
            try {
                const parsedCourseData = JSON.parse(savedCourseData);
                if (parsedCourseData.courseId === courseId) {
                    setCourse(parsedCourseData.course);

                    if (parsedCourseData.imagePreview) {
                        setImagePreview(parsedCourseData.imagePreview);
                    }

                    if (parsedCourseData.existingImageUrl) {
                        setExistingImageUrl(parsedCourseData.existingImageUrl);
                    }

                    localStorage.removeItem('editCourseFormBackup');
                }
            } catch (error) {
                console.error('Ошибка при восстановлении данных курса:', error);
                localStorage.removeItem('editCourseFormBackup');
            }
        }
    }, [courseId]);

    // Обработчик отправки формы
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            setErrors(prev => ({ ...prev, submit: null }));

            // Формируем данные для отправки на сервер
            const courseData = {
                title: course.title,
                description: course.description,
                longdescription: course.longDescription,
                difficulty: course.difficulty,
                category_ids: [parseInt(course.category_id)],
                image: course.image
            };

            // Обновляем данные курса на сервере
            const response = await coursesApi.updateCourse(courseId, courseData);

            if (response && response.id) {
                // Обновляем уроки если они изменились
                const existingLessons = await coursesApi.getCourseWithLessons(courseId);
                const existingLessonIds = existingLessons.lessons.map(l => l.id);

                // Обрабатываем уроки: создаем новые, обновляем существующие
                for (const lesson of lessons) {
                    if (lesson.id && existingLessonIds.includes(lesson.id)) {
                        // Обновляем существующий урок
                        await coursesApi.updateLesson(courseId, lesson.id, {
                            title: lesson.title,
                            content: lesson.content,
                            order: lesson.order,
                            scene_data: lesson.scene_data
                        });
                    } else if (!lesson.id) {
                        // Создаем новый урок
                        await coursesApi.createLesson(courseId, {
                            title: lesson.title,
                            content: lesson.content,
                            order: lesson.order,
                            scene_data: lesson.scene_data,
                            course_id: parseInt(courseId) // Добавляем course_id
                        });
                    }
                }

                // Удаляем уроки, которые были удалены из формы
                const currentLessonIds = lessons.filter(l => l.id).map(l => l.id);
                const lessonsToDelete = existingLessonIds.filter(id => !currentLessonIds.includes(id));

                for (const lessonId of lessonsToDelete) {
                    await coursesApi.deleteLesson(courseId, lessonId);
                }

                // Переходим на страницу курса
                navigate(`/courses/${courseId}`);
            }
        } catch (error) {
            console.error('Ошибка при обновлении курса:', error);
            setErrors({
                ...errors,
                submit: error.message || 'Произошла ошибка при обновлении курса. Пожалуйста, попробуйте снова.'
            });
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="container mx-auto px-4 sm:px-6 py-16 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (errors.fetch) {
        return (
            <div className="container mx-auto px-4 sm:px-6 py-16 text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Ошибка загрузки</h2>
                <p className="text-gray-600 mb-6">{errors.fetch}</p>
                <Link
                    to="/my-courses"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <ArrowLeftIcon className="h-5 w-5 mr-2" />
                    Вернуться к моим курсам
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 py-8">
            {/* Навигация и заголовок */}
            <div className="flex items-center mb-6">
                <Link to="/my-courses" className="mr-4 text-blue-600 hover:text-blue-800">
                    <ArrowLeftIcon className="h-5 w-5" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-800">Редактирование курса</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
                {/* Основная информация о курсе */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Информация о курсе</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Название курса */}
                        <div className="col-span-2">
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                Название курса*
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={course.title}
                                onChange={handleCourseChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {errors.title && (
                                <p className="mt-1 text-sm text-red-500">{errors.title}</p>
                            )}
                        </div>

                        {/* Краткое описание */}
                        <div className="col-span-2">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                Краткое описание*
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={course.description}
                                onChange={handleCourseChange}
                                rows="2"
                                placeholder="Краткое описание будет отображаться в каталоге курсов"
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.description ? 'border-red-500' : 'border-gray-300'} placeholder-gray-400`}
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                            )}
                        </div>

                        {/* Подробное описание */}
                        <div className="col-span-2">
                            <label htmlFor="longDescription" className="block text-sm font-medium text-gray-700 mb-1">
                                Подробное описание*
                            </label>
                            <textarea
                                id="longDescription"
                                name="longDescription"
                                value={course.longDescription}
                                onChange={handleCourseChange}
                                rows="6"
                                placeholder="Подробно опишите ваш курс, чему научатся студенты, какие навыки приобретут"
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.longDescription ? 'border-red-500' : 'border-gray-300'} placeholder-gray-400`}
                            />
                            {errors.longDescription && (
                                <p className="mt-1 text-sm text-red-500">{errors.longDescription}</p>
                            )}
                        </div>

                        {/* Уровень сложности */}
                        <div className="col-span-1 sm:col-span-1 md:col-span-1">
                            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1 min-h-[40px] flex items-end">
                                Уровень сложности*
                            </label>
                            <select
                                id="difficulty"
                                name="difficulty"
                                value={course.difficulty}
                                onChange={handleCourseChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.difficulty ? 'border-red-500' : 'border-gray-300'} text-gray-900 bg-white`}
                            >
                                <option value="" className="text-gray-900">Выберите уровень сложности</option>
                                <option value="начинающий" className="text-gray-900">Начинающий</option>
                                <option value="средний" className="text-gray-900">Средний</option>
                                <option value="продвинутый" className="text-gray-900">Продвинутый</option>
                            </select>
                            {errors.difficulty && (
                                <p className="mt-1 text-sm text-red-500">{errors.difficulty}</p>
                            )}
                        </div>

                        {/* Категория */}
                        <div className="col-span-1 sm:col-span-1 md:col-span-1">
                            <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1 min-h-[40px] flex items-end">
                                Категория*
                            </label>
                            <select
                                id="category_id"
                                name="category_id"
                                value={course.category_id}
                                onChange={handleCourseChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.category_id ? 'border-red-500' : 'border-gray-300'} text-gray-900 bg-white`}
                            >
                                <option value="" className="text-gray-900">Выберите категорию</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id} className="text-gray-900">
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                            {errors.category_id && (
                                <p className="mt-1 text-sm text-red-500">{errors.category_id}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Загрузка изображения */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Изображение курса</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Обложка курса
                            </label>
                            <div className="mt-1 flex items-center">
                                <div className={`w-full px-3 py-6 border-2 border-dashed rounded-lg text-center ${errors.image ? 'border-red-500' : 'border-gray-300'}`}>
                                    <input
                                        type="file"
                                        id="image"
                                        name="image"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                    <label htmlFor="image" className="cursor-pointer">
                                        <div className="space-y-2">
                                            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
                                                <PlusIcon className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div className="text-gray-600">
                                                <span className="text-blue-600 font-medium">Нажмите для загрузки</span> или перетащите изображение
                                            </div>
                                            <p className="text-xs text-gray-500">PNG, JPG, GIF до 10MB</p>
                                        </div>
                                    </label>
                                </div>
                            </div>
                            {errors.image && (
                                <p className="mt-1 text-sm text-red-500">{errors.image}</p>
                            )}
                        </div>

                        {/* Предпросмотр изображения */}
                        <div>
                            {imagePreview || existingImageUrl ? (
                                <div className="relative">
                                    <img
                                        src={imagePreview || existingImageUrl}
                                        alt="Предпросмотр"
                                        className="w-full h-64 object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setImagePreview(null);
                                            if (imagePreview) {
                                                setCourse({ ...course, image: null });
                                            } else {
                                                setExistingImageUrl(null);
                                            }
                                        }}
                                        className="absolute top-2 right-2 bg-white p-1 rounded-full shadow-md"
                                    >
                                        <XMarkIcon className="h-5 w-5 text-gray-600" />
                                    </button>
                                </div>
                            ) : (
                                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <p className="text-gray-500">Предпросмотр изображения</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Управление уроками */}
                <div className="mb-8">
                    <LessonsManager
                        initialLessons={lessons}
                        courseId={courseId}
                        onChange={handleLessonsUpdate}
                        onNavigateToEditor={saveCourseDataToLocalStorage}
                        isEditMode={true}
                    />
                </div>

                {/* Кнопки действий */}
                <div className="flex flex-col sm:flex-row justify-center sm:justify-end space-y-2 sm:space-y-0 sm:space-x-4">
                    <Link
                        to="/my-courses"
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-center"
                    >
                        Отмена
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                                Сохранение...
                            </span>
                        ) : (
                            'Сохранить изменения'
                        )}
                    </button>
                </div>

                {/* Общая ошибка при отправке */}
                {errors.submit && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                        {errors.submit}
                    </div>
                )}
            </form>
        </div>
    );
}