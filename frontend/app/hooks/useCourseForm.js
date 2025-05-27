import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { categoriesApi, coursesApi } from '../api/coursesService';
import { saveCourseDataToDB, loadCourseDataFromDB, deleteCourseDataFromDB, cleanupOldData, cleanupAllSceneData } from '../utils/indexedDB';

export const useCourseForm = (mode = 'create', courseId = null) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(mode === 'edit');
    const [categories, setCategories] = useState([]);
    const [lessons, setLessons] = useState([]);
    const [imagePreview, setImagePreview] = useState(null);
    const [existingImageUrl, setExistingImageUrl] = useState(null);
    const hasRestoredFromLocalStorage = useRef(false);
    const [isSaving, setIsSaving] = useState(false);

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

    // Флаг для отслеживания удаления существующего изображения
    const [removeExistingImage, setRemoveExistingImage] = useState(false);

    // Получаем категории с сервера
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoriesApi.getCategories();
                setCategories(response.items || []);
            } catch (error) {
                setCategories([]);
            }
        };

        fetchCategories();

        // Очищаем старые данные при инициализации
        cleanupOldData();
    }, []);

    // Восстановление данных из IndexedDB для режима создания
    useEffect(() => {
        if (mode !== 'create') return;

        const restoreFromDB = async () => {
            if (hasRestoredFromLocalStorage.current) {
                return;
            }

            try {
                const savedData = await loadCourseDataFromDB('create');
                if (!savedData) {
                    return;
                }

                hasRestoredFromLocalStorage.current = true;

                const restoredCourse = {
                    ...savedData.courseData,
                    image: savedData.image
                };

                setCourse(restoredCourse);

                if (savedData.image) {
                    const imageUrl = URL.createObjectURL(savedData.image);
                    setImagePreview(imageUrl);
                }

                await deleteCourseDataFromDB('create');
            } catch (error) {
                console.error('Error restoring course data from IndexedDB:', error);
            }
        };

        const timeoutId = setTimeout(restoreFromDB, 50);
        return () => clearTimeout(timeoutId);
    }, [mode]);

    // Восстановление данных из IndexedDB для режима редактирования
    useEffect(() => {
        if (mode !== 'edit' || !courseId) return;

        const restoreFromDB = async () => {
            if (hasRestoredFromLocalStorage.current) {
                return;
            }

            try {
                const savedData = await loadCourseDataFromDB('edit', courseId);
                if (!savedData) {
                    return;
                }

                hasRestoredFromLocalStorage.current = true;

                const restoredCourse = {
                    ...savedData.courseData,
                    image: savedData.image
                };

                setCourse(restoredCourse);

                if (savedData.image) {
                    const imageUrl = URL.createObjectURL(savedData.image);
                    setImagePreview(imageUrl);
                }

                await deleteCourseDataFromDB('edit', courseId);
                setInitialLoading(false);
            } catch (error) {
                console.error('Error restoring edit course data from IndexedDB:', error);
                setInitialLoading(false);
            }
        };

        const timeoutId = setTimeout(restoreFromDB, 50);
        return () => clearTimeout(timeoutId);
    }, [mode, courseId]);

    // Загрузка данных курса с сервера в режиме редактирования
    useEffect(() => {
        if (mode !== 'edit' || !courseId || hasRestoredFromLocalStorage.current) return;

        const fetchCourseData = async () => {
            try {
                setInitialLoading(true);
                const courseData = await coursesApi.getCourseForEdit(courseId);

                const newCourseState = {
                    title: courseData.title || '',
                    description: courseData.description || '',
                    longDescription: courseData.longdescription || '',
                    difficulty: courseData.difficulty || '',
                    category_id: courseData.categories && courseData.categories.length > 0
                        ? courseData.categories[0].id.toString()
                        : '',
                    image: null
                };

                setCourse(newCourseState);

                // Устанавливаем существующий URL изображения без модификаций
                // Модификации будут выполнены в компоненте CourseFormFields
                if (courseData.image_url) {
                    setExistingImageUrl(courseData.image_url);
                }

                setLessons(courseData.lessons || []);
            } catch (error) {
                setErrors({ fetch: 'Не удалось загрузить данные курса' });
            } finally {
                setInitialLoading(false);
            }
        };

        fetchCourseData();
    }, [mode, courseId]);

    // Обработчик изменения полей курса
    const handleCourseChange = useCallback((e) => {
        const { name, value } = e.target;

        setCourse(prevCourse => {
            const newCourse = {
                ...prevCourse,
                [name]: value
            };
            return newCourse;
        });

        // Сбрасываем ошибку для этого поля, если она была
        setErrors(prevErrors => {
            if (!prevErrors[name]) return prevErrors;

            return {
                ...prevErrors,
                [name]: null
            };
        });
    }, []);

    // Обработчик изменения изображения
    const handleImageChange = useCallback((e) => {
        const file = e.target.files[0];
        if (!file) return;

        setCourse(prevCourse => ({
            ...prevCourse,
            image: file
        }));

        // Создаем URL для предпросмотра изображения
        const imageUrl = URL.createObjectURL(file);
        setImagePreview(imageUrl);

        // Очищаем ошибку для изображения, если она была
        setErrors(prevErrors => {
            if (!prevErrors.image) return prevErrors;

            return {
                ...prevErrors,
                image: null
            };
        });
    }, []);

    // Обработчик удаления изображения
    const handleRemoveImage = useCallback(() => {
        setImagePreview(null);
        setCourse(prevCourse => ({
            ...prevCourse,
            image: null
        }));

        // Если это режим редактирования и есть существующее изображение
        if (mode === 'edit' && existingImageUrl) {
            setExistingImageUrl(null);
            setRemoveExistingImage(true); // Устанавливаем флаг для удаления изображения на сервере
        }
    }, [existingImageUrl, mode]);

    // Валидация формы перед отправкой
    const validateForm = useCallback(() => {
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

        if (mode === 'create' && lessons.length === 0) {
            newErrors.lessons = 'Добавьте хотя бы один урок';
        } else if (lessons.length > 0) {
            // Проверяем, что все уроки имеют заголовок и содержание 
            const invalidLessons = lessons.filter(lesson =>
                !lesson.title || !lesson.title.trim() ||
                !lesson.content || !lesson.content.trim()
            );

            if (invalidLessons.length > 0) {
                newErrors.lessons = 'Все уроки должны иметь заголовок и содержание';
            }
        }

        setErrors(newErrors);

        // Форма валидна, если нет ошибок
        return Object.keys(newErrors).length === 0;
    }, [course, lessons, mode]);

    // Обработчик обновления уроков
    const handleLessonsUpdate = useCallback((updatedLessons) => {
        const editingLessonKey = mode === 'edit' ? 'editCurrentEditingLesson' : 'currentEditingLesson';
        const hasSceneDataToRestore = localStorage.getItem(editingLessonKey);

        if (hasSceneDataToRestore && updatedLessons.length === 0 && lessons.length > 0) {
            return;
        }

        if (updatedLessons.length === 0 && lessons.length > 0) {
            const isSceneProcessing =
                localStorage.getItem('allLessonsBackup') ||
                localStorage.getItem('editAllLessonsBackup');

            if (isSceneProcessing) {
                return;
            }
        }

        const lessonsChanged = JSON.stringify(updatedLessons) !== JSON.stringify(lessons);
        if (!lessonsChanged) {
            return;
        }

        setLessons(updatedLessons);

        // Остальная логика валидации ошибок...
        setErrors(prevErrors => {
            if (!prevErrors.lessons || updatedLessons.length === 0) return prevErrors;

            const invalidLessons = updatedLessons.filter(lesson =>
                !lesson.title || !lesson.title.trim() ||
                !lesson.content || !lesson.content.trim()
            );

            if (invalidLessons.length === 0) {
                const { lessons: _, ...restErrors } = prevErrors;
                return restErrors;
            }

            return prevErrors;
        });
    }, [lessons, mode]);

    // Функция для сохранения данных курса перед переходом к редактору сцен
    const saveCourseDataToStorage = useCallback(async () => {
        try {
            setIsSaving(true);

            const courseToSave = {
                title: course.title || '',
                description: course.description || '',
                longDescription: course.longDescription || '',
                difficulty: course.difficulty || '',
                category_id: course.category_id || ''
            };

            await saveCourseDataToDB(courseToSave, course.image, mode, courseId);
        } catch (error) {
            console.error('Error saving course data to IndexedDB:', error);
        } finally {
            setIsSaving(false);
        }
    }, [course, mode, courseId]);

    // Обработчик создания курса
    const handleCreateCourse = async () => {
        try {
            // Очищаем предыдущие ошибки перед отправкой
            setErrors(prev => ({ ...prev, submit: null }));

            // Формируем данные для отправки на сервер
            const courseData = {
                title: course.title,
                description: course.description,
                longDescription: course.longDescription,
                difficulty: course.difficulty,
                category_id: course.category_id,
                image: course.image
            };

            // Отправляем данные курса на сервер
            const response = await coursesApi.createCourse(courseData);

            if (response && response.id) {
                // Если есть уроки, создаем их для этого курса
                if (lessons.length > 0) {
                    const courseId = response.id;
                    // Отправляем уроки
                    await coursesApi.createManyLessons(courseId, lessons.map((lesson, index) => ({
                        title: lesson.title,
                        content: lesson.content,
                        order: lesson.order || index + 1,
                        scene_data: lesson.scene_data || null,
                        course_id: courseId
                    })));
                }

                // Очищаем данные после успешного создания курса
                await deleteCourseDataFromDB('create');
                await cleanupAllSceneData('create'); // Добавляем очистку данных сцен
                localStorage.removeItem('allLessonsBackup');
                localStorage.removeItem('currentEditingLesson');

                // Переходим на страницу созданного курса
                navigate(`/courses/${response.id}`);
            } else {
                // Или просто на список курсов
                navigate('/courses');
            }
        } catch (error) {
            setErrors({
                ...errors,
                submit: error.message || 'Произошла ошибка при создании курса. Пожалуйста, попробуйте снова.'
            });
        }
    };

    // Обработчик обновления курса
    const handleUpdateCourse = async () => {
        try {
            setErrors(prev => ({ ...prev, submit: null }));

            // Формируем данные для отправки на сервер
            const courseData = {
                title: course.title,
                description: course.description,
                longdescription: course.longDescription,
                difficulty: course.difficulty,
                category_ids: [parseInt(course.category_id)],
                image: course.image,
                remove_image: removeExistingImage // Добавляем флаг для удаления изображения
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
                            course_id: parseInt(courseId)
                        });
                    }
                }

                // Удаляем уроки, которые были удалены из формы
                const currentLessonIds = lessons.filter(l => l.id).map(l => l.id);
                const lessonsToDelete = existingLessonIds.filter(id => !currentLessonIds.includes(id));

                for (const lessonId of lessonsToDelete) {
                    await coursesApi.deleteLesson(courseId, lessonId);
                }

                // После успешного обновления курса
                // Очищаем данные после успешного обновления курса
                await deleteCourseDataFromDB('edit', courseId);
                await cleanupAllSceneData('edit', courseId); // Добавляем очистку данных сцен
                localStorage.removeItem('editAllLessonsBackup');
                localStorage.removeItem('editCurrentEditingLesson');

                // Переходим на страницу курса
                navigate(`/courses/${courseId}`);
            }
        } catch (error) {
            setErrors({
                ...errors,
                submit: error.message || 'Произошла ошибка при обновлении курса. Пожалуйста, попробуйте снова.'
            });
        }
    };

    // Обработчик отправки формы
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            if (mode === 'create') {
                await handleCreateCourse();
            } else {
                await handleUpdateCourse();
            }
        } finally {
            setLoading(false);
        }
    };

    // Возвращаем все необходимые значения и функции
    return {
        // Состояния
        course,
        setCourse,
        errors,
        loading,
        initialLoading,
        categories,
        lessons,
        imagePreview,
        existingImageUrl,

        // Обработчики
        handleCourseChange,
        handleImageChange,
        handleRemoveImage,
        handleLessonsUpdate,
        handleSubmit,
        saveCourseDataToStorage,

        // Утилиты
        mode,
        courseId
    };
};