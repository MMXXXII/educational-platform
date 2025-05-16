import React, { useState } from 'react';
import { PlusCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

/**
 * Модальное окно для создания нового проекта
 * 
 * @param {Object} props - Свойства компонента
 * @param {boolean} props.isOpen - Открыто ли модальное окно
 * @param {Function} props.onClose - Функция закрытия модального окна
 * @param {Function} props.onCreate - Функция создания проекта (принимает имя проекта)
 * @param {Array} props.existingProjects - Массив имен существующих проектов для проверки на дубликаты
 */
const CreateProjectModal = ({ isOpen, onClose, onCreate, existingProjects = [] }) => {
    const [projectName, setProjectName] = useState('');

    // Обработчик нажатия клавиши Enter в поле ввода
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleCreate();
        }
    };

    // Обработчик создания проекта
    const handleCreate = () => {
        // Проверяем, что имя проекта не пустое
        if (!projectName || !projectName.trim()) {
            return; // Ничего не делаем, если имя пустое
        }
        
        if (projectName.trim()) {
            // Проверяем, существует ли уже проект с таким именем
            if (existingProjects.includes(projectName.trim())) {
                const confirmOverwrite = window.confirm(
                    `Проект с именем "${projectName}" уже существует. Перезаписать?`
                );
                if (!confirmOverwrite) {
                    return;
                }
            }

            // Вызываем функцию создания проекта
            onCreate(projectName.trim());
            setProjectName(''); // Сбрасываем имя проекта
        }
    };

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
                    <div className="flex items-center">
                        <PlusCircleIcon className="h-5 w-5 text-blue-500 mr-2" />
                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                            Создание нового проекта
                        </h3>
                    </div>

                    <div className="mt-4">
                        <div className="mb-5">
                            <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Имя проекта
                            </label>
                            <input
                                id="projectName"
                                type="text"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Введите имя проекта"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                autoFocus
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                        type="button"
                        className={`w-full sm:w-auto sm:ml-3 inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 ${projectName.trim()
                            ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
                            } focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm`}
                        onClick={handleCreate}
                        disabled={!projectName.trim()}
                    >
                        Создать
                    </button>
                    <button
                        type="button"
                        className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                        onClick={onClose}
                    >
                        <XMarkIcon className="h-5 w-5 mr-1" />
                        Отмена
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateProjectModal;