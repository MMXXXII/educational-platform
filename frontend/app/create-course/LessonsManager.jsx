import React, { useState, useCallback, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { PlusIcon, Bars3Icon } from "@heroicons/react/24/outline";
import LessonForm from './LessonForm';
import { useNavigate } from 'react-router';
import { loadSceneDataWithFallback, deleteSceneDataFromDB } from '../utils/indexedDB';

const LessonsManager = ({ initialLessons = [], courseId, onChange, onNavigateToEditor, isEditMode = false, errors = {} }) => {
    const [lessons, setLessons] = useState(initialLessons.map((lesson, idx) => ({
        ...lesson,
        order: lesson.order || idx + 1
    })));

    const navigate = useNavigate();
    const hasProcessedSceneData = useRef(false);
    const pendingLessonsUpdate = useRef(null);
    const isInitialRender = useRef(true);
    const isRestoringSceneData = useRef(false);

    const handleAddLesson = () => {
        const newLesson = {
            title: '',
            content: '',
            order: lessons.length + 1,
            scene_data: null
        };
        setLessons(prevLessons => [...prevLessons, newLesson]);
    };

    const handleUpdateLesson = useCallback((index, updatedLesson) => {
        setLessons(prevLessons => {
            const newLessons = [...prevLessons];
            newLessons[index] = updatedLesson;
            return newLessons;
        });
    }, []);

    useEffect(() => {
        if (isInitialRender.current) {
            isInitialRender.current = false;
            return;
        }

        if (isRestoringSceneData.current) {
            return;
        }

        if (onChange && lessons.length > 0) {
            onChange(lessons);
        }
    }, [lessons, onChange]);

    const handleDeleteLesson = (index) => {
        // В режиме редактирования не позволяем удалить последний урок
        if (isEditMode && lessons.length <= 1) {
            return; // Не удаляем последний урок в режиме редактирования
        }

        setLessons(prevLessons => {
            const newLessons = prevLessons.filter((_, idx) => idx !== index)
                .map((lesson, idx) => ({
                    ...lesson,
                    order: idx + 1
                }));
            return newLessons;
        });
    };

    const handleCreateScene = (index, lesson) => {
        if (onNavigateToEditor) {
            onNavigateToEditor();
        }

        hasProcessedSceneData.current = false;

        const backupKey = isEditMode ? 'editAllLessonsBackup' : 'allLessonsBackup';
        const lessonsToSave = [...lessons];
        localStorage.setItem(backupKey, JSON.stringify(lessonsToSave));

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
        localStorage.removeItem('savedSceneData');

        navigate('/tile-editor-scene');
    };

    const processSceneData = useCallback(async () => {
        if (hasProcessedSceneData.current) {
            return;
        }

        const editingLessonKey = isEditMode ? 'editCurrentEditingLesson' : 'currentEditingLesson';
        const lessonsBackupKey = isEditMode ? 'editAllLessonsBackup' : 'allLessonsBackup';

        const editingLessonData = localStorage.getItem(editingLessonKey);
        const lessonsBackup = localStorage.getItem(lessonsBackupKey);

        if (!editingLessonData) {
            return;
        }

        try {
            isRestoringSceneData.current = true;
            const editingLesson = JSON.parse(editingLessonData);

            if (editingLesson.isEditMode !== isEditMode) {
                isRestoringSceneData.current = false;
                return;
            }

            const lessonIndex = editingLesson.lessonIndex;
            const mode = isEditMode ? 'edit' : 'create';
            const courseId = editingLesson.courseId;

            const sceneData = await loadSceneDataWithFallback(lessonIndex, mode, courseId);

            let lessonsToUpdate = [];

            if (lessonsBackup) {
                try {
                    lessonsToUpdate = JSON.parse(lessonsBackup);
                } catch (e) {
                    isRestoringSceneData.current = false;
                    return;
                }
            } else {
                lessonsToUpdate = [...lessons];
            }

            if (typeof editingLesson.lessonIndex === 'number' &&
                editingLesson.lessonIndex >= 0 &&
                editingLesson.lessonIndex < lessonsToUpdate.length) {

                const updatedLessons = [...lessonsToUpdate];

                if (sceneData) {
                    updatedLessons[editingLesson.lessonIndex] = {
                        ...updatedLessons[editingLesson.lessonIndex],
                        scene_data: JSON.stringify(sceneData)
                    };
                }

                setLessons(updatedLessons);

                if (onChange) {
                    onChange(updatedLessons);
                }
            } else {
                setLessons(lessonsToUpdate);

                if (onChange) {
                    onChange(lessonsToUpdate);
                }
            }

            hasProcessedSceneData.current = true;

            if (sceneData) {
                await deleteSceneDataFromDB(lessonIndex, mode, courseId);
            }

            localStorage.removeItem('savedSceneData');
            localStorage.removeItem(editingLessonKey);
            localStorage.removeItem(lessonsBackupKey);

        } catch (error) {
            if (lessonsBackup) {
                try {
                    const lessonsToUpdate = JSON.parse(lessonsBackup);
                    setLessons(lessonsToUpdate);
                    if (onChange) {
                        onChange(lessonsToUpdate);
                    }
                } catch (e) {
                    // Пустое действие при ошибке
                }
            }

            localStorage.removeItem('savedSceneData');
            localStorage.removeItem(editingLessonKey);
            localStorage.removeItem(lessonsBackupKey);

            hasProcessedSceneData.current = true;
        } finally {
            isRestoringSceneData.current = false;
        }
    }, [isEditMode, lessons, onChange]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            processSceneData();
        }, 100);

        return () => clearTimeout(timeoutId);
    }, [processSceneData]);

    useEffect(() => {
        if (initialLessons.length > 0 &&
            !hasProcessedSceneData.current &&
            !isRestoringSceneData.current) {

            const formattedLessons = initialLessons.map((lesson, idx) => ({
                ...lesson,
                order: lesson.order || idx + 1
            }));

            const lessonsChanged = JSON.stringify(formattedLessons) !== JSON.stringify(lessons);

            if (lessonsChanged) {
                setLessons(formattedLessons);
            }
        }
    }, [initialLessons]);

    const onDragEnd = (result) => {
        if (!result.destination) {
            return;
        }

        const reorderedLessons = reorderLessons(
            lessons,
            result.source.index,
            result.destination.index
        );

        setLessons(reorderedLessons);
    };

    const reorderLessons = (list, startIndex, endIndex) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);

        return result.map((item, index) => ({
            ...item,
            order: index + 1
        }));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Уроки ({lessons.length})</h3>
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
                                                <Bars3Icon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                            </div>
                                            <LessonForm
                                                lesson={lesson}
                                                index={index}
                                                onUpdate={handleUpdateLesson}
                                                onDelete={handleDeleteLesson}
                                                onCreateScene={handleCreateScene}
                                                canDelete={!(isEditMode && lessons.length <= 1)}
                                                errors={errors}
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
                <div className="text-center py-10 border-2 border-dashed rounded-lg text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700">
                    <p className="text-muted-foreground">Пока нет уроков. Нажмите "Добавить урок", чтобы создать первый урок.</p>
                </div>
            )}
        </div>
    );
};

export default LessonsManager;