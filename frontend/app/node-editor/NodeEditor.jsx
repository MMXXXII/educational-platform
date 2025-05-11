import React, { useState, useEffect } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { useEditor } from '../contexts/EditorContext';

// Импорт вспомогательных компонентов
import EditorHeader from './components/EditorHeader';
import CreateProjectModal from './components/CreateProjectModal';
import OpenProjectModal from './components/OpenProjectModal';
import NotificationPanel from './components/NotificationPanel';
import NodePalette from '../node-editor/NodePalette';
import FlowCanvas from './FlowCanvas';
import { NODE_CATEGORIES } from '../services/nodeRegistry';

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
        projectsList,
        saveError,
        loadError,
        refreshProjectsList
    } = useEditor();

    // Состояния для модальных окон
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showOpenModal, setShowOpenModal] = useState(false);

    // Состояние для уведомлений
    const [notification, setNotification] = useState(null);

    // Устанавливаем флаг монтирования компонента
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // При открытии списка проектов всегда обновляем его
    useEffect(() => {
        if (showOpenModal) {
            refreshProjectsList();
        }
    }, [showOpenModal, refreshProjectsList]);

    // Обработка ошибок сохранения и загрузки
    useEffect(() => {
        if (saveError) {
            showNotification(saveError, "error");
        }
    }, [saveError]);

    useEffect(() => {
        if (loadError) {
            showNotification(loadError, "error");
        }
    }, [loadError]);

    // Обработчик создания нового проекта
    const handleCreateProject = (newProjectName) => {
        if (!newProjectName.trim()) {
            showNotification("Имя проекта не может быть пустым", "warning");
            return;
        }

        // Создаем новый проект
        const success = createNewProject(newProjectName.trim());

        if (success) {
            // Сразу же сохраняем проект в localStorage
            const saveSuccess = saveProject(newProjectName.trim());

            if (saveSuccess) {
                setShowCreateModal(false);
                showNotification(`Создан новый проект: ${newProjectName}`, "success");
                // Обновляем список проектов после сохранения
                refreshProjectsList();
            } else {
                showNotification(`Проект создан, но не удалось сохранить его`, "warning");
            }
        }
    };

    // Обработчик сохранения проекта
    const handleSaveProject = () => {
        // Если проект еще не имеет имени, показываем диалог создания проекта
        if (!projectName) {
            setShowCreateModal(true);
            return;
        }

        const success = saveProject();
        if (success) {
            showNotification(`Проект "${projectName}" успешно сохранен`, "success");
            // Обновляем список проектов после сохранения
            refreshProjectsList();
        }
    };

    // Обработчик загрузки проекта
    const handleLoadProject = (name) => {
        const success = loadProject(name);
        if (success) {
            setShowOpenModal(false);
            showNotification(`Проект "${name}" успешно загружен`, "success");
        }
    };

    // Обработчик обновления списка проектов
    const handleRefreshProjectsList = () => {
        refreshProjectsList();
        showNotification("Список проектов обновлен", "success");
    };

    // Функция для отображения уведомлений
    const showNotification = (message, type = "error") => {
        setNotification({ message, type });
    };

    // Обработчик закрытия уведомления
    const closeNotification = () => {
        setNotification(null);
    };

    // Список разрешенных типов нодов (пока все разрешены)
    const allowedNodeTypes = [
    ];
    const allowedCategories = [
        NODE_CATEGORIES.VARIABLES, NODE_CATEGORIES.CONTROL, NODE_CATEGORIES.OPERATIONS,
    ];

    return (
        <div className="w-full h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            {/* Шапка редактора */}
            <EditorHeader
                projectName={projectName}
                isModified={isModified}
                onSave={handleSaveProject}
                onNew={() => setShowCreateModal(true)}
                onOpen={() => setShowOpenModal(true)}
            />

            {/* Уведомления */}
            <NotificationPanel
                notification={notification}
                onClose={closeNotification}
                autoHideTime={5000}
            />

            {/* Модальное окно создания проекта */}
            <CreateProjectModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreate={handleCreateProject}
                existingProjects={projectsList}
            />

            {/* Модальное окно открытия проекта */}
            <OpenProjectModal
                isOpen={showOpenModal}
                onClose={() => setShowOpenModal(false)}
                onOpen={handleLoadProject}
                onRefresh={handleRefreshProjectsList}
                projectsList={projectsList}
            />

            {/* Основной контент редактора */}
            <div className="flex w-full h-[calc(100vh-4rem)]">
                {isMounted && (
                    <ReactFlowProvider>
                        {/* Палитра с фильтрацией */}
                        <NodePalette
                            allowedCategories={allowedCategories}
                        />

                        {/* Область редактирования */}
                        <FlowCanvas />
                    </ReactFlowProvider>
                )}
            </div>
        </div>
    );
}

export default NodeEditor;