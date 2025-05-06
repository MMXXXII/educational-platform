import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from 'reactflow';
import { getNodeClassName } from '../../utils/nodeUtils';
import { InputHandles, OutputHandles, NodeStateIndicator } from './NodeHandles';

/**
 * Компонент для отображения нода переменной
 * @param {Object} props - Свойства компонента
 * @param {string} props.id - ID нода
 * @param {Object} props.data - Данные нода
 * @param {boolean} props.selected - Выбран ли нод
 * @param {Object} props.nodeDefinition - Определение типа нода
 * @returns {JSX.Element} JSX элемент
 */
const VariableNode = ({ id, data, selected, nodeDefinition }) => {
    const [localState, setLocalState] = useState({
        name: '',
        initialValue: '',
        variableType: 'any'
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
                name: data.nodeRef.data.name || '',
                initialValue: data.nodeRef.data.initialValue !== undefined ? data.nodeRef.data.initialValue : '',
                variableType: data.nodeRef.data.variableType || 'any'
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
        <div className={getNodeClassName(nodeColors, selected, 'variable')}>
            {/* Индикатор активного состояния */}
            <NodeStateIndicator nodeRef={data.nodeRef} nodeType="variable" />

            {/* Заголовок нода */}
            <div className="font-bold text-center mb-2 pb-1 border-b border-gray-300 dark:border-gray-600">
                {data.label}
            </div>

            {/* Содержимое нода */}
            <div className="flex justify-center mb-4 w-full">
                <div className="w-full">
                    <div className="flex flex-col space-y-2 items-center">
                        {/* Контейнер макета с двумя колонками */}
                        <div className="grid grid-cols-2 gap-4 w-full">
                            {/* Левая колонка - Значение переменной или метка init */}
                            <div className="flex flex-col items-center">
                                {externalConnections.value ? (
                                    <div className="bg-gray-700 rounded-full text-white px-3 py-1 text-sm w-full text-center">
                                        init
                                    </div>
                                ) : (
                                    <input
                                        type={localState.variableType === 'number' ? 'number' : 'text'}
                                        value={localState.initialValue !== undefined ? localState.initialValue : ''}
                                        onChange={(e) => handleChange('initialValue',
                                            localState.variableType === 'number' ? Number(e.target.value) : e.target.value)}
                                        className="bg-gray-600 rounded-full text-white px-3 py-1 text-sm w-full text-center outline-none focus:ring-2 focus:ring-blue-400 nodrag"
                                        placeholder="Значение"
                                    />
                                )}
                            </div>
                            {/* Правая колонка - Имя переменной */}
                            <div className="flex flex-col items-center">
                                <input
                                    type="text"
                                    value={localState.name || ''}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    className="bg-yellow-600 rounded-full text-white px-3 py-1 text-sm w-full text-center outline-none focus:ring-2 focus:ring-blue-400 nodrag"
                                    placeholder="Имя переменной"
                                />
                            </div>
                        </div>

                        {/* Переключатель типа переменной */}
                        <select
                            className="bg-gray-700 rounded-full text-white px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-400 nodrag w-full"
                            value={localState.variableType || 'any'}
                            onChange={(e) => handleChange('variableType', e.target.value)}
                        >
                            <option value="any">Любой тип</option>
                            <option value="number">Число</option>
                            <option value="string">Строка</option>
                            <option value="boolean">Логический</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Порты */}
            <InputHandles
                inputs={data.inputs}
                nodeId={id}
                nodeType="variable"
                onConnect={checkExternalConnections}
            />
            <OutputHandles
                outputs={data.outputs}
                nodeId={id}
                nodeType="variable"
            />
        </div>
    );
};

export default VariableNode;