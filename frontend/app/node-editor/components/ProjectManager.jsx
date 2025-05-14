import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useEditor } from '../../contexts/EditorContext';
import { NotificationEvents } from '../NodeEditor';
import {
    FolderIcon,
    DocumentDuplicateIcon,
    TrashIcon,
    ArrowDownTrayIcon,
    PlusCircleIcon,
    CheckCircleIcon,
    ArrowPathIcon,
    InformationCircleIcon,
    ArrowUpTrayIcon
} from '@heroicons/react/24/outline';

/**
 * Показывает уведомление через глобальный сервис уведомлений
 * @param {string} message - Сообщение уведомления
 * @param {string} type - Тип уведомления ('success', 'error', 'warning', 'info')
 */
const showGlobalNotification = (message, type = 'info') => {
    if (NotificationEvents && NotificationEvents.notify) {
        NotificationEvents.notify(message, type);
    }
};

/**
 * Компонент менеджера проектов, предоставляющий расширенные функции по управлению проектами
 */
const ProjectManager = ({ onClose }) => {
    const {
        projectName,
        projectsList,
        projectVersions,
        saveProject,
        loadProject,
        deleteProject,
        exportProject,
        refreshProjectsList,
        createProjectVersion,
        loadProjectVersion,
        refreshVersionsList,
        createNewProject,
        importProject,
        deleteProjectVersion
    } = useEditor();

    // Состояние компонента
    const [activeTab, setActiveTab] = useState('projects');
    const [selectedProjects, setSelectedProjects] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');
    const [newVersionName, setNewVersionName] = useState('');
    const [versionComment, setVersionComment] = useState('');
    const [notification, setNotification] = useState(null);
    const [newProjectName, setNewProjectName] = useState('');
    const [currentProject, setCurrentProject] = useState(null);
    
    // Реф для инпута импорта файла
    const fileInputRef = useRef(null);

    // Загружаем информацию о текущем проекте
    const loadCurrentProjectInfo = useCallback(() => {
        if (projectName) {
            try {
                const projectKey = `nodeEditor_project_${projectName.trim()}`;
                const projectData = localStorage.getItem(projectKey);
                if (projectData) {
                    const project = JSON.parse(projectData);
                    setCurrentProject(project);
                    console.log("Загружена информация о проекте:", project);
                }
            } catch (error) {
                console.error("Ошибка при загрузке информации о текущем проекте:", error);
                setCurrentProject(null);
            }
        }
    }, [projectName]);

    // Загружаем список версий при открытии вкладки "Версии"
    useEffect(() => {
        if (activeTab === 'versions' && projectName) {
            refreshVersionsList();
            loadCurrentProjectInfo();
        }
    }, [activeTab, projectName, refreshVersionsList, loadCurrentProjectInfo]);

    // Обновляем информацию о проектах
    useEffect(() => {
        refreshProjectsList();
    }, [refreshProjectsList]);

    /**
     * Обработчик создания новой версии
     */
    const handleCreateVersion = () => {
        if (!newVersionName.trim()) {
            showNotification('Название версии не может быть пустым', 'warning');
            return;
        }

        const success = createProjectVersion(newVersionName.trim(), versionComment.trim());

        if (success) {
            showNotification(`Версия "${newVersionName}" успешно создана`, 'success');
            setNewVersionName('');
            setVersionComment('');
            refreshVersionsList();
            // Обновляем информацию о проекте после создания версии
            loadCurrentProjectInfo();
        } else {
            showNotification('Ошибка при создании версии', 'error');
        }
    };

    /**
     * Обработчик загрузки версии
     * @param {string} versionName - Название версии
     */
    const handleLoadVersion = (versionName) => {
        if (!versionName) return;

        const success = loadProjectVersion(versionName);

        if (success) {
            showNotification(`Версия "${versionName}" успешно загружена`, 'success');
            // Обновляем информацию о проекте, чтобы отразить новую текущую версию
            loadCurrentProjectInfo();
            
            if (onClose) {
                onClose();
            }
        } else {
            showNotification(`Ошибка при загрузке версии "${versionName}"`, 'error');
        }
    };

    /**
     * Обработчик удаления версии
     * @param {string} versionName - Название версии
     */
    const handleDeleteVersion = (versionName) => {
        if (!versionName) return;
        
        if (window.confirm(`Вы уверены, что хотите удалить версию "${versionName}"?`)) {
            const success = deleteProjectVersion(versionName);
            
            if (success) {
                showNotification(`Версия "${versionName}" успешно удалена`, 'success');
                refreshVersionsList();
                // Обновляем информацию о проекте
                loadCurrentProjectInfo();
            } else {
                showNotification(`Ошибка при удалении версии "${versionName}"`, 'error');
            }
        }
    };

    /**
     * Обработчик экспорта проекта
     */
    const handleExport = () => {
        const success = exportProject();

        if (success) {
            showNotification(`Проект успешно экспортирован в формате JSON`, 'success');
        } else {
            showNotification(`Ошибка при экспорте проекта`, 'error');
        }
    };

    /**
     * Обработчик выбора проекта
     * @param {string} projectName - Имя проекта
     */
    const handleSelectProject = (projectName) => {
        setSelectedProjects(prev => {
            if (prev.includes(projectName)) {
                return prev.filter(p => p !== projectName);
            } else {
                return [...prev, projectName];
            }
        });
    };

    /**
     * Обработчик загрузки выбранного проекта
     * @param {string} projectName - Имя проекта
     */
    const handleLoadProject = (projectName) => {
        const success = loadProject(projectName);

        if (success) {
            showNotification(`Проект "${projectName}" успешно загружен`, 'success');
            // Обновляем список проектов
            refreshProjectsList();
            // Закрываем модальное окно, если передан callback
            if (onClose) {
                onClose();
            }
        } else {
            showNotification(`Ошибка при загрузке проекта "${projectName}"`, 'error');
        }
    };

    /**
     * Обработчик удаления проекта
     * @param {string} projectName - Имя проекта
     */
    const handleDeleteProject = (projectName) => {
        if (window.confirm(`Вы уверены, что хотите удалить проект "${projectName}"?`)) {
            const success = deleteProject(projectName);

            if (success) {
                showNotification(`Проект "${projectName}" успешно удален`, 'success');
                setSelectedProjects(prev => prev.filter(p => p !== projectName));
                // Обновляем список проектов после удаления
                refreshProjectsList();
            } else {
                showNotification(`Ошибка при удалении проекта "${projectName}"`, 'error');
            }
        }
    };

    /**
     * Показывает уведомление
     * @param {string} message - Сообщение уведомления
     * @param {string} type - Тип уведомления ('success', 'error', 'warning', 'info')
     */
    const showNotification = (message, type = 'info') => {
        setNotification({ message, type });
        // Также отправляем уведомление в глобальный сервис
        showGlobalNotification(message, type);
    };

    /**
     * Обработчик нажатия на кнопку импорта
     */
    const handleImportButtonClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    /**
     * Обработчик изменения файлового инпута (выбора файла)
     */
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Проверяем формат файла (только JSON)
        const fileExtension = file.name.split('.').pop().toLowerCase();
        
        if (fileExtension !== 'json') {
            showNotification('Поддерживается только формат JSON', 'error');
            return;
        }

        try {
            const success = await importProject(file);
            
            if (success) {
                showNotification(`Проект "${file.name}" успешно импортирован`, 'success');
                // Обновляем список проектов
                refreshProjectsList();
                // Закрываем модальное окно, если передан callback
                if (onClose) {
                    onClose();
                }
            } else {
                showNotification('Ошибка при импорте проекта', 'error');
            }
        } catch (error) {
            showNotification(`Ошибка при импорте проекта: ${error.message}`, 'error');
        }

        // Сбрасываем значение файлового инпута для повторного выбора того же файла
        e.target.value = null;
    };

    /**
     * Фильтрует и сортирует проекты
     * @returns {Array} - Отфильтрованный и отсортированный список проектов
     */
    const getFilteredAndSortedProjects = () => {
        // Фильтрация по поиску
        const filtered = projectsList.filter(name => {
            const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSearch;
        });

        // Сортировка
        return filtered.sort((a, b) => {
            let comparison = 0;

            if (sortBy === 'name') {
                comparison = a.localeCompare(b);
            } else if (sortBy === 'date') {
                // Здесь можно добавить сортировку по дате, если это необходимо
                comparison = a.localeCompare(b);
            }

            return sortDirection === 'asc' ? comparison : -comparison;
        });
    };

    /**
     * Форматирует дату для отображения
     * @param {string} dateString - Строка даты в формате ISO
     * @returns {string} - Отформатированная дата
     */
    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleString();
        } catch (e) {
            return dateString || 'Неизвестная дата';
        }
    };

    /**
     * Обработчик создания нового проекта
     */
    const handleCreateNewProject = () => {
        if (!newProjectName.trim()) {
            showNotification('Имя проекта не может быть пустым', 'warning');
            return;
        }

        // Проверяем, существует ли уже проект с таким именем
        if (projectsList.includes(newProjectName.trim())) {
            showNotification(`Проект с именем "${newProjectName}" уже существует`, 'warning');
            return;
        }

        // Создаем новый проект
        const success = createNewProject(newProjectName.trim());

        if (success) {
            // Сразу же сохраняем проект в localStorage
            const saveSuccess = saveProject();

            if (saveSuccess) {
                showNotification(`Создан новый проект: ${newProjectName}`, 'success');
                setNewProjectName('');
                // Обновляем список проектов после сохранения
                refreshProjectsList();
                // Если нужно, закрываем модальное окно
                if (onClose) {
                    onClose();
                }
            } else {
                showNotification(`Проект создан, но не удалось сохранить его`, 'warning');
            }
        } else {
            showNotification('Ошибка при создании проекта', 'error');
        }
    };

    // Получаем отфильтрованные и отсортированные проекты
    const filteredProjects = getFilteredAndSortedProjects();

    return (
        <div className="project-manager bg-white dark:bg-gray-800 w-full">
            {/* Уведомление */}
            {notification && (
                <div
                    className={`mx-4 mt-2 p-3 rounded ${notification.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            notification.type === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }`}
                >
                    {notification.message}
                </div>
            )}

            {/* Вкладки */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                    className={`px-4 py-2 ${activeTab === 'projects' ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' : 'text-gray-600 dark:text-gray-400'}`}
                    onClick={() => setActiveTab('projects')}
                >
                    Проекты
                </button>
                {projectName && (
                    <>
                        <button
                            className={`px-4 py-2 ${activeTab === 'versions' ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' : 'text-gray-600 dark:text-gray-400'}`}
                            onClick={() => setActiveTab('versions')}
                        >
                            Версии
                        </button>
                        <button
                            className={`px-4 py-2 ${activeTab === 'export' ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' : 'text-gray-600 dark:text-gray-400'}`}
                            onClick={() => setActiveTab('export')}
                        >
                            Экспорт/Импорт
                        </button>
                    </>
                )}
            </div>

            {/* Содержимое вкладок */}
            <div className="p-4">
                {/* Вкладка "Проекты" */}
                {activeTab === 'projects' && (
                    <>
                        {/* Форма создания нового проекта */}
                        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3">
                                Создать новый проект
                            </h3>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Введите имя нового проекта..."
                                    value={newProjectName}
                                    onChange={(e) => setNewProjectName(e.target.value)}
                                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                                    onKeyDown={(e) => e.key === 'Enter' && handleCreateNewProject()}
                                />
                                <button
                                    onClick={handleCreateNewProject}
                                    className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-all duration-200 flex items-center shadow-sm hover:shadow"
                                >
                                    <PlusCircleIcon className="h-5 w-5 mr-1.5" />
                                    Создать
                                </button>
                            </div>
                        </div>
                        
                        {/* Фильтры и поиск */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    placeholder="Поиск проектов..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                                />
                            </div>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                            >
                                <option value="name">Сортировать по имени</option>
                                <option value="date">Сортировать по дате</option>
                            </select>
                            <button
                                onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                                className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                                title={sortDirection === 'asc' ? 'По возрастанию' : 'По убыванию'}
                            >
                                {sortDirection === 'asc' ? '↑' : '↓'}
                            </button>
                            <button
                                onClick={() => {
                                    refreshProjectsList();
                                    showNotification('Список проектов обновлен', 'info');
                                }}
                                className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                                title="Обновить список"
                            >
                                <ArrowPathIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Список проектов */}
                        <div className="overflow-y-auto max-h-96 border border-gray-200 dark:border-gray-700 rounded">
                            {filteredProjects.length === 0 ? (
                                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                    {searchTerm
                                        ? 'Нет проектов, соответствующих запросу'
                                        : 'Нет доступных проектов'}
                                </div>
                            ) : (
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-800">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedProjects.length === filteredProjects.length && filteredProjects.length > 0}
                                                    onChange={() => {
                                                        if (selectedProjects.length === filteredProjects.length) {
                                                            setSelectedProjects([]);
                                                        } else {
                                                            setSelectedProjects([...filteredProjects]);
                                                        }
                                                    }}
                                                    className="mr-2"
                                                />
                                                Название
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Действия
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {filteredProjects.map((name) => (
                                            <tr
                                                key={name}
                                                className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${name === projectName ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}
                                            >
                                                <td className="px-4 py-2 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedProjects.includes(name)}
                                                            onChange={() => handleSelectProject(name)}
                                                            className="mr-2"
                                                        />
                                                        <FolderIcon className="w-5 h-5 mr-2 text-yellow-500 dark:text-yellow-400" />
                                                        <span className="font-medium text-gray-900 dark:text-white">
                                                            {name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => handleLoadProject(name)}
                                                            className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                            title="Открыть проект"
                                                        >
                                                            <CheckCircleIcon className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteProject(name)}
                                                            className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                                            title="Удалить проект"
                                                        >
                                                            <TrashIcon className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Кнопки для работы с выбранными проектами */}
                        <div className="flex justify-between mt-4">
                            <div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Выбрано: {selectedProjects.length} из {filteredProjects.length}
                                </span>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    disabled={selectedProjects.length === 0}
                                    onClick={() => {
                                        if (window.confirm(`Вы уверены, что хотите удалить ${selectedProjects.length} выбранных проектов?`)) {
                                            let successCount = 0;
                                            selectedProjects.forEach(name => {
                                                const success = deleteProject(name);
                                                if (success) successCount++;
                                            });
                                            showNotification(`Удалено проектов: ${successCount} из ${selectedProjects.length}`, 'info');
                                            setSelectedProjects([]);
                                        }
                                    }}
                                    className={`px-4 py-2 rounded ${selectedProjects.length === 0
                                            ? 'bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
                                            : 'bg-red-600 text-white hover:bg-red-700 dark:hover:bg-red-700'
                                        }`}
                                >
                                    <TrashIcon className="w-5 h-5 inline mr-1" />
                                    Удалить выбранные
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {/* Вкладка "Версии" */}
                {activeTab === 'versions' && projectName && (
                    <>
                        <div className="mb-4">
                            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                                Управление версиями
                            </h3>

                            {/* Форма создания новой версии */}
                            <div className="bg-gray-50 dark:bg-gray-700 rounded p-4 mb-4">
                                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Создать новую версию</h4>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Название версии
                                        </label>
                                        <input
                                            type="text"
                                            value={newVersionName}
                                            onChange={(e) => setNewVersionName(e.target.value)}
                                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                                            placeholder="например: v1.0.0"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Комментарий (необязательно)
                                        </label>
                                        <textarea
                                            value={versionComment}
                                            onChange={(e) => setVersionComment(e.target.value)}
                                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                                            rows="2"
                                            placeholder="Описание изменений в этой версии..."
                                        />
                                    </div>

                                    <button
                                        onClick={handleCreateVersion}
                                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                    >
                                        <PlusCircleIcon className="w-5 h-5 inline mr-1" />
                                        Создать версию
                                    </button>
                                </div>
                            </div>

                            {/* Список версий */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-medium text-gray-800 dark:text-gray-200">История версий</h4>
                                    <button
                                        onClick={() => {
                                            refreshVersionsList();
                                            showNotification('Список версий обновлен', 'info');
                                        }}
                                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                                        title="Обновить список версий"
                                    >
                                        <ArrowPathIcon className="w-5 h-5" />
                                    </button>
                                </div>

                                {projectVersions.length === 0 ? (
                                    <div className="bg-gray-50 dark:bg-gray-700 rounded p-4 text-center text-gray-500 dark:text-gray-400">
                                        Нет сохраненных версий
                                    </div>
                                ) : (
                                    <div className="overflow-y-auto max-h-64 border border-gray-200 dark:border-gray-700 rounded">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead className="bg-gray-50 dark:bg-gray-800">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Версия
                                                    </th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Дата
                                                    </th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Комментарий
                                                    </th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Действия
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                {projectVersions.map((version, index) => (
                                                    <tr key={index} className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                                                        // Подсветка текущей загруженной версии, если известна
                                                        currentProject && currentProject.metadata && currentProject.metadata.lastLoadedVersion === version.name
                                                        ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                                    }`}>
                                                        <td className="px-4 py-2 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <DocumentDuplicateIcon className="w-5 h-5 mr-2 text-green-500 dark:text-green-400" />
                                                                <div>
                                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                                        {version.name}
                                                                    </span>
                                                                    {currentProject && currentProject.metadata && currentProject.metadata.lastLoadedVersion === version.name && (
                                                                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                                            Текущая
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                            {formatDate(version.date)}
                                                        </td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                            {version.comment || <span className="italic text-gray-400 dark:text-gray-500">Нет комментария</span>}
                                                        </td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                            <div className="flex space-x-2">
                                                                <button
                                                                    onClick={() => handleLoadVersion(version.name)}
                                                                    className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                                    title="Загрузить версию"
                                                                >
                                                                    <CheckCircleIcon className="w-5 h-5" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteVersion(version.name)}
                                                                    className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                                                    title="Удалить версию"
                                                                >
                                                                    <TrashIcon className="w-5 h-5" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* Вкладка "Экспорт/Импорт" */}
                {activeTab === 'export' && projectName && (
                    <>
                        <div className="mb-4">
                            {/* Экспорт проекта */}
                            <div className="bg-gray-50 dark:bg-gray-700 rounded p-4 mb-4">
                                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Экспорт проекта</h4>

                                <div className="flex flex-col space-y-2">
                                    <button
                                        onClick={handleExport}
                                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                    >
                                        <ArrowDownTrayIcon className="w-5 h-5 inline mr-1" />
                                        Экспортировать проект в JSON
                                    </button>
                                </div>
                            </div>

                            {/* Импорт проекта */}
                            <div className="bg-gray-50 dark:bg-gray-700 rounded p-4 mb-4">
                                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Импорт проекта</h4>
                                
                                {/* Скрытый input для выбора файла */}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                    accept=".json"
                                />
                                
                                <button
                                    onClick={handleImportButtonClick}
                                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 w-full"
                                >
                                    <ArrowUpTrayIcon className="w-5 h-5 inline mr-1" />
                                    Выбрать JSON файл для импорта
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ProjectManager;