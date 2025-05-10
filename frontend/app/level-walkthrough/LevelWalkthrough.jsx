import React, { useState, useEffect } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { Link } from 'react-router';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useEditor } from '../contexts/EditorContext';
import useNodeExecution from '../hooks/useNodeExecution';

// Импорт компонентов
import FlowCanvas from '../node-editor/FlowCanvas';
import NodePalette from '../node-editor/NodePalette';
import NotificationPanel from '../node-editor/components/NotificationPanel';
import Console from '../node-editor/components/Console';
import { NODE_CATEGORIES } from '../services/nodeRegistry';

/**
 * Прохождение 3D-уровней с областью для 3D предпросмотра
 */
const LevelWalkthrough = () => {
    const [isMounted, setIsMounted] = useState(false);
    const {
        nodes,
        setNodes,
        edges,
        setEdges,
        projectName,
        saveProject,
        isModified,
    } = useEditor();

    // Хук для выполнения алгоритма
    const {
        isExecuting,
        executionStep,
        consoleOutput,
        dataFlows,
        stopExecution,
        executeStep,
        runFullAlgorithm
    } = useNodeExecution(nodes, edges, setNodes);

    // Состояние для уведомлений
    const [notification, setNotification] = useState(null);

    // Состояние для выбранного нода
    const [selectedNode, setSelectedNode] = useState(null);

    // Состояние для отладочного режима
    const [showDebug, setShowDebug] = useState(false);

    // Состояние для симуляции
    const [isSimulationRunning, setIsSimulationRunning] = useState(false);

    // Устанавливаем флаг монтирования компонента
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Функция для отображения уведомлений
    const showNotification = (message, type = "info") => {
        setNotification({ message, type });
    };

    // Обработчик закрытия уведомления
    const closeNotification = () => {
        setNotification(null);
    };

    // Обработчик выбора нода
    const handleNodeSelect = (node) => {
        setSelectedNode(node);
    };

    // Обработчик удаления нода
    const handleDeleteNode = (nodeId) => {
        setNodes(nodes.filter(node => node.id !== nodeId));
        setSelectedNode(null);
        showNotification("Объект успешно удален", "success");
    };

    // Обработчик изменения свойств нода
    const handleNodePropertiesChange = (nodeId, property, value) => {
        setNodes(nodes.map(node => {
            if (node.id === nodeId) {
                const updatedNode = { ...node };

                // Обновляем соответствующее свойство
                if (property.startsWith('position')) {
                    const axis = property.slice(-1).toLowerCase();
                    updatedNode.position = {
                        ...updatedNode.position,
                        [axis]: value
                    };
                } else if (property.startsWith('rotation')) {
                    // Создаем объект rotation, если его нет
                    if (!updatedNode.data) updatedNode.data = {};
                    if (!updatedNode.data.rotation) updatedNode.data.rotation = {};
                    updatedNode.data.rotation = {
                        ...updatedNode.data.rotation,
                        [property.slice(-1).toLowerCase()]: value
                    };
                } else if (property.startsWith('scale')) {
                    // Создаем объект scale, если его нет
                    if (!updatedNode.data) updatedNode.data = {};
                    if (!updatedNode.data.scale) updatedNode.data.scale = {};
                    updatedNode.data.scale = {
                        ...updatedNode.data.scale,
                        [property.slice(-1).toLowerCase()]: value
                    };
                } else {
                    // Другие свойства
                    if (!updatedNode.data) updatedNode.data = {};
                    updatedNode.data[property] = value;
                }

                // Если выбранный нод - это тот, который мы изменяем, обновляем его
                if (selectedNode && selectedNode.id === nodeId) {
                    setSelectedNode(updatedNode);
                }

                return updatedNode;
            }
            return node;
        }));

        showNotification(`Свойство "${property}" обновлено`, "success");
    };

    // Обработчик переключения отладочного режима
    const handleToggleDebug = () => {
        setShowDebug(!showDebug);
    };

    // Обработчик запуска симуляции
    const handleRunSimulation = () => {
        // Запускаем выполнение алгоритма целиком сразу
        const result = runFullAlgorithm();
        
        if (result.error) {
            showNotification(`Ошибка при запуске симуляции: ${result.error}`, "error");
            return;
        }
        
        setIsSimulationRunning(true);
        showNotification("Симуляция запущена. Алгоритм выполнен полностью.", "success");
    };

    // Обработчик остановки симуляции
    const handleStopSimulation = () => {
        // Останавливаем выполнение алгоритма
        stopExecution();
        
        setIsSimulationRunning(false);
        showNotification("Симуляция остановлена", "info");
    };

    // Обработчик очистки консоли
    const handleClearConsole = () => {
        // Это будет обрабатываться внутри компонента Console
    };

    // Обработчик сохранения проекта
    const handleSaveProject = () => {
        if (saveProject()) {
            showNotification("Проект успешно сохранен", "success");
        } else {
            showNotification("Ошибка при сохранении проекта", "error");
        }
    };

    // Список разрешенных типов нодов (пока все разрешены)
    const allowedNodeTypes = [
    ];
    const allowedCategories = [
        NODE_CATEGORIES.VARIABLES, NODE_CATEGORIES.CONTROL, NODE_CATEGORIES.OPERATIONS
    ];

    return (
        <div className="w-full h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            {/* Верхняя панель */}
            <nav className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700">
                <div className="w-full px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center space-x-4">
                            {/* Кнопка назад */}
                            <Link to="/" className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white">
                                <ArrowLeftIcon className="h-6 w-6" />
                            </Link>

                            {/* Заголовок */}
                            <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                                3D Редактор уровней {projectName ? `- ${projectName}` : ''}
                            </h1>
                        </div>

                        <div className="flex items-center space-x-2">
                            {/* Место для кнопок, если необходимо */}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Уведомления */}
            <NotificationPanel
                notification={notification}
                onClose={closeNotification}
                autoHideTime={3000}
            />

            {/* Основной контент - флекс-контейнер */}
            <div className="flex flex-1 h-[calc(100vh-4rem)]">
                {isMounted && (
                    <ReactFlowProvider>
                        {/* Палитра нодов (левая панель) */}
                        <NodePalette
                            allowedNodeTypes={allowedNodeTypes}
                            allowedCategories={allowedCategories}
                            customTitle={{
                                [NODE_CATEGORIES.VARIABLES]: '3D Объекты',
                                [NODE_CATEGORIES.OPERATIONS]: 'Логика'
                            }}
                        />

                        {/* Центральная часть - нодовый редактор */}
                        <div className="flex-1 relative">
                            <FlowCanvas
                                hideSidebar={true}
                                onNodeSelect={handleNodeSelect}
                            />
                        </div>

                        {/* Правая часть - 3D превью и консоль */}
                        <div className="w-96 border-l border-gray-200 dark:border-gray-700 p-4 flex flex-col">
                            {/* Заголовок боковой панели */}
                            <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-4">3D Превью</h3>

                            {/* Заглушка 3D сцены - квадратная область */}
                            <div className="w-full aspect-square rounded bg-gray-800 flex items-center justify-center mb-4">
                                <div className="text-gray-400 text-center">
                                    <p className="mb-2">3D Превью (заглушка)</p>
                                    <p className="text-sm">Здесь будет отображаться 3D модель уровня</p>
                                </div>
                            </div>

                            {/* Консоль */}
                            <div className="mb-4">
                                <Console 
                                    consoleOutput={consoleOutput}
                                    onClear={handleClearConsole}
                                    title="Консоль симуляции"
                                    initiallyExpanded={true}
                                />
                            </div>

                            {/* Кнопки управления симуляцией */}
                            <div className="mt-auto border-t border-gray-200 dark:border-gray-700 pt-4">
                                {!isSimulationRunning ? (
                                    <button
                                        className="w-full p-2 bg-green-500 hover:bg-green-600 text-white rounded"
                                        onClick={handleRunSimulation}
                                    >
                                        Запустить симуляцию
                                    </button>
                                ) : (
                                    <button
                                        className="w-full p-2 bg-red-500 hover:bg-red-600 text-white rounded"
                                        onClick={handleStopSimulation}
                                    >
                                        Остановить симуляцию
                                    </button>
                                )}
                            </div>
                        </div>
                    </ReactFlowProvider>
                )}
            </div>
        </div>
    );
};

export default LevelWalkthrough;