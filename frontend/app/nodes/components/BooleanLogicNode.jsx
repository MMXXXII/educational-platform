import React, { useState, useEffect } from 'react';
import { getNodeClassName } from '../../utils/nodeUtils';
import { InputHandles, OutputHandles, NodeStateIndicator } from './NodeHandles';

/**
 * Компонент для отображения нода булевой логики
 */
const BooleanLogicNode = ({ id, data, selected, nodeDefinition }) => {
    const [operation, setOperation] = useState('and');

    // Инициализируем состояние из данных нода
    useEffect(() => {
        if (data.nodeRef) {
            setOperation(data.nodeRef.data.operation || 'and');
        }
    }, [data.nodeRef]);

    // Обработчик изменения операции
    const handleOperationChange = (newOperation) => {
        setOperation(newOperation);
        if (data.nodeRef) {
            data.nodeRef.setProperty('operation', newOperation);
        }
    };

    // Получаем стили для нода
    const nodeColors = nodeDefinition?.color || {
        bg: 'bg-indigo-100 dark:bg-indigo-900',
        border: 'border-indigo-500',
        text: 'text-indigo-800 dark:text-indigo-200'
    };

    // Используем стандартный класс для узлов
    const nodeClass = getNodeClassName(nodeColors, selected, 'booleanLogic');

    return (
        <div className={nodeClass}>
            {/* Индикатор активного состояния */}
            <NodeStateIndicator nodeRef={data.nodeRef} nodeType="booleanLogic" />

            {/* Центрируем селектор внутри узла */}
            <div className="flex items-center justify-center h-full w-full">
                <select
                    value={operation}
                    onChange={(e) => handleOperationChange(e.target.value)}
                    className="w-4/5 p-2 text-sm bg-white dark:bg-gray-700 border 
                              border-gray-300 dark:border-gray-600 rounded shadow-sm nodrag"
                >
                    <option value="and">И (&&)</option>
                    <option value="or">ИЛИ (||)</option>
                </select>
            </div>

            {/* Порты */}
            <InputHandles
                inputs={data.inputs}
                nodeId={id}
                nodeType="booleanLogic"
            />
            <OutputHandles
                outputs={data.outputs}
                nodeId={id}
                nodeType="booleanLogic"
            />
        </div>
    );
};

export default BooleanLogicNode;