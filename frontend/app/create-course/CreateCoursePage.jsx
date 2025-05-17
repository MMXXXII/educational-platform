import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { ArrowLeftIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

// Импортируем API для работы с курсами
import { categoriesApi, coursesApi } from '../api/coursesService';

export function CreateCoursePage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [lessons, setLessons] = useState([]);
    const [imagePreview, setImagePreview] = useState(null);

    // Состояние курса
    const [course, setCourse] = useState({
        title: '',
        description: '', // краткое описание
        longDescription: '', // подробное описание
        level: '',
        category_id: '', // храним только один id для совместимости с бэкендом
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

        if (!course.level) {
            newErrors.level = 'Выберите уровень сложности';
        }

        if (!course.category_id) {
            newErrors.category_id = 'Выберите категорию';
        }

        // Форма для уроков появится позже
        // if (lessons.length === 0) {
        //     newErrors.lessons = 'Добавьте хотя бы один урок';
        // }

        setErrors(newErrors);

        // Форма валидна, если нет ошибок
        return Object.keys(newErrors).length === 0;
    };

    // Обработчик добавления нового урока
    const handleAddLesson = () => {
        // Временно сохраняем данные курса в localStorage
        localStorage.setItem('temp_course_data', JSON.stringify({
            ...course,
            lessons: lessons
        }));

        // Переходим на страницу создания урока
        navigate('/courses/create/lesson', {
            state: {
                courseData: course,
                lessonOrder: lessons.length + 1
            }
        });
    };

    // Обработчик для добавления/обновления урока (будет вызываться при возврате со страницы создания урока)
    useEffect(() => {
        // Проверяем, есть ли данные урока в localStorage
        const savedLessonData = localStorage.getItem('temp_lesson_data');
        if (savedLessonData) {
            try {
                const lessonData = JSON.parse(savedLessonData);

                // Проверяем, новый это урок или редактирование существующего
                if (lessonData.index !== undefined) {
                    // Обновляем существующий урок
                    setLessons(prevLessons => {
                        const updatedLessons = [...prevLessons];
                        updatedLessons[lessonData.index] = {
                            title: lessonData.title,
                            description: lessonData.description,
                            content: lessonData.content,
                            order: lessonData.index + 1
                        };
                        return updatedLessons;
                    });
                } else {
                    // Добавляем новый урок
                    setLessons(prevLessons => [
                        ...prevLessons,
                        {
                            title: lessonData.title,
                            description: lessonData.description,
                            content: lessonData.content,
                            order: prevLessons.length + 1
                        }
                    ]);
                }

                // Очищаем сохраненные данные
                localStorage.removeItem('temp_lesson_data');
            } catch (error) {
                console.error('Ошибка при чтении данных урока:', error);
            }
        }

        // Восстанавливаем данные курса, если они есть
        const savedCourseData = localStorage.getItem('temp_course_data');
        if (savedCourseData) {
            try {
                const courseData = JSON.parse(savedCourseData);

                // Обновляем состояние курса, но не уроки (они уже обновлены выше)
                setCourse({
                    title: courseData.title || '',
                    description: courseData.description || '',
                    longDescription: courseData.longDescription || '',
                    level: courseData.level || 'начинающий',
                    category_id: courseData.category_id || '',
                    image: null // Изображение нельзя сохранить в localStorage
                });

                // Сохраняем превью изображения, если оно было
                if (courseData.imagePreview) {
                    setImagePreview(courseData.imagePreview);
                }

                // Очищаем сохраненные данные
                localStorage.removeItem('temp_course_data');
            } catch (error) {
                console.error('Ошибка при чтении данных курса:', error);
            }
        }
    }, [navigate]);

    // Обработчик удаления урока
    const handleRemoveLesson = (index) => {
        const updatedLessons = [...lessons];
        updatedLessons.splice(index, 1);

        // Обновляем порядок оставшихся уроков
        const reorderedLessons = updatedLessons.map((lesson, idx) => ({
            ...lesson,
            order: idx + 1
        }));

        setLessons(reorderedLessons);
    };

    // Обработчик отправки формы
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            // Очищаем предыдущие ошибки перед отправкой
            setErrors(prev => ({ ...prev, submit: null }));

            // Формируем данные для отправки на сервер
            const courseData = {
                title: course.title,
                description: course.description,
                longDescription: course.longDescription,
                level: course.level,
                category_id: course.category_id,
                image: course.image,
                lessons: lessons
            };

            // Отправляем данные на сервер
            const response = await coursesApi.createCourse(courseData);

            // Если успешно создан, перенаправляем на страницу с созданным курсом 
            // или на общую страницу курсов
            if (response && response.id) {
                // Можно перейти на страницу созданного курса
                navigate(`/courses/${response.id}`);
            } else {
                // Или просто на список курсов
                navigate('/courses');
            }
        } catch (error) {
            console.error('Ошибка при создании курса:', error);
            setErrors({
                ...errors,
                submit: error.message || 'Произошла ошибка при создании курса. Пожалуйста, попробуйте снова.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 py-8">
            {/* Навигация и заголовок */}
            <div className="flex items-center mb-6">
                <Link to="/" className="mr-4 text-blue-600 hover:text-blue-800">
                    <ArrowLeftIcon className="h-5 w-5" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-800">Создание нового курса</h1>
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
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.title ? 'border-red-500' : 'border-gray-300'
                                    }`}
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
                        <div>
                            <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
                                Уровень сложности*
                            </label>
                            <select
                                id="level"
                                name="level"
                                value={course.level}
                                onChange={handleCourseChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.category_id ? 'border-red-500' : 'border-gray-300'} text-gray-900 bg-white`}
                            >
                                <option value="" className="text-gray-900">Выберите уровень сложности</option>
                                <option value="начинающий" className="text-gray-900">Начинающий</option>
                                <option value="средний" className="text-gray-900">Средний</option>
                                <option value="продвинутый" className="text-gray-900">Продвинутый</option>
                            </select>
                            {errors.level && (
                                <p className="mt-1 text-sm text-red-500">{errors.level}</p>
                            )}
                        </div>

                        {/* Категория */}
                        <div>
                            <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
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
                                <div className={`w-full px-3 py-6 border-2 border-dashed rounded-lg text-center ${errors.image ? 'border-red-500' : 'border-gray-300'
                                    }`}>
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
                            {imagePreview ? (
                                <div className="relative">
                                    <img
                                        src={imagePreview}
                                        alt="Предпросмотр"
                                        className="w-full h-64 object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setImagePreview(null);
                                            setCourse({ ...course, image: null });
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
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">Уроки</h2>
                        <button
                            type="button"
                            onClick={handleAddLesson}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <PlusIcon className="h-5 w-5 mr-1" />
                            Добавить урок
                        </button>
                    </div>

                    {lessons.length === 0 ? (
                        <div className={`bg-gray-50 border ${errors.lessons ? 'border-red-500' : 'border-gray-200'} rounded-lg p-6 text-center`}>
                            <p className={`${errors.lessons ? 'text-red-600' : 'text-gray-600'}`}>Добавьте уроки для вашего курса</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {lessons.map((lesson, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-4"
                                >
                                    <div className="flex items-center">
                                        <div className="bg-blue-100 text-blue-600 font-medium px-3 py-1 rounded-full mr-3">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <h3 className="font-medium">{lesson.title}</h3>
                                            <p className="text-sm text-gray-600">{lesson.longDescription}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => navigate(`/courses/create/lesson/${index}`, {
                                                state: {
                                                    courseData: course,
                                                    lessonData: lesson
                                                }
                                            })}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            Редактировать
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveLesson(index)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            Удалить
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {errors.lessons && (
                        <p className="mt-2 text-sm text-red-500">{errors.lessons}</p>
                    )}
                </div>

                {/* Кнопки действий */}
                <div className="flex justify-end space-x-4">
                    <Link
                        to="/"
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Отмена
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''
                            }`}
                    >
                        {loading ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Сохранение...
                            </span>
                        ) : (
                            'Создать курс'
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