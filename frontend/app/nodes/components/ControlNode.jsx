import React, { useState, useEffect } from 'react';
import { getNodeClassName } from '../../utils/nodeUtils';
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
        count: 5,
        condition: 'equal'
    });

    // Инициализируем локальное состояние из данных нода
    useEffect(() => {
        if (data.nodeRef) {
            setLocalState({
                count: data.nodeRef.data.count !== undefined ? data.nodeRef.data.count : 5,
                condition: data.nodeRef.data.condition || 'equal'
            });
        }
    }, [data.nodeRef]);

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
            return (
                <div className="w-full">
                    <div className="flex items-center">
                        <label className="block text-sm mr-2">Итераций:</label>
                        <input
                            type="number"
                            value={localState.count || 5}
                            onChange={(e) => handleChange('count', parseInt(e.target.value) || 1)}
                            min="1"
                            className="w-full p-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-sm nodrag"
                        />
                    </div>
                </div>
            );
        } else if (nodeType === 'if') {
            return (
                <div className="w-full text-center text-sm">
                    Условное ветвление
                </div>
            );
        }
        return null;
    };

    return (
        <div className={getNodeClassName(nodeColors, selected, nodeType)}>
            {/* Индикатор активного состояния */}
            <NodeStateIndicator nodeRef={data.nodeRef} nodeType={nodeType} />

            {/* Заголовок нода */}
            <div className="font-bold text-center mb-2 pb-1 border-b border-gray-300 dark:border-gray-600">
                {data.label}
            </div>

            {/* Содержимое нода */}
            <div className="flex justify-center mb-4 w-full">
                {renderContent()}
            </div>

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
        </div>
    );
};

export default ControlNode;