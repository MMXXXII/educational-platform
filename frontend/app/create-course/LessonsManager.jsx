import React, { useState, useCallback, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { PlusIcon, Bars3Icon } from "@heroicons/react/24/outline";
import LessonForm from './LessonForm';
import { useNavigate } from 'react-router';

const LessonsManager = ({ initialLessons = [], courseId, onChange, onNavigateToEditor }) => {
    const [lessons, setLessons] = useState(initialLessons.map((lesson, idx) => ({
        ...lesson,
        order: lesson.order || idx + 1
    })));

    const navigate = useNavigate();
    const hasProcessedSceneData = useRef(false); // Флаг для предотвращения повторной обработки

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

        // Сохраняем все текущие уроки перед переходом
        localStorage.setItem('allLessonsBackup', JSON.stringify(lessons));

        // Сохраняем данные для редактирования конкретного урока
        localStorage.setItem('currentEditingLesson', JSON.stringify({
            lessonIndex: index,
            courseId: courseId,
            lesson: lesson
        }));

        // Очищаем любые предыдущие сохраненные данные сцены, чтобы избежать путаницы
        localStorage.removeItem('savedSceneData');

        // Переходим к редактору сцен
        navigate('/tile-editor-scene');
    };

    // Обработка возврата из редактора сцен - только один раз при монтировании
    useEffect(() => {
        // Предотвращаем повторную обработку
        if (hasProcessedSceneData.current) {
            return;
        }

        const savedSceneData = localStorage.getItem('savedSceneData');
        const editingLessonData = localStorage.getItem('currentEditingLesson');
        const lessonsBackup = localStorage.getItem('allLessonsBackup');

        if (savedSceneData && editingLessonData) {
            try {
                const sceneData = JSON.parse(savedSceneData);
                const editingLesson = JSON.parse(editingLessonData);

                // Восстанавливаем все уроки из бэкапа
                let lessonsToRestore = lessons;
                if (lessonsBackup) {
                    lessonsToRestore = JSON.parse(lessonsBackup);
                }

                if (editingLesson && typeof editingLesson.lessonIndex === 'number') {
                    // Обновляем конкретный урок с данными сцены
                    const updatedLessons = [...lessonsToRestore];
                    if (updatedLessons[editingLesson.lessonIndex]) {
                        updatedLessons[editingLesson.lessonIndex] = {
                            ...updatedLessons[editingLesson.lessonIndex],
                            scene_data: JSON.stringify(sceneData)
                        };
                    }

                    setLessons(updatedLessons);
                    if (onChange) onChange(updatedLessons);
                }

                // Очищаем данные из localStorage (НЕ удаляем courseFormBackup - это сделается в CreateCoursePage)
                localStorage.removeItem('savedSceneData');
                localStorage.removeItem('currentEditingLesson');
                localStorage.removeItem('allLessonsBackup');

                // Отмечаем, что обработка завершена
                hasProcessedSceneData.current = true;
            } catch (error) {
                console.error('Error processing scene data:', error);
                // В случае ошибки также очищаем localStorage
                localStorage.removeItem('savedSceneData');
                localStorage.removeItem('currentEditingLesson');
                localStorage.removeItem('allLessonsBackup');
            }
        }
    }, []); // Пустой массив зависимостей - выполняется только при монтировании

    // Синхронизация с initialLessons (только если это не результат обработки сцены)
    useEffect(() => {
        if (!hasProcessedSceneData.current && initialLessons.length > 0) {
            const formattedLessons = initialLessons.map((lesson, idx) => ({
                ...lesson,
                order: lesson.order || idx + 1
            }));
            setLessons(formattedLessons);
        }
    }, [initialLessons]);

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
                                                onDelete={handleDeleteLesson}
                                                onCreateScene={handleCreateScene}
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