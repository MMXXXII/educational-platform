import React from 'react';
import { FolderOpenIcon, XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

/**
 * Модальное окно для открытия существующего проекта
 * 
 * @param {Object} props - Свойства компонента
 * @param {boolean} props.isOpen - Открыто ли модальное окно
 * @param {Function} props.onClose - Функция закрытия модального окна
 * @param {Function} props.onOpen - Функция открытия проекта (принимает имя проекта)
 * @param {Function} props.onRefresh - Функция обновления списка проектов
 * @param {Array} props.projectsList - Массив имен существующих проектов
 */
const OpenProjectModal = ({ isOpen, onClose, onOpen, onRefresh, projectsList = [] }) => {
    // Если модальное окно не открыто, не рендерим его
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            {/* Полупрозрачный оверлей */}
            <div className="absolute inset-0 bg-gray-900/75"></div>

            <div
                className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-xl w-full max-w-md mx-4 z-50 relative"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <FolderOpenIcon className="h-5 w-5 text-blue-500 mr-2" />
                            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                                Выберите проект
                            </h3>
                        </div>

                        {/* Кнопка обновления списка */}
                        <button
                            className="ml-2 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
                            onClick={onRefresh}
                            title="Обновить список проектов"
                        >
                            <ArrowPathIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                        </button>
                    </div>

                    <div className="mt-4">
                        {projectsList.length > 0 ? (
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                                    Сохраненные проекты:
                                </h4>
                                <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md">
                                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {projectsList.map((name) => (
                                            <li key={name}>
                                                <button
                                                    onClick={() => onOpen(name)}
                                                    className="w-full text-left px-3 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 flex items-center justify-between transition-colors"
                                                >
                                                    <div className="flex items-center">
                                                        <FolderOpenIcon className="h-5 w-5 mr-3 text-blue-500" />
                                                        <span className="font-medium">{name}</span>
                                                    </div>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            <div className="py-6 text-center text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-750 rounded-lg">
                                Нет сохраненных проектов
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                        type="button"
                        className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                        onClick={onClose}
                    >
                        <XMarkIcon className="h-5 w-5 mr-1" />
                        Закрыть
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OpenProjectModal;