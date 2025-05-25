import { useState, useEffect } from 'react';
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
        if (mode !== 'edit' || !courseId) return;

        const fetchCourseData = async () => {
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
    }, [mode, courseId]);

    // Восстановление данных курса при возврате из редактора сцен
    useEffect(() => {
        const savedCourseData = localStorage.getItem('courseFormBackup');
        const savedEditCourseData = localStorage.getItem('editCourseFormBackup');

        if (mode === 'create') {
            // Проверяем, есть ли данные для восстановления (приоритет у режима создания)
            if (savedCourseData) {
                try {
                    const parsedCourseData = JSON.parse(savedCourseData);
                    setCourse(parsedCourseData.course);

                    // Восстанавливаем изображение только если есть превью URL
                    if (parsedCourseData.imagePreview) {
                        setImagePreview(parsedCourseData.imagePreview);
                    }

                    console.log('Данные курса восстановлены из localStorage');
                    // Очищаем сохраненные данные после восстановления
                    localStorage.removeItem('courseFormBackup');
                } catch (error) {
                    console.error('Ошибка при восстановлении данных курса:', error);
                    localStorage.removeItem('courseFormBackup');
                }
            } else if (savedEditCourseData) {
                // Если пользователь попал сюда из режима редактирования, перенаправляем его обратно
                try {
                    const parsedEditData = JSON.parse(savedEditCourseData);
                    if (parsedEditData.courseId) {
                        navigate(`/edit-course/${parsedEditData.courseId}`);
                        return;
                    }
                } catch (error) {
                    console.error('Ошибка при обработке данных редактирования:', error);
                    localStorage.removeItem('editCourseFormBackup');
                }
            }
        } else if (mode === 'edit' && savedEditCourseData) {
            try {
                const parsedCourseData = JSON.parse(savedEditCourseData);
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
    }, [mode, courseId, navigate]);

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

    // Обработчик удаления изображения
    const handleRemoveImage = () => {
        setImagePreview(null);
        if (imagePreview) {
            setCourse({ ...course, image: null });
        } else {
            setExistingImageUrl(null);
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
    };

    // Обработчик обновления уроков
    const handleLessonsUpdate = (updatedLessons) => {
        setLessons(updatedLessons);

        // Если была ошибка с уроками, проверяем, можно ли её снять
        if (errors.lessons && updatedLessons.length > 0) {
            setErrors({
                ...errors,
                lessons: null
            });
        }
    };

    // Функция для сохранения данных курса перед переходом к редактору сцен
    const saveCourseDataToLocalStorage = () => {
        const courseBackupData = {
            course: course,
            imagePreview: imagePreview,
            ...(mode === 'edit' && {
                existingImageUrl: existingImageUrl,
                courseId: courseId
            })
        };

        const storageKey = mode === 'create' ? 'courseFormBackup' : 'editCourseFormBackup';
        localStorage.setItem(storageKey, JSON.stringify(courseBackupData));
        console.log(`Данные курса сохранены в localStorage (${mode} mode)`);
    };

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
            console.error('Ошибка при создании курса:', error);
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

                // Переходим на страницу курса
                navigate(`/courses/${courseId}`);
            }
        } catch (error) {
            console.error('Ошибка при обновлении курса:', error);
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