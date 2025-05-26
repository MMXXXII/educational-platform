import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
// Импорт по умолчанию, поскольку компонент экспортируется как default
import EditorPanel from './EditorPanel';
import { saveSceneDataToDB, deleteSceneDataFromDB } from '../utils/indexedDB';

// Этот компонент связывает создание урока и редактор сцены
// Спроектирован так, чтобы минимально влиять на EditorPanel.jsx
const TileEditorPage = () => {
    const [lessonData, setLessonData] = useState(null);
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const [initialSceneData, setInitialSceneData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const hasSaved = useRef(false); // Флаг для предотвращения повторного сохранения

    // Получаем данные урока при монтировании компонента
    useEffect(() => {
        // Проверяем оба возможных ключа: для создания и для редактирования
        let editingLessonData = localStorage.getItem('currentEditingLesson') ||
            localStorage.getItem('editCurrentEditingLesson');

        if (!editingLessonData) {
            // Если нет данных о редактируемом уроке, возвращаемся обратно
            navigate(-1); // Возвращаемся на предыдущую страницу
            return;
        }

        try {
            const data = JSON.parse(editingLessonData);
            setLessonData(data);

            // Если есть существующие данные сцены, загружаем их
            if (data.lesson && data.lesson.scene_data) {
                try {
                    let sceneData = data.lesson.scene_data;
                    // Обрабатываем и строковый, и объектный форматы
                    if (typeof sceneData === 'string') {
                        sceneData = JSON.parse(sceneData);
                    }
                    setInitialSceneData(sceneData);
                } catch (e) {
                    console.error("Error parsing existing scene data:", e);
                }
            }
        } catch (error) {
            console.error("Error parsing lesson data:", error);
            navigate(-1);
            return;
        }

        setIsLoading(false);
    }, [navigate]);

    // Сохраняем сцену и возвращаемся к созданию/редактированию курса
    const handleSaveScene = async () => {
        if (hasSaved.current) {
            return;
        }

        try {
            setIsLoading(true);

            let sceneData = null;

            // Способ 1: Пытаемся использовать глобальный currentSceneInstance.serializeScene
            if (window.currentSceneInstance && window.currentSceneInstance.serializeScene) {
                sceneData = window.currentSceneInstance.serializeScene();
            }
            // Способ 2: Пытаемся использовать статический метод, если доступен
            else if (typeof EditorPanel.exportScene === 'function') {
                sceneData = EditorPanel.exportScene();
            }

            // Сохраняем данные сцены
            if (sceneData !== undefined) {
                const dataToSave = sceneData || {
                    version: "1.0",
                    timestamp: Date.now(),
                    models: []
                };

                // Проверяем, что у нас есть все необходимые данные
                if (!lessonData) {
                    throw new Error('Missing lesson data for scene save');
                }

                // Извлекаем все необходимые данные
                const lessonIndex = lessonData.lessonIndex;
                const mode = lessonData.isEditMode ? 'edit' : 'create';
                const courseId = lessonData.courseId;

                console.log(`Saving scene data for lesson index ${lessonIndex}, mode: ${mode}, courseId: ${courseId}`);

                // Сохраняем в IndexedDB вместо localStorage
                const saved = await saveSceneDataToDB(dataToSave, lessonIndex, mode, courseId);

                if (!saved) {
                    // Fallback к localStorage если IndexedDB недоступен
                    localStorage.setItem('savedSceneData', JSON.stringify(dataToSave));
                    console.warn('Fallback: Scene data saved to localStorage');
                } else {
                    console.log('Scene data successfully saved to IndexedDB');
                }

                // Добавляем небольшую задержку перед навигацией
                await new Promise(resolve => setTimeout(resolve, 150));

                hasSaved.current = true;

                // Определяем, куда возвращаться на основе lessonData
                if (lessonData && lessonData.isEditMode && lessonData.courseId) {
                    navigate(`/edit-course/${lessonData.courseId}`);
                } else {
                    navigate('/create-course');
                }
            } else {
                throw new Error('Could not access scene data from EditorPanel');
            }

        } catch (error) {
            console.error("Error saving scene:", error);
            alert("Ошибка при сохранении сцены. Пожалуйста, попробуйте еще раз.");
        } finally {
            setIsLoading(false);
        }
    };

    // Выход без сохранения
    const handleExit = () => {
        setShowExitConfirm(true);
    };

    const confirmExit = async () => {
        // Очищаем данные сцены при выходе без сохранения
        const lessonIndex = lessonData?.lessonIndex || null;
        const mode = lessonData?.isEditMode ? 'edit' : 'create';
        const courseId = lessonData?.courseId || null;

        await deleteSceneDataFromDB(lessonIndex, mode, courseId);

        // Также очищаем localStorage для обратной совместимости
        localStorage.removeItem('savedSceneData');

        // Определяем, куда возвращаться
        if (lessonData && lessonData.isEditMode && lessonData.courseId) {
            navigate(`/edit-course/${lessonData.courseId}`);
        } else {
            navigate('/create-course');
        }
    };

    const cancelExit = () => {
        setShowExitConfirm(false);
    };

    // Показываем загрузку во время инициализации
    if (isLoading && !lessonData) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Загрузка редактора...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 flex flex-col overflow-hidden">
            {/* Шапка зафиксирована сверху с z-index, чтобы оставаться поверх другого контента */}
            <header className="bg-white border-b border-gray-200 p-3 shadow-sm z-10 flex-shrink-0">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center min-w-0 flex-1">
                        <button
                            onClick={handleExit}
                            className="mr-4 p-2 rounded-full hover:bg-gray-100 flex-shrink-0"
                            disabled={isLoading}
                        >
                            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
                        </button>
                        <h1 className="font-bold text-xl truncate text-gray-800">
                            {lessonData ?
                                `Создание сцены для урока: ${lessonData.lesson.title || 'Новый урок'}` :
                                'Редактор сцены'
                            }
                        </h1>
                    </div>
                    <button
                        onClick={handleSaveScene}
                        disabled={isLoading}
                        className={`px-4 py-2 rounded-md flex items-center flex-shrink-0 ml-4 ${isLoading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700'
                            } text-white`}
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Сохранение...
                            </>
                        ) : (
                            <>
                                <CheckIcon className="h-5 w-5 mr-1" />
                                Сохранить и вернуться
                            </>
                        )}
                    </button>
                </div>
            </header>

            {/* Контент редактора - занимает всё оставшееся место */}
            <div className="flex-grow overflow-hidden">
                <EditorPanel
                    initialSceneData={initialSceneData}
                    className="w-full h-full"
                />
            </div>

            {/* Модальное окно подтверждения выхода */}
            {showExitConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md mx-auto m-4">
                        <h3 className="text-lg font-medium text-gray-800 mb-4">Выйти без сохранения?</h3>
                        <p className="text-gray-600 mb-6">
                            Все несохраненные изменения будут потеряны. Вы уверены, что хотите выйти?
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={cancelExit}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={confirmExit}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                            >
                                Выйти без сохранения
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TileEditorPage;