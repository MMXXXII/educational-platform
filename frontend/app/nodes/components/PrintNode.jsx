import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from 'reactflow';
import { checkNodeConnections } from '../../utils/nodeUtils';
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
    const [localState, setLocalState] = useState({
        message: ''
    });

    const [externalConnections, setExternalConnections] = useState({
        value: false
    });

    // Получаем все рёбра из хранилища ReactFlow
    const edges = useStore((state) => state.edges);

    // Проверяем наличие внешних подключений
    const checkExternalConnections = useCallback(() => {
        if (!id) return;

        const valueConnection = edges.some(edge =>
            edge.target === id &&
            edge.targetHandle === 'input-value'
        );

        setExternalConnections({
            value: valueConnection
        });
    }, [edges, id]);

    // Инициализируем локальное состояние из данных нода
    useEffect(() => {
        if (data.nodeRef) {
            setLocalState({
                message: data.nodeRef.data.message || ''
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

    return (
        <div
            className={`${nodeColors.bg} ${nodeColors.text} flex flex-col relative`}
            style={{
                minWidth: '200px',
                minHeight: '120px',
                padding: '1rem',
                borderRadius: '0.375rem',
                borderWidth: '2px',
                borderStyle: 'solid',
                borderColor: selected ? '#ffffff' : '#f59e0b', // белый при выделении, amber-500 по умолчанию
                boxShadow: selected ? '0 0 0 1px #f59e0b, 0 4px 6px -1px rgba(0, 0, 0, 0.1)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s ease'
            }}
        >
            {/* Индикатор активного состояния */}
            <NodeStateIndicator nodeRef={data.nodeRef} nodeType="print" />

            {/* Заголовок нода */}
            <div className="font-bold text-center mb-2 pb-1 border-b border-gray-300 dark:border-gray-600">
                {data.label}
            </div>

            {/* Содержимое нода */}
            <div className="flex flex-col w-full">
                {/* Поле ввода сообщения или метка "внешние данные" */}
                <div className="w-full">
                    {externalConnections.value ? (
                        <div className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white p-1 text-xs rounded text-center w-full">
                            (внешние данные)
                        </div>
                    ) : (
                        <textarea
                            value={localState.message || ''}
                            onChange={(e) => handleChange('message', e.target.value)}
                            className="w-full p-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-sm nodrag min-h-[40px] resize-y"
                            placeholder="Введите сообщение для вывода"
                            rows={Math.max(2, (localState.message || '').split('\n').length)}
                        />
                    )}
                </div>
            </div>

            {/* Порты */}
            <InputHandles
                inputs={data.inputs}
                nodeId={id}
                nodeType="print"
                onConnect={checkExternalConnections}
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