import React, { useState, useEffect, useRef } from 'react';
import { TrashIcon, PencilIcon } from "@heroicons/react/24/outline";

const LessonForm = ({
    lesson,
    index,
    onUpdate,
    onDelete,
    onCreateScene
}) => {
    const [title, setTitle] = useState(lesson.title || '');
    const [content, setContent] = useState(lesson.content || '');
    const [hasScene, setHasScene] = useState(!!lesson.scene_data);

    // Используем ref для хранения предыдущих значений пропсов
    const prevLessonRef = useRef(lesson);

    // Обновляем локальное состояние только при действительном изменении пропсов
    useEffect(() => {
        const prevLesson = prevLessonRef.current;

        // Проверяем, действительно ли изменились данные урока
        const titleChanged = lesson.title !== prevLesson.title;
        const contentChanged = lesson.content !== prevLesson.content;
        const sceneDataChanged = lesson.scene_data !== prevLesson.scene_data;

        // Обновляем только если данные действительно изменились и не являются пустыми
        // (защита от случайного сброса данных)
        if (titleChanged && (lesson.title !== undefined && lesson.title !== null)) {
            setTitle(lesson.title || '');
        }

        if (contentChanged && (lesson.content !== undefined && lesson.content !== null)) {
            setContent(lesson.content || '');
        }

        if (sceneDataChanged) {
            setHasScene(!!lesson.scene_data);
        }

        // Сохраняем текущие значения пропсов для следующего сравнения
        prevLessonRef.current = lesson;
    }, [lesson.title, lesson.content, lesson.scene_data]);

    const handleTitleChange = (e) => {
        const newTitle = e.target.value;
        setTitle(newTitle);

        // Обновляем урок с сохранением всех существующих данных
        onUpdate(index, {
            ...lesson,
            title: newTitle,
            // Сохраняем текущие значения content, если они были изменены локально
            content: content || lesson.content || '',
            scene_data: lesson.scene_data
        });
    };

    const handleContentChange = (e) => {
        const newContent = e.target.value;
        setContent(newContent);

        // Обновляем урок с сохранением всех существующих данных
        onUpdate(index, {
            ...lesson,
            content: newContent,
            // Сохраняем текущие значения title, если они были изменены локально
            title: title || lesson.title || '',
            scene_data: lesson.scene_data
        });
    };

    const handleDeleteLesson = () => {
        onDelete(index);
    };

    const handleCreateScene = (e) => {
        // Предотвращаем отправку формы
        e.preventDefault();
        e.stopPropagation();

        // Передаем текущие локальные значения
        const currentLessonData = {
            ...lesson,
            title: title || lesson.title || '',
            content: content || lesson.content || '',
            scene_data: lesson.scene_data // Сохраняем существующие данные сцены
        };

        // Вызываем сохранение данных курса
        onCreateScene(index, currentLessonData);
    };

    return (
        <div className="mb-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 rounded-t-lg">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                        </span>
                        <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">Урок</span>
                        {hasScene && (
                            <span className="ml-2 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs rounded-full">
                                Сцена создана
                            </span>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={handleDeleteLesson}
                        className="p-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                        title="Удалить урок"
                    >
                        <TrashIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div className="px-6 py-2 space-y-4">
                <div className="space-y-2">
                    <label
                        htmlFor={`lesson-title-${index}`}
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        Заголовок урока
                    </label>
                    <input
                        id={`lesson-title-${index}`}
                        type="text"
                        placeholder="Введите название урока"
                        value={title}
                        onChange={handleTitleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-black dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500"
                    />
                </div>

                <div className="space-y-2">
                    <label
                        htmlFor={`lesson-content-${index}`}
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        Содержание (Теория/Задание)
                    </label>
                    <textarea
                        id={`lesson-content-${index}`}
                        placeholder="Введите содержание урока, теорию или задания..."
                        value={content}
                        onChange={handleContentChange}
                        rows={5}
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-black dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical placeholder-gray-400 dark:placeholder-gray-500"
                    />
                </div>
            </div>

            <div className="flex justify-end gap-2 px-6 py-2 bg-gray-50 dark:bg-gray-700 rounded-b-lg">
                <button
                    type="button"
                    onClick={handleCreateScene}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors cursor-pointer ${hasScene
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500"
                        }`}
                >
                    <PencilIcon className="h-4 w-4" />
                    {hasScene ? "Редактировать интерактивную сцену" : "Создать интерактивную сцену"}
                </button>
            </div>
        </div>
    );
};

export default LessonForm;