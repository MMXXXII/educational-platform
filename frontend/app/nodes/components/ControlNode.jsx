import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from 'reactflow';
import { getNodeClassName, checkNodeConnections } from '../../utils/nodeUtils';
import { InputHandles, OutputHandles, NodeStateIndicator } from './NodeHandles';

/**
 * Компонент для отображения управляющих нодов (if, loop)
 * @param {Object} props - Свойства компонента
 * @param {string} props.id - ID нода
 * @param {Object} props.data - Данные нода
 * @param {boolean} props.selected - Выбран ли нод
 * @param {Object} props.nodeDefinition - Определение типа нода
 * @returns {JSX.Element} JSX элемент
 */
const ControlNode = ({ id, data, selected, nodeDefinition }) => {
    const nodeType = data.type; // 'if' или 'loop'

    const [localState, setLocalState] = useState({
        firstIndex: 0,
        lastIndex: 5,
        step: 1,
        condition: 'equal'
    });

    const [externalConnections, setExternalConnections] = useState({
        firstIndex: false,
        lastIndex: false,
        step: false
    });

    // Получаем все рёбра из хранилища ReactFlow
    const edges = useStore((state) => state.edges);

    // Проверяем наличие внешних подключений
    const checkExternalConnections = useCallback(() => {
        if (!id) return;

        const firstIndexConnection = edges.some(edge =>
            edge.target === id &&
            edge.targetHandle === 'input-firstIndex'
        );

        const lastIndexConnection = edges.some(edge =>
            edge.target === id &&
            edge.targetHandle === 'input-lastIndex'
        );

        const stepConnection = edges.some(edge =>
            edge.target === id &&
            edge.targetHandle === 'input-step'
        );

        setExternalConnections({
            firstIndex: firstIndexConnection,
            lastIndex: lastIndexConnection,
            step: stepConnection
        });
    }, [edges, id]);

    // Инициализируем локальное состояние из данных нода
    useEffect(() => {
        if (data.nodeRef) {
            setLocalState({
                firstIndex: data.nodeRef.data.firstIndex !== undefined ? data.nodeRef.data.firstIndex : 0,
                lastIndex: data.nodeRef.data.lastIndex !== undefined ? data.nodeRef.data.lastIndex : 5,
                step: data.nodeRef.data.step !== undefined ? data.nodeRef.data.step : 1,
                condition: data.nodeRef.data.condition || 'equal'
            });
        }
    }, [data.nodeRef]);

    // Проверяем соединения при монтировании и при изменении рёбер
    useEffect(() => {
        checkExternalConnections();

        // Добавляем периодическую проверку для сложных взаимодействий
        const interval = setInterval(checkExternalConnections, 300);
        return () => clearInterval(interval);
    }, [checkExternalConnections]);

    // Обработчик изменения значений в интерактивных элементах
    const handleChange = (key, value) => {
        setLocalState(prev => ({ ...prev, [key]: value }));

        if (data.nodeRef) {
            data.nodeRef.setProperty(key, value);
        }
    };

    // Получаем стили для нода
    const nodeColors = nodeDefinition?.color || {
        bg: 'bg-gray-100 dark:bg-gray-800',
        border: 'border-gray-500',
        text: 'text-gray-800 dark:text-gray-200'
    };

    // Рендеринг содержимого нода в зависимости от его типа
    const renderContent = () => {
        if (nodeType === 'loop') {
            // Рассчитываем количество итераций для отображения в UI 
            // (ориентировочно, может отличаться от вычисленного в runtime)
            const firstIndex = Number(localState.firstIndex || 0);
            const lastIndex = Number(localState.lastIndex || 5);
            const step = Number(localState.step || 1);
            
            const iterationCount = step !== 0 
                ? Math.floor(Math.abs((lastIndex - firstIndex) / step)) + 1 
                : 0;
                
            return (
                <div className="w-full space-y-2">
                    {/* First Index */}
                    <div className="flex items-center mb-1">
                        <label className="block text-xs mr-2 w-24">Начальный:</label>
                        {externalConnections.firstIndex ? (
                            <div className="bg-gray-700 text-white p-1 text-xs rounded text-center w-full">
                                (внешние данные)
                            </div>
                        ) : (
                            <input
                                type="number"
                                value={localState.firstIndex !== undefined ? localState.firstIndex : 0}
                                onChange={(e) => handleChange('firstIndex', Number(e.target.value))}
                                className="w-full p-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-sm nodrag"
                            />
                        )}
                    </div>
                    
                    {/* Last Index */}
                    <div className="flex items-center mb-1">
                        <label className="block text-xs mr-2 w-24">Конечный:</label>
                        {externalConnections.lastIndex ? (
                            <div className="bg-gray-700 text-white p-1 text-xs rounded text-center w-full">
                                (внешние данные)
                            </div>
                        ) : (
                            <input
                                type="number"
                                value={localState.lastIndex !== undefined ? localState.lastIndex : 5}
                                onChange={(e) => handleChange('lastIndex', Number(e.target.value))}
                                className="w-full p-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-sm nodrag"
                            />
                        )}
                    </div>
                    
                    {/* Step */}
                    <div className="flex items-center mb-1">
                        <label className="block text-xs mr-2 w-24">Шаг:</label>
                        {externalConnections.step ? (
                            <div className="bg-gray-700 text-white p-1 text-xs rounded text-center w-full">
                                (внешние данные)
                            </div>
                        ) : (
                            <input
                                type="number"
                                value={localState.step !== undefined ? localState.step : 1}
                                onChange={(e) => {
                                    const value = Number(e.target.value);
                                    // Предотвращаем установку шага равным 0
                                    handleChange('step', value === 0 ? 1 : value);
                                }}
                                className="w-full p-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-sm nodrag"
                            />
                        )}
                    </div>
                    
                    {/* Информация о количестве итераций */}
                    <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                        ~{iterationCount} итераций
                    </div>
                </div>
            );
        } else if (nodeType === 'if') {
            return (
                <div className="w-full flex flex-col">
                    <div className="text-center text-sm mb-2">
                        Условное ветвление
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className={getNodeClassName(nodeColors, selected, nodeType)}>
            {/* Индикатор активного состояния */}
            <NodeStateIndicator nodeRef={data.nodeRef} nodeType={nodeType} />

            {/* Порты */}
            <InputHandles
                inputs={data.inputs}
                nodeId={id}
                nodeType={nodeType}
            />
            <OutputHandles
                outputs={data.outputs}
                nodeId={id}
                nodeType={nodeType}
            />

            {/* Заголовок нода */}
            <div className="font-bold text-center mb-2 pb-1 border-b border-gray-300 dark:border-gray-600">
                {data.label}
            </div>

            {/* Содержимое нода */}
            <div className="flex justify-center mb-2 w-full">
                {renderContent()}
            </div>
        </div>
    );
};

export default ControlNode;