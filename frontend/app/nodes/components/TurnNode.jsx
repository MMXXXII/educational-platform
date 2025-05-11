import React, { useState, useEffect } from 'react';
import { getNodeClassName } from '../../utils/nodeUtils';
import { InputHandles, OutputHandles, NodeStateIndicator } from './NodeHandles';

/**
 * Компонент для отображения нода поворота
 * @param {Object} props - Свойства компонента
 * @param {string} props.id - ID нода
 * @param {Object} props.data - Данные нода
 * @param {boolean} props.selected - Выбран ли нод
 * @param {Object} props.nodeDefinition - Определение типа нода
 * @returns {JSX.Element} JSX элемент
 */
const TurnNode = ({ id, data, selected, nodeDefinition }) => {
    // Состояние для направления поворота
    const [direction, setDirection] = useState('right');

    // Инициализируем состояние из данных нода
    useEffect(() => {
        if (data.nodeRef) {
            setDirection(data.nodeRef.data.direction || 'right');

            // Убедимся, что метка нода обновлена в соответствии с направлением
            updateNodeLabel(data.nodeRef.data.direction || 'right');
        }
    }, [data.nodeRef]);

    // Обработчик изменения направления поворота
    const handleDirectionChange = (value) => {
        setDirection(value);
        if (data.nodeRef) {
            data.nodeRef.setProperty('direction', value);
            updateNodeLabel(value);
        }
    };

    // Функция для обновления метки нода
    const updateNodeLabel = (dirValue) => {
        if (data.nodeRef) {
            const directionLabel = dirValue === 'left' ? 'налево' : 'направо';
            data.nodeRef.label = `Поворот ${directionLabel}`;
        }
    };

    // Получаем стили для нода
    const nodeColors = nodeDefinition?.color || {
        bg: 'bg-yellow-100 dark:bg-yellow-900',
        border: 'border-yellow-500',
        text: 'text-yellow-800 dark:text-yellow-200'
    };

    // Получаем направление в виде текста для отображения
    const directionText = direction === 'left' ? 'Налево' : 'Направо';

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
                borderColor: selected ? '#ffffff' : '#eab308', // белый при выделении, yellow-500 по умолчанию
                boxShadow: selected ? '0 0 0 1px #eab308, 0 4px 6px -1px rgba(0, 0, 0, 0.1)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s ease'
            }}
        >
            {/* Индикатор активного состояния */}
            <NodeStateIndicator nodeRef={data.nodeRef} nodeType="turn" />

            {/* Заголовок нода */}
            <div className="font-bold text-center mb-2 pb-1 border-b border-gray-300 dark:border-gray-600">
                {data.label}
            </div>

            {/* Упрощенное содержимое нода - только выбор направления */}
            <div className="flex flex-col items-center justify-center p-2">
                <div className="flex items-center w-full mb-2">
                    <span className="text-gray-600 dark:text-gray-300 text-sm mr-2">Направление:</span>
                    <select
                        value={direction}
                        onChange={(e) => handleDirectionChange(e.target.value)}
                        className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm flex-grow nodrag"
                    >
                        <option value="left">Налево</option>
                        <option value="right">Направо</option>
                    </select>
                </div>
            </div>

            {/* Порты */}
            <InputHandles
                inputs={data.inputs}
                nodeId={id}
                nodeType="turn"
            />
            <OutputHandles
                outputs={data.outputs}
                nodeId={id}
                nodeType="turn"
            />
        </div>
    );
};

export default TurnNode;