import React, { useState } from 'react';
import {
    PlayIcon,
    // CubeIcon, // Закомментирован, так как функционал свойств нода не нужен
} from '@heroicons/react/24/solid';
import BaseSidebar from './BaseSidebar';
import ExecutionPanel from '../panels/ExecutionPanel';
// import NodePropertiesPanel from '../panels/NodePropertiesPanel'; // Закомментирован, так как функционал свойств нода не нужен

/**
 * Модульная правая боковая панель с переключением режимов
 * Использует BaseSidebar как основу
 * 
 * @param {Object} props - Свойства компонента
 * @param {boolean} props.isExecuting - Выполняется ли алгоритм
 * @param {number} props.executionStep - Текущий шаг выполнения
 * @param {Function} props.onStop - Обработчик остановки выполнения
 * @param {Function} props.onStep - Обработчик шага выполнения
 * @param {Function} props.onRunFull - Обработчик запуска полного выполнения
 * @param {Array} props.consoleOutput - Массив сообщений консоли
 * @param {string} props.selectedNodeId - ID выбранного нода
 * @param {Object} props.selectedNode - Выбранный нод
 * @param {Array} props.nodes - Массив всех нодов
 */
const ModularRightSidebar = ({
    isExecuting,
    executionStep,
    onStop,
    onStep,
    onRunFull,
    consoleOutput,
    selectedNodeId,
    selectedNode,
    nodes
}) => {
    // Режимы панели
    const PANEL_MODES = {
        EXECUTION: 'execution',
        // NODE_PROPERTIES: 'node_properties',
    };

    // Состояние текущего режима
    const [currentMode, setCurrentMode] = useState(PANEL_MODES.EXECUTION);

    // Определяем заголовок и иконку в зависимости от режима
    const getModeTitleAndIcon = () => {
        switch (currentMode) {
            case PANEL_MODES.EXECUTION:
                return {
                    title: 'Выполнение',
                    icon: <PlayIcon className="h-5 w-5 text-blue-500" />
                };
            /*
            case PANEL_MODES.NODE_PROPERTIES:
                return {
                    title: 'Свойства нода',
                    icon: <CubeIcon className="h-5 w-5 text-green-500" />
                };
            */
            default:
                return {
                    title: 'Панель',
                    icon: null
                };
        }
    };

    // Переключение между режимами
    const toggleMode = (mode) => {
        setCurrentMode(mode);
    };

    // Рендерим содержимое в зависимости от текущего режима
    const renderContent = () => {
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
            /*
            case PANEL_MODES.NODE_PROPERTIES:
                return <NodePropertiesPanel node={selectedNode} />;
            */
            default:
                return null;
        }
    };

    const { title, icon } = getModeTitleAndIcon();

    return (
        <BaseSidebar
            title={title}
            icon={icon}
            position="right"
            width="350px"
            initiallyCollapsed={false}
        >
            {/* <div className="flex gap-2 mb-4">
                <button
                    onClick={() => setCurrentMode(PANEL_MODES.EXECUTION)}
                    className={`flex-1 p-2 rounded-md ${currentMode === PANEL_MODES.EXECUTION
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                        }`}
                >
                    <PlayIcon className="h-5 w-5 mx-auto" />
                </button>
                <button
                    onClick={() => setCurrentMode(PANEL_MODES.NODE_PROPERTIES)}
                    disabled={!selectedNodeId}
                    className={`flex-1 p-2 rounded-md ${!selectedNodeId
                            ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                            : currentMode === PANEL_MODES.NODE_PROPERTIES
                                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                        }`}
                >
                    <CubeIcon className="h-5 w-5 mx-auto" />
                </button>
            </div> */}

            {/* Содержимое активной панели */}
            <div className="panel-content-wrapper" style={{ animation: 'fadeIn 0.3s ease-out' }}>
                {renderContent()}
            </div>
        </BaseSidebar>
    );
};

export default ModularRightSidebar;