import React, { useState, useCallback, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { PlusIcon, Bars3Icon } from "@heroicons/react/24/outline";
import LessonForm from './LessonForm';
import { useNavigate } from 'react-router';

const LessonsManager = ({ initialLessons = [], courseId, onChange, onNavigateToEditor, isEditMode = false }) => {
    const [lessons, setLessons] = useState(initialLessons.map((lesson, idx) => ({
        ...lesson,
        order: lesson.order || idx + 1
    })));

    const navigate = useNavigate();
    const hasProcessedSceneData = useRef(false); // Флаг для предотвращения повторной обработки
    const pendingLessonsUpdate = useRef(null); // Для хранения отложенных обновлений

    const handleAddLesson = () => {
        const newLesson = {
            title: '',
            content: '',
            order: lessons.length + 1,
            scene_data: null
        };
        const updatedLessons = [...lessons, newLesson];
        setLessons(updatedLessons);
        if (onChange) onChange(updatedLessons);
    };

    const handleUpdateLesson = useCallback((index, updatedLesson) => {
        setLessons(prevLessons => {
            const newLessons = [...prevLessons];
            newLessons[index] = updatedLesson;
            if (onChange) onChange(newLessons);
            return newLessons;
        });
    }, [onChange]);

    const handleDeleteLesson = (index) => {
        const newLessons = lessons.filter((_, idx) => idx !== index)
            .map((lesson, idx) => ({
                ...lesson,
                order: idx + 1
            }));
        setLessons(newLessons);
        if (onChange) onChange(newLessons);
    };

    const handleCreateScene = (index, lesson) => {
        // Вызываем функцию сохранения данных курса из родительского компонента
        if (onNavigateToEditor) {
            onNavigateToEditor();
        }

        // Сбрасываем флаг перед переходом
        hasProcessedSceneData.current = false;

        // Сохраняем все текущие уроки перед переходом
        const backupKey = isEditMode ? 'editAllLessonsBackup' : 'allLessonsBackup';
        const lessonsToSave = [...lessons]; // Создаем копию массива
        localStorage.setItem(backupKey, JSON.stringify(lessonsToSave));

        // Сохраняем данные для редактирования конкретного урока
        const editingLessonKey = isEditMode ? 'editCurrentEditingLesson' : 'currentEditingLesson';
        const dataToSave = {
            lessonIndex: index,
            courseId: courseId,
            lesson: {
                ...lesson,
                title: lesson.title || '',
                content: lesson.content || '',
                scene_data: lesson.scene_data
            },
            isEditMode: isEditMode
        };

        localStorage.setItem(editingLessonKey, JSON.stringify(dataToSave));

        // Очищаем любые предыдущие сохраненные данные сцены
        localStorage.removeItem('savedSceneData');

        // Переходим к редактору сцен
        navigate('/tile-editor-scene');
    };

    // Отдельная функция для обработки данных сцены, не зависит от рендеринга
    const processSceneData = useCallback(() => {
        const savedSceneData = localStorage.getItem('savedSceneData');
        const editingLessonKey = isEditMode ? 'editCurrentEditingLesson' : 'currentEditingLesson';
        const lessonsBackupKey = isEditMode ? 'editAllLessonsBackup' : 'allLessonsBackup';

        const editingLessonData = localStorage.getItem(editingLessonKey);
        const lessonsBackup = localStorage.getItem(lessonsBackupKey);

        if (savedSceneData && editingLessonData) {
            try {
                const sceneData = JSON.parse(savedSceneData);
                const editingLesson = JSON.parse(editingLessonData);

                // Проверяем, что это данные для текущего режима
                if (editingLesson.isEditMode === isEditMode) {
                    // Восстанавливаем все уроки из бэкапа или используем текущие
                    let lessonsToUpdate = lessons;
                    if (lessonsBackup) {
                        try {
                            lessonsToUpdate = JSON.parse(lessonsBackup);
                        } catch (e) {
                            console.error('Error parsing lessons backup:', e);
                        }
                    }

                    if (typeof editingLesson.lessonIndex === 'number' &&
                        editingLesson.lessonIndex >= 0 &&
                        editingLesson.lessonIndex < lessonsToUpdate.length) {

                        // Создаем копию массива уроков
                        const updatedLessons = [...lessonsToUpdate];

                        // Обновляем конкретный урок с данными сцены
                        updatedLessons[editingLesson.lessonIndex] = {
                            ...updatedLessons[editingLesson.lessonIndex],
                            scene_data: JSON.stringify(sceneData)
                        };

                        // Сохраняем для последующего обновления в useEffect
                        pendingLessonsUpdate.current = updatedLessons;
                    }

                    // Очищаем данные из localStorage после успешной обработки
                    localStorage.removeItem('savedSceneData');
                    localStorage.removeItem(editingLessonKey);
                    localStorage.removeItem(lessonsBackupKey);

                    // Устанавливаем флаг, что обработка завершена
                    hasProcessedSceneData.current = true;
                }
            } catch (error) {
                console.error('Error processing scene data:', error);
                // В случае ошибки также очищаем localStorage
                localStorage.removeItem('savedSceneData');
                localStorage.removeItem(editingLessonKey);
                localStorage.removeItem(lessonsBackupKey);
            }
        }
    }, [isEditMode, lessons]);

    // Обработка возврата из редактора сцен
    useEffect(() => {
        // Обрабатываем данные сцены при монтировании
        processSceneData();

        // Также проверяем с небольшой задержкой, на случай если данные еще не успели сохраниться
        const timeoutId = setTimeout(() => {
            processSceneData();
        }, 100);

        return () => clearTimeout(timeoutId);
    }, [processSceneData]);

    // Отдельный эффект для применения отложенных обновлений
    useEffect(() => {
        if (pendingLessonsUpdate.current) {
            const updatedLessons = pendingLessonsUpdate.current;
            setLessons(updatedLessons);

            // Вызываем onChange после обновления состояния
            if (onChange) {
                onChange(updatedLessons);
            }

            // Очищаем отложенное обновление
            pendingLessonsUpdate.current = null;
        }
    }, [onChange]);

    // Синхронизация с initialLessons
    useEffect(() => {
        // Обновляем уроки только если:
        // 1. Есть начальные уроки
        // 2. Мы не обрабатываем данные сцены
        // 3. Текущие уроки пустые или это первая загрузка
        if (initialLessons.length > 0 && !hasProcessedSceneData.current) {
            const formattedLessons = initialLessons.map((lesson, idx) => ({
                ...lesson,
                order: lesson.order || idx + 1
            }));

            // Проверяем, изменились ли уроки
            const lessonsChanged = JSON.stringify(formattedLessons) !== JSON.stringify(lessons);

            if (lessonsChanged) {
                setLessons(formattedLessons);
            }
        }
    }, [initialLessons, lessons]);

    const onDragEnd = (result) => {
        // Перемещение за пределы списка
        if (!result.destination) {
            return;
        }

        const reorderedLessons = reorderLessons(
            lessons,
            result.source.index,
            result.destination.index
        );

        setLessons(reorderedLessons);
        if (onChange) onChange(reorderedLessons);
    };

    const reorderLessons = (list, startIndex, endIndex) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);

        // Обновляем свойство order для каждого урока
        return result.map((item, index) => ({
            ...item,
            order: index + 1
        }));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">Уроки ({lessons.length})</h3>
                <button
                    type="button"
                    onClick={handleAddLesson}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    <PlusIcon className="h-4 w-4" />
                    Добавить урок
                </button>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="lessons">
                    {(provided) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="space-y-4"
                        >
                            {lessons.map((lesson, index) => (
                                <Draggable key={`lesson-${index}`} draggableId={`lesson-${index}`} index={index}>
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            className="relative"
                                        >
                                            <div
                                                {...provided.dragHandleProps}
                                                className="absolute left-[-20px] top-[50%] transform translate-y-[-50%] cursor-move"
                                            >
                                                <Bars3Icon className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <LessonForm
                                                lesson={lesson}
                                                index={index}
                                                onUpdate={handleUpdateLesson}
                                                onDelete={() => handleDeleteLesson(index)}
                                                onCreateScene={() => handleCreateScene(index, lesson)}
                                            />
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

            {lessons.length === 0 && (
                <div className="text-center py-10 border-2 border-dashed rounded-lg text-gray-800">
                    <p className="text-muted-foreground">Пока нет уроков. Нажмите "Добавить урок", чтобы создать первый урок.</p>
                </div>
            )}
        </div>
    );
};

export default LessonsManager;