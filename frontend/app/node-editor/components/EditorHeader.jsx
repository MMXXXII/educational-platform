import React from 'react';
import { Link } from 'react-router';
import {
    CheckIcon,
    FolderOpenIcon,
    PlusCircleIcon,
} from '@heroicons/react/24/outline';

/**
 * Компонент верхней панели редактора нодов
 * 
 * @param {Object} props - Свойства компонента
 * @param {string} props.projectName - Название текущего проекта
 * @param {boolean} props.isModified - Флаг изменения проекта
 * @param {Function} props.onSave - Обработчик сохранения проекта
 * @param {Function} props.onNew - Обработчик создания нового проекта
 * @param {Function} props.onOpen - Обработчик открытия проекта
 */
const EditorHeader = ({
    projectName,
    isModified,
    onSave,
    onNew,
    onOpen
}) => {
    return (
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

                        {/* Кнопка создания (всегда видна) */}
                        <button
                            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-all duration-200 flex items-center shadow-sm hover:shadow"
                            onClick={onNew}
                        >
                            <PlusCircleIcon className="h-5 w-5 mr-1.5" />
                            Создать проект
                        </button>

                        {/* Кнопка загрузки проекта (всегда видна) */}
                        <button
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 flex items-center shadow-sm hover:shadow"
                            onClick={onOpen}
                        >
                            <FolderOpenIcon className="h-5 w-5 mr-1.5" />
                            Открыть проект
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default EditorHeader;