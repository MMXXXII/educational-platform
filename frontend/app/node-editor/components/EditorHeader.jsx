import React, { useState, useCallback } from 'react';
import { Link } from 'react-router';
import {
    CheckIcon
} from '@heroicons/react/24/outline';
import { useEditor } from '../../contexts/EditorContext';
import ProjectManagerButton from './ProjectManagerButton';
import ProjectManagerModal from './ProjectManagerModal';

/**
 * Компонент верхней панели редактора нодов
 * 
 * @param {Object} props - Свойства компонента
 * @param {string} props.projectName - Название текущего проекта
 * @param {boolean} props.isModified - Флаг изменения проекта
 * @param {Function} props.onSave - Обработчик сохранения проекта
 */
const EditorHeader = ({
    projectName,
    isModified,
    onSave
}) => {
    const { refreshProjectsList } = useEditor();
    
    // Состояние для модального окна менеджера проектов
    const [isProjectManagerOpen, setIsProjectManagerOpen] = useState(false);
    
    // Обработчик закрытия менеджера проектов
    const handleProjectManagerClose = useCallback(() => {
        setIsProjectManagerOpen(false);
        // Обновляем список проектов после закрытия менеджера
        refreshProjectsList();
    }, [refreshProjectsList]);

    return (
        <>
            <nav className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700">
                <div className="w-full px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center space-x-4">
                            {/* Лого и ссылка на главную */}
                            <Link to="/" className="text-xl sm:text-2xl font-bold text-blue-600 hover:text-blue-700 flex items-center">
                                EduPlatform
                            </Link>

                            {/* Вертикальный разделитель */}
                            <div className="h-8 w-px bg-gray-300 dark:bg-gray-600"></div>

                            {/* Название проекта и статус */}
                            <div className="flex items-center">
                                <h1 className="text-lg font-medium text-gray-800 dark:text-white flex items-center">
                                    {projectName ? (
                                        <>
                                            <span>{projectName}</span>
                                            {isModified && (
                                                <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100 text-xs font-medium rounded-full">
                                                    Не сохранено
                                                </span>
                                            )}
                                        </>
                                    ) : (
                                        <span className="text-gray-500 dark:text-gray-400 italic">Новый проект</span>
                                    )}
                                </h1>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            {/* Кнопка сохранения (всегда видна) */}
                            <button
                                className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center ${isModified
                                        ? 'bg-green-500 hover:bg-green-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                    } shadow-sm hover:shadow`}
                                onClick={onSave}
                            >
                                <CheckIcon className="h-5 w-5 mr-1.5" />
                                Сохранить
                            </button>

                            {/* Кнопка менеджера проектов */}
                            <ProjectManagerButton onClick={() => setIsProjectManagerOpen(true)} />
                        </div>
                    </div>
                </div>
            </nav>

            {/* Модальное окно менеджера проектов */}
            <ProjectManagerModal 
                isOpen={isProjectManagerOpen} 
                onClose={handleProjectManagerClose} 
            />
        </>
    );
};

export default EditorHeader;