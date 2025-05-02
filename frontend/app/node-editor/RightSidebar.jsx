import React, { useState } from 'react';
import {
    PlayIcon,
    BeakerIcon,
    CubeIcon,
    XMarkIcon,
} from '@heroicons/react/24/solid';
import ExecutionPanel from './panels/ExecutionPanel';
import VariablesPanel from './panels/VariablesPanel';
import NodePropertiesPanel from './panels/NodePropertiesPanel';

/**
 * Компонент правой боковой панели с переключением режимов
 */
const RightSidebar = ({
    isExecuting,
    executionStep,
    onStop,
    onStep,
    onRunFull,
    consoleOutput,
    selectedNodeId,
    nodes
}) => {
    // Режимы панели
    const PANEL_MODES = {
        EXECUTION: 'execution',
        VARIABLES: 'variables',
        NODE_PROPERTIES: 'node_properties',
        HIDDEN: 'hidden' // Состояние, когда панель свернута
    };

    // Состояние текущего режима
    const [currentMode, setCurrentMode] = useState(PANEL_MODES.EXECUTION);

    // Выбранный нод (если есть)
    const selectedNode = selectedNodeId ? nodes.find(node => node.id === selectedNodeId) : null;

    // Обработчик переключения режимов
    const handleModeSwitch = (mode) => {
        if (mode === currentMode) {
            // Если текущий режим уже активен, скрываем панель
            setCurrentMode(PANEL_MODES.HIDDEN);
        } else {
            // Иначе переключаемся на выбранный режим
            setCurrentMode(mode);
        }
    };

    // Рендерим содержимое текущей панели
    const renderPanelContent = () => {
        switch (currentMode) {
            case PANEL_MODES.EXECUTION:
                return (
                    <ExecutionPanel
                        isExecuting={isExecuting}
                        executionStep={executionStep}
                        onStop={onStop}
                        onStep={onStep}
                        onRunFull={onRunFull}
                        consoleOutput={consoleOutput}
                    />
                );
            case PANEL_MODES.VARIABLES:
                return <VariablesPanel />;
            case PANEL_MODES.NODE_PROPERTIES:
                return <NodePropertiesPanel node={selectedNode} />;
            case PANEL_MODES.HIDDEN:
                return null;
            default:
                return null;
        }
    };

    // Если панель скрыта, показываем только кнопки переключения режимов
    if (currentMode === PANEL_MODES.HIDDEN) {
        return (
            <div className="panel-collapsed absolute top-4 right-4 z-50">
                {/* Кнопки переключения режимов */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleModeSwitch(PANEL_MODES.EXECUTION);
                    }}
                    className="mode-button p-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors shadow-md"
                    title="Выполнение"
                >
                    <PlayIcon className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleModeSwitch(PANEL_MODES.VARIABLES);
                    }}
                    className="mode-button p-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors shadow-md"
                    title="Переменные"
                >
                    <BeakerIcon className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                </button>
                <button
                    onClick={(e) => {
                        if (!selectedNode) return;
                        e.stopPropagation();
                        handleModeSwitch(PANEL_MODES.NODE_PROPERTIES);
                    }}
                    className={`mode-button p-2 ${selectedNode ? 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600' : 'bg-gray-100 dark:bg-gray-800 opacity-50 cursor-not-allowed'} rounded transition-colors shadow-md`}
                    title="Свойства нода"
                    disabled={!selectedNode}
                >
                    <CubeIcon className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                </button>
            </div>
        );
    }

    return (
        <div className="right-sidebar absolute top-4 right-4 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50 nodrag nopan">
            {/* Заголовок панели с кнопками переключения режимов */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                    {/* Текущий режим */}
                    <span className="font-bold text-gray-800 dark:text-gray-200 mr-3">
                        {currentMode === PANEL_MODES.EXECUTION && (
                            <span className="flex items-center">
                                <PlayIcon className="w-4 h-4 mr-1 text-blue-600 dark:text-blue-400" />
                                Выполнение
                            </span>
                        )}
                        {currentMode === PANEL_MODES.VARIABLES && (
                            <span className="flex items-center">
                                <BeakerIcon className="w-4 h-4 mr-1 text-purple-600 dark:text-purple-400" />
                                Переменные
                            </span>
                        )}
                        {currentMode === PANEL_MODES.NODE_PROPERTIES && (
                            <span className="flex items-center">
                                <CubeIcon className="w-4 h-4 mr-1 text-green-600 dark:text-green-400" />
                                Свойства нода
                            </span>
                        )}
                    </span>
                </div>

                {/* Кнопки переключения */}
                <div className="panel-tabs flex gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleModeSwitch(PANEL_MODES.EXECUTION);
                        }}
                        className={`mode-button ${currentMode === PANEL_MODES.EXECUTION ? 'active' : ''} p-1.5 rounded ${currentMode === PANEL_MODES.EXECUTION ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                        title="Выполнение"
                    >
                        <PlayIcon className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleModeSwitch(PANEL_MODES.VARIABLES);
                        }}
                        className={`mode-button ${currentMode === PANEL_MODES.VARIABLES ? 'active' : ''} p-1.5 rounded ${currentMode === PANEL_MODES.VARIABLES ? 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                        title="Переменные"
                    >
                        <BeakerIcon className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => {
                            if (!selectedNode) return;
                            e.stopPropagation();
                            handleModeSwitch(PANEL_MODES.NODE_PROPERTIES);
                        }}
                        className={`mode-button ${currentMode === PANEL_MODES.NODE_PROPERTIES ? 'active' : ''} p-1.5 rounded ${currentMode === PANEL_MODES.NODE_PROPERTIES ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                        title="Свойства нода"
                        disabled={!selectedNode}
                    >
                        <CubeIcon className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleModeSwitch(currentMode);
                        }}
                        className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                        title="Скрыть панель"
                    >
                        <XMarkIcon className="w-4 h-4 text-gray-500" />
                    </button>
                </div>
            </div>

            {/* Содержимое текущей панели */}
            <div className="properties-panel p-4" onMouseDown={e => e.stopPropagation()}>
                {renderPanelContent()}
            </div>
        </div>
    );
};

export default RightSidebar;