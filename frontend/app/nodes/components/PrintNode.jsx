import React from 'react';
import { getNodeClassName } from '../nodeUtils';
import { InputHandles, OutputHandles, NodeStateIndicator } from './NodeHandles';

/**
 * Компонент для отображения нода вывода (print)
 * @param {Object} props - Свойства компонента
 * @param {string} props.id - ID нода
 * @param {Object} props.data - Данные нода
 * @param {boolean} props.selected - Выбран ли нод
 * @param {Object} props.nodeDefinition - Определение типа нода
 * @returns {JSX.Element} JSX элемент
 */
const PrintNode = ({ id, data, selected, nodeDefinition }) => {
    // Получаем стили для нода
    const nodeColors = nodeDefinition?.color || {
        bg: 'bg-gray-100 dark:bg-gray-800',
        border: 'border-gray-500',
        text: 'text-gray-800 dark:text-gray-200'
    };

    return (
        <div className={getNodeClassName(nodeColors, selected, 'print')}>
            {/* Индикатор активного состояния */}
            <NodeStateIndicator nodeRef={data.nodeRef} nodeType="print" />

            {/* Заголовок нода */}
            <div className="font-bold text-center mb-2 pb-1 border-b border-gray-300 dark:border-gray-600">
                {data.label}
            </div>

            {/* Содержимое нода */}
            <div className="flex justify-center mb-4 w-full">
                <div className="w-full text-center text-sm">
                    Выводит значение в консоль
                </div>
            </div>

            {/* Порты */}
            <InputHandles
                inputs={data.inputs}
                nodeId={id}
                nodeType="print"
            />
            <OutputHandles
                outputs={data.outputs}
                nodeId={id}
                nodeType="print"
            />
        </div>
    );
};

export default PrintNode;