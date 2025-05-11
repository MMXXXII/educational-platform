import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from 'reactflow';
import { checkNodeConnections } from '../../utils/nodeUtils';
import { InputHandles, OutputHandles, NodeStateIndicator } from './NodeHandles';

/**
 * Компонент для отображения нода присваивания
 * @param {Object} props - Свойства компонента
 * @param {string} props.id - ID нода
 * @param {Object} props.data - Данные нода
 * @param {boolean} props.selected - Выбран ли нод
 * @param {Object} props.nodeDefinition - Определение типа нода
 * @returns {JSX.Element} JSX элемент
 */
const AssignmentNode = ({ id, data, selected, nodeDefinition }) => {
    // Получаем все рёбра из хранилища ReactFlow
    const edges = useStore((state) => state.edges);

    // Проверяем наличие внешних подключений
    const [inputConnections, setInputConnections] = useState({
        left: false,
        right: false,
        flow: false
    });

    // Функция для проверки соединений
    const checkConnections = useCallback(() => {
        const connections = checkNodeConnections(id, edges);
        setInputConnections({
            left: connections.inputs.left || false,
            right: connections.inputs.right || false,
            flow: connections.inputs.flow || false
        });
    }, [edges, id]);

    // Проверяем соединения при монтировании и при изменении рёбер
    useEffect(() => {
        checkConnections();

        // Добавляем периодическую проверку
        const interval = setInterval(checkConnections, 300);
        return () => clearInterval(interval);
    }, [checkConnections]);

    // Получаем стили для нода
    const nodeColors = nodeDefinition?.color || {
        bg: 'bg-gray-100 dark:bg-gray-800',
        border: 'border-gray-500',
        text: 'text-gray-800 dark:text-gray-200'
    };

    return (
        <div
            className={`${nodeColors.bg} ${nodeColors.text} flex flex-col items-center relative`}
            style={{
                minWidth: '180px',
                minHeight: '120px',
                padding: '1rem',
                borderRadius: '0.375rem',
                borderWidth: '2px',
                borderStyle: 'solid',
                borderColor: selected ? '#ffffff' : '#10b981', // белый при выделении, teal-500 по умолчанию
                boxShadow: selected ? '0 0 0 1px #10b981, 0 4px 6px -1px rgba(0, 0, 0, 0.1)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s ease'
            }}
        >
            {/* Индикатор активного состояния */}
            <NodeStateIndicator nodeRef={data.nodeRef} nodeType="assignment" />

            {/* Заголовок нода */}
            <div className="font-bold text-center mb-3 w-full pb-1 border-b border-gray-300 dark:border-gray-600">
                {data.label}
            </div>

            {/* Визуальное представление операции присваивания */}
            <div className="text-center text-xl font-bold my-2">=</div>

            {/* Порты */}
            <InputHandles
                inputs={data.inputs}
                nodeId={id}
                nodeType="assignment"
                onConnect={checkConnections}
            />
            <OutputHandles
                outputs={data.outputs}
                nodeId={id}
                nodeType="assignment"
            />
        </div>
    );
};

export default AssignmentNode;