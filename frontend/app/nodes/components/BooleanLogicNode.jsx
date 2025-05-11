import React, { useState, useEffect } from 'react';
import { InputHandles, OutputHandles, NodeStateIndicator } from './NodeHandles';

/**
 * Компонент для отображения нода булевой логики
 * @param {Object} props - Свойства компонента
 * @param {string} props.id - ID нода
 * @param {Object} props.data - Данные нода
 * @param {boolean} props.selected - Выбран ли нод
 * @param {Object} props.nodeDefinition - Определение типа нода
 * @returns {JSX.Element} JSX элемент
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

    return (
        <div
            className={`${nodeColors.bg} ${nodeColors.text} flex flex-col relative`}
            style={{
                minWidth: '180px',
                minHeight: '120px',
                padding: '1rem',
                borderRadius: '0.375rem',
                borderWidth: '2px',
                borderStyle: 'solid',
                borderColor: selected ? '#ffffff' : '#6366f1', // белый при выделении, indigo-500 по умолчанию
                boxShadow: selected ? '0 0 0 1px #6366f1, 0 4px 6px -1px rgba(0, 0, 0, 0.1)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s ease'
            }}
        >
            {/* Индикатор активного состояния */}
            <NodeStateIndicator nodeRef={data.nodeRef} nodeType="booleanLogic" />

            {/* Содержимое нода */}
            <div className="flex flex-grow items-center justify-center">
                {/* Селектор операции */}
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