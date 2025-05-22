import React from 'react';
import { getNodeClassName } from '../../utils/nodeUtils';
import { InputHandles, OutputHandles, NodeStateIndicator } from './NodeHandles';
import NodeHeader from './NodeHeader';

/**
 * Компонент для отображения нода игрока
 * @param {Object} props - Свойства компонента
 * @param {string} props.id - ID нода
 * @param {Object} props.data - Данные нода
 * @param {boolean} props.selected - Выбран ли нод
 * @param {Object} props.nodeDefinition - Определение типа нода
 * @returns {JSX.Element} JSX элемент
 */
const PlayerNode = ({ id, data, selected, nodeDefinition }) => {
    // Получаем стили для нода
    const nodeColors = nodeDefinition?.color || {
        bg: 'bg-blue-100 dark:bg-blue-900',
        border: 'border-blue-500',
        text: 'text-blue-800 dark:text-blue-200'
    };

    // Извлекаем информацию о состоянии игрока из данных нода (только для отладки)
    const playerState = data.nodeRef?.state || {};

    return (
        <div
            className={`${nodeColors.bg} ${nodeColors.text} flex flex-col relative`}
            style={{
                minWidth: '220px',
                minHeight: '120px',
                padding: '1rem',
                borderRadius: '0.375rem',
                borderWidth: '2px',
                borderStyle: 'solid',
                borderColor: selected ? '#ffffff' : '#3b82f6', // белый при выделении, blue-500 по умолчанию
                boxShadow: selected ? '0 0 0 1px #3b82f6, 0 4px 6px -1px rgba(0, 0, 0, 0.1)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s ease'
            }}
        >
            {/* Индикатор активного состояния */}
            <NodeStateIndicator nodeRef={data.nodeRef} nodeType="player" />

            {/* Заголовок нода */}
            <NodeHeader>
                {data.label}
            </NodeHeader>

            {/* Упрощенное содержимое нода */}
            <div className="flex flex-col items-center justify-center p-2">
                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                    Центральный узел для действий игрока
                </div>
            </div>

            {/* Порты */}
            <InputHandles
                inputs={data.inputs}
                nodeId={id}
                nodeType="player"
            />
            <OutputHandles
                outputs={data.outputs}
                nodeId={id}
                nodeType="player"
            />
        </div>
    );
};

export default PlayerNode;