import React, { useState, useEffect } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { Link } from 'react-router';
import { CheckIcon, FolderOpenIcon, PlusCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import ConstructorPanel from './ConstructorPanel';
import FlowCanvas from './FlowCanvas';
import { useEditor } from '../contexts/EditorContext';

/**
 * Страница редактора логических структур
 */
export function NodeEditor() {
    const [isMounted, setIsMounted] = useState(false);
    const {
        projectName,
        isModified,
        saveProject,
        createNewProject,
        loadProject,
        projectsList
    } = useEditor();

    // Отдельные состояния для разных модальных окон
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showOpenModal, setShowOpenModal] = useState(false);
    const [newProjectName, setNewProjectName] = useState("");

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Обработчик создания нового проекта
    const handleCreateProject = () => {
        if (newProjectName.trim()) {
            createNewProject(newProjectName.trim());
            setNewProjectName("");
            setShowCreateModal(false);
        }
    };

    // Обработчик нажатия клавиши Enter в поле ввода
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleCreateProject();
        }
    };

    return (
        <div className="w-full h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            <nav className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700">
                <div className="w-full px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center space-x-4">
                            {/* Лого как в header.jsx */}
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
                            {/* Кнопка сохранения (только когда есть проект) */}
                            {projectName && (
                                <button
                                    className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center ${isModified
                                            ? 'bg-green-500 hover:bg-green-600'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                        } text-white shadow-sm hover:shadow`}
                                    onClick={saveProject}
                                >
                                    <CheckIcon className="h-5 w-5 mr-1.5" />
                                    Сохранить
                                </button>
                            )}

                            {/* Кнопка создания (всегда видна) */}
                            <button
                                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-all duration-200 flex items-center shadow-sm hover:shadow"
                                onClick={() => setShowCreateModal(true)}
                            >
                                <PlusCircleIcon className="h-5 w-5 mr-1.5" />
                                Создать проект
                            </button>

                            {/* Кнопка загрузки проекта (всегда видна) */}
                            <button
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 flex items-center shadow-sm hover:shadow"
                                onClick={() => setShowOpenModal(true)}
                            >
                                <FolderOpenIcon className="h-5 w-5 mr-1.5" />
                                Открыть проект
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Модальное окно для создания нового проекта */}
            {showCreateModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowCreateModal(false);
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
                                        value={newProjectName}
                                        onChange={(e) => setNewProjectName(e.target.value)}
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
                                className={`w-full sm:w-auto sm:ml-3 inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 ${newProjectName.trim()
                                        ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
                                    } focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm`}
                                onClick={handleCreateProject}
                                disabled={!newProjectName.trim()}
                            >
                                Создать
                            </button>
                            <button
                                type="button"
                                className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                                onClick={() => setShowCreateModal(false)}
                            >
                                <XMarkIcon className="h-5 w-5 mr-1" />
                                Отмена
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Модальное окно для открытия существующего проекта */}
            {showOpenModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowOpenModal(false);
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
                                <FolderOpenIcon className="h-5 w-5 text-blue-500 mr-2" />
                                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                                    Выберите проект
                                </h3>
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
                                                            onClick={() => {
                                                                loadProject(name);
                                                                setShowOpenModal(false);
                                                            }}
                                                            className="w-full text-left px-3 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 flex items-center transition-colors"
                                                        >
                                                            <FolderOpenIcon className="h-5 w-5 mr-3 text-blue-500" />
                                                            <span className="font-medium">{name}</span>
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
                                onClick={() => setShowOpenModal(false)}
                            >
                                <XMarkIcon className="h-5 w-5 mr-1" />
                                Закрыть
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex w-full h-[calc(100vh-4rem)]">
                {isMounted && (
                    <ReactFlowProvider>
                        <ConstructorPanel />
                        <FlowCanvas />
                    </ReactFlowProvider>
                )}
            </div>
        </div>
    );
};