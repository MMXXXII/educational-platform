import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { categoriesApi, coursesApi } from '../api/coursesService';

export const useCourseForm = (mode = 'create', courseId = null) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(mode === 'edit');
    const [categories, setCategories] = useState([]);
    const [lessons, setLessons] = useState([]);
    const [imagePreview, setImagePreview] = useState(null);
    const [existingImageUrl, setExistingImageUrl] = useState(null);
    const hasRestoredFromLocalStorage = useRef(false);

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
                setCategories([]);
            }
        };

        fetchCategories();
    }, []);

    // Восстановление данных из localStorage для режима создания
    useEffect(() => {
        if (mode !== 'create' || hasRestoredFromLocalStorage.current) return;

        const savedCourseData = localStorage.getItem('courseFormBackup');
        if (!savedCourseData) return;

        try {
            const parsedCourseData = JSON.parse(savedCourseData);
            setCourse(parsedCourseData.course);

            if (parsedCourseData.imagePreview) {
                setImagePreview(parsedCourseData.imagePreview);
            }

            localStorage.removeItem('courseFormBackup');
            hasRestoredFromLocalStorage.current = true;
        } catch (error) {
            localStorage.removeItem('courseFormBackup');
        }
    }, [mode]);

    // Восстановление данных из localStorage для режима редактирования
    useEffect(() => {
        if (mode !== 'edit' || !courseId || hasRestoredFromLocalStorage.current) return;

        const savedEditCourseData = localStorage.getItem('editCourseFormBackup');
        if (!savedEditCourseData) return;

        try {
            const parsedCourseData = JSON.parse(savedEditCourseData);
            if (parsedCourseData.courseId !== courseId) return;

            setCourse(parsedCourseData.course);

            if (parsedCourseData.imagePreview) {
                setImagePreview(parsedCourseData.imagePreview);
            }

            if (parsedCourseData.existingImageUrl) {
                setExistingImageUrl(parsedCourseData.existingImageUrl);
            }

            localStorage.removeItem('editCourseFormBackup');
            setInitialLoading(false);
            hasRestoredFromLocalStorage.current = true;
        } catch (error) {
            localStorage.removeItem('editCourseFormBackup');
        }
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
        setCourse(prevCourse => {
            if (imagePreview) {
                return { ...prevCourse, image: null };
            }
            return prevCourse;
        });
        if (!imagePreview) {
            setExistingImageUrl(null);
        }
    }, [imagePreview]);

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
        setLessons(updatedLessons);

        // Если была ошибка с уроками, проверяем, можно ли её снять
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
    }, []);

    // Функция для сохранения данных курса перед переходом к редактору сцен
    const saveCourseDataToLocalStorage = useCallback(() => {
        // Сохраняем текущее состояние курса, а не начальное
        const courseBackupData = {
            course: {
                ...course,
                // Убеждаемся, что все поля сохранены
                title: course.title,
                description: course.description,
                longDescription: course.longDescription,
                difficulty: course.difficulty,
                category_id: course.category_id,
                image: course.image
            },
            imagePreview: imagePreview,
            ...(mode === 'edit' && {
                existingImageUrl: existingImageUrl,
                courseId: courseId
            })
        };

        const storageKey = mode === 'create' ? 'courseFormBackup' : 'editCourseFormBackup';
        localStorage.setItem(storageKey, JSON.stringify(courseBackupData));
    }, [course, imagePreview, existingImageUrl, mode, courseId]);

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

                // Очищаем localStorage после успешного создания курса
                localStorage.removeItem('courseFormBackup');
                localStorage.removeItem('allLessonsBackup');
                localStorage.removeItem('currentEditingLesson');
                localStorage.removeItem('savedSceneData');

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
                // Очищаем localStorage после успешного обновления курса
                localStorage.removeItem('editCourseFormBackup');
                localStorage.removeItem('editAllLessonsBackup');
                localStorage.removeItem('editCurrentEditingLesson');
                localStorage.removeItem('savedSceneData');

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
        saveCourseDataToLocalStorage,

        // Утилиты
        mode,
        courseId
    };
};