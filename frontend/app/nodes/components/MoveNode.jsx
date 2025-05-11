import React, { useState, useEffect } from 'react';
import { getNodeClassName } from '../../utils/nodeUtils';
import { InputHandles, OutputHandles, NodeStateIndicator } from './NodeHandles';

/**
 * Компонент для отображения нода движения
 * @param {Object} props - Свойства компонента
 * @param {string} props.id - ID нода
 * @param {Object} props.data - Данные нода
 * @param {boolean} props.selected - Выбран ли нод
 * @param {Object} props.nodeDefinition - Определение типа нода
 * @returns {JSX.Element} JSX элемент
 */
const MoveNode = ({ id, data, selected, nodeDefinition }) => {
    // Состояние для количества шагов
    const [steps, setSteps] = useState(1);

    // Инициализируем состояние из данных нода
    useEffect(() => {
        if (data.nodeRef) {
            setSteps(data.nodeRef.data.steps || 1);
        }
    }, [data.nodeRef]);

    // Обработчик изменения количества шагов
    const handleStepsChange = (value) => {
        const newSteps = parseInt(value) || 1;
        setSteps(newSteps);
        if (data.nodeRef) {
            data.nodeRef.setProperty('steps', newSteps);
        }
    };

    // Получаем стили для нода
    const nodeColors = nodeDefinition?.color || {
        bg: 'bg-green-100 dark:bg-green-900',
        border: 'border-green-500',
        text: 'text-green-800 dark:text-green-200'
    };

    return (
        <div
            className={`${nodeColors.bg} ${nodeColors.text} flex flex-col relative`}
            style={{
                minWidth: '150px',
                minHeight: '120px',
                padding: '1rem',
                borderRadius: '0.375rem',
                borderWidth: '2px',
                borderStyle: 'solid',
                borderColor: selected ? '#ffffff' : '#22c55e', // белый при выделении, green-500 по умолчанию
                boxShadow: selected ? '0 0 0 1px #22c55e, 0 4px 6px -1px rgba(0, 0, 0, 0.1)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s ease'
            }}
        >
            {/* Индикатор активного состояния */}
            <NodeStateIndicator nodeRef={data.nodeRef} nodeType="move" />

            {/* Заголовок нода */}
            <div className="font-bold text-center mb-2 pb-1 border-b border-gray-300 dark:border-gray-600">
                {data.label}
            </div>

            {/* Упрощенное содержимое нода - только поле ввода шагов */}
            <div className="flex flex-col items-center justify-center p-2">
                <div className="flex items-center w-full mb-2">
                    <span className="text-gray-600 dark:text-gray-300 text-sm mr-2">Шаги:</span>
                    <input
                        type="number"
                        min="1"
                        max="10"
                        value={steps}
                        onChange={(e) => handleStepsChange(e.target.value)}
                        className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm w-16 nodrag"
                    />
                </div>
            </div>

            {/* Порты */}
            <InputHandles
                inputs={data.inputs}
                nodeId={id}
                nodeType="move"
            />
            <OutputHandles
                outputs={data.outputs}
                nodeId={id}
                nodeType="move"
            />
        </div>
    );
};

export default MoveNode;