import React, { useState, useEffect } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { Link } from 'react-router';
import { ArrowLeftIcon, CheckIcon, FolderOpenIcon } from '@heroicons/react/24/outline';
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
    
    const [showProjectList, setShowProjectList] = useState(false);
    const [newProjectName, setNewProjectName] = useState("");

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Обработчик создания нового проекта
    const handleCreateProject = () => {
        if (newProjectName.trim()) {
            createNewProject(newProjectName.trim());
            setNewProjectName("");
        }
    };

    return (
        <div className="w-full h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            <nav className="bg-white dark:bg-gray-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link to="/" className="mr-4 text-blue-500 hover:text-blue-600">
                                <ArrowLeftIcon className="h-6 w-6" />
                            </Link>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                Визуальная среда программирования {projectName && `- ${projectName}`}
                                {isModified && <span className="ml-2 text-sm text-gray-500">*</span>}
                            </h1>
                        </div>
                        <div className="flex items-center">
                            <button
                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors mr-2 flex items-center"
                                onClick={() => {
                                    if (projectName) {
                                        saveProject();
                                    } else {
                                        setNewProjectName("");
                                        setShowProjectList(!showProjectList);
                                    }
                                }}
                            >
                                <CheckIcon className="h-5 w-5 mr-1" />
                                {projectName ? "Сохранить" : "Создать проект"}
                            </button>
                            <button
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors mr-2 flex items-center"
                                onClick={() => setShowProjectList(!showProjectList)}
                            >
                                <FolderOpenIcon className="h-5 w-5 mr-1" />
                                {showProjectList ? "Закрыть" : "Загрузить проект"}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Диалог с проектами */}
            {showProjectList && (
                <div className="absolute top-16 right-0 mt-2 mr-4 w-64 bg-white dark:bg-gray-800 rounded shadow-lg z-50 p-4">
                    <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">
                        {projectName ? "Проекты" : "Новый проект"}
                    </h3>
                    {!projectName && (
                        <div className="mb-4">
                            <input
                                type="text"
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                                placeholder="Имя проекта"
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                            <button
                                onClick={handleCreateProject}
                                className="mt-2 w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center justify-center"
                            >
                                <CheckIcon className="h-5 w-5 mr-1" />
                                Создать
                            </button>
                        </div>
                    )}
                    {projectsList.length > 0 ? (
                        <ul className="space-y-1">
                            {projectsList.map((name) => (
                                <li key={name}>
                                    <button
                                        onClick={() => {
                                            loadProject(name);
                                            setShowProjectList(false);
                                        }}
                                        className="w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-800 dark:text-gray-200 flex items-center"
                                    >
                                        <FolderOpenIcon className="h-4 w-4 mr-2" />
                                        {name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">Нет сохраненных проектов</p>
                    )}
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