import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { useEditor } from '../contexts/EditorContext';

// Импорт вспомогательных компонентов
import EditorHeader from './components/EditorHeader';
import NotificationPanel from './components/NotificationPanel';
import NodePalette from '../node-editor/NodePalette';
import FlowCanvas from './FlowCanvas';
import { NODE_CATEGORIES } from '../services/nodeRegistry';

// Создаем глобальный объект для передачи уведомлений между компонентами
export const NotificationEvents = {
    listeners: [],
    addListener: (callback) => {
        NotificationEvents.listeners.push(callback);
        return () => {
            NotificationEvents.listeners = NotificationEvents.listeners.filter(
                (cb) => cb !== callback
            );
        };
    },
    notify: (message, type) => {
        NotificationEvents.listeners.forEach((callback) => callback(message, type));
    }
};

/**
 * Страница редактора логических структур
 */
export function NodeEditor() {
    const [isMounted, setIsMounted] = useState(false);
    const {
        projectName,
        isModified,
        saveProject,
        saveError,
        loadError,
        refreshProjectsList,
        setNodes
    } = useEditor();

    // Ref на компонент FlowCanvas для вызова его методов
    const flowCanvasRef = useRef(null);

    // Состояние для уведомлений
    const [notification, setNotification] = useState(null);
    // Состояние для определения мобильного отображения
    const [isMobile, setIsMobile] = useState(false);

    // Устанавливаем флаг монтирования компонента
    useEffect(() => {
        setIsMounted(true);
    }, []);
    
    // Проверка размера экрана при монтировании и изменении размера окна
    useEffect(() => {
        const checkMobileView = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobileView();
        window.addEventListener('resize', checkMobileView);
        
        return () => {
            window.removeEventListener('resize', checkMobileView);
        };
    }, []);

    // Подписываемся на глобальные уведомления
    useEffect(() => {
        const removeListener = NotificationEvents.addListener(showNotification);
        return () => removeListener();
    }, []);

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

    // Обработчик сохранения проекта
    const handleSaveProject = () => {
        // Если проект еще не имеет имени, показываем менеджер проектов
        if (!projectName) {
            NotificationEvents.notify("Сначала создайте новый проект через менеджер проектов", "info");
            return;
        }

        const success = saveProject();
        if (success) {
            showNotification(`Проект "${projectName}" успешно сохранен`, "success");
            // Обновляем список проектов после сохранения
            refreshProjectsList();
        }
    };

    // Функция для отображения уведомлений
    const showNotification = useCallback((message, type = "error") => {
        setNotification({ message, type });
    }, []);

    // Обработчик закрытия уведомления
    const closeNotification = () => {
        setNotification(null);
    };

    // Обработчик для добавления нода (для мобильной версии)
    const handleNodeSelect = useCallback((nodeType, nodeData) => {        
        // Для мобильной версии - пытаемся добавить нод напрямую через addNode у FlowCanvas
        if (isMobile) {
            setTimeout(() => {
                if (flowCanvasRef.current) {
                    const success = flowCanvasRef.current.addNode(nodeType, nodeData);
                }
            }, 50);
        }
    }, [isMobile]);

    // Список разрешенных типов нодов (пока все разрешены)
    const allowedNodeTypes = [];
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
                isMobile={isMobile}
            />

            {/* Уведомления */}
            <NotificationPanel
                notification={notification}
                onClose={closeNotification}
                autoHideTime={5000}
            />

            {/* Основной контент редактора */}
            <div className="flex w-full h-[calc(100vh-4rem)]">
                {isMounted && (
                    <ReactFlowProvider>
                        {/* Палитра с фильтрацией */}
                        <NodePalette
                            allowedCategories={allowedCategories}
                            onNodeSelect={handleNodeSelect}
                        />

                        {/* Область редактирования */}
                        <FlowCanvas 
                            ref={flowCanvasRef}
                            onNodeSelect={handleNodeSelect}
                        />
                    </ReactFlowProvider>
                )}
            </div>
        </div>
    );
}

export default NodeEditor;