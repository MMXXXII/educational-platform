import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from 'reactflow';
import { getNodeClassName, checkNodeConnections } from '../../utils/nodeUtils';
import { InputHandles, OutputHandles, NodeStateIndicator } from './NodeHandles';

const AssignmentNode = ({ id, data, selected, nodeDefinition }) => {
    const [localState, setLocalState] = useState({
        leftValue: '',
        rightValue: '',
        leftType: 'string',
        rightType: 'any'
    });

    const [externalConnections, setExternalConnections] = useState({
        left: false,
        right: false
    });

    // Получаем все рёбра из хранилища ReactFlow
    const edges = useStore((state) => state.edges);

    // Проверяем наличие внешних подключений
    const checkExternalConnections = useCallback(() => {
        const connections = checkNodeConnections(id, edges);
        setExternalConnections({
            left: connections.inputs.left || false,
            right: connections.inputs.right || false
        });
    }, [edges, id]);

    // Инициализируем локальное состояние из данных нода
    useEffect(() => {
        if (data.nodeRef) {
            setLocalState({
                leftValue: data.nodeRef.data.leftValue !== undefined ? data.nodeRef.data.leftValue : '',
                rightValue: data.nodeRef.data.rightValue !== undefined ? data.nodeRef.data.rightValue : '',
                leftType: data.nodeRef.data.leftType || 'string',
                rightType: data.nodeRef.data.rightType || 'any'
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
        <div className={getNodeClassName(nodeColors, selected, 'assignment')}>
            <NodeStateIndicator nodeRef={data.nodeRef} nodeType="assignment" />

            <div className="font-bold text-center mb-2 pb-1 border-b border-gray-300 dark:border-gray-600">
                {data.label}
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full px-3 pt-8">
                    <div className="text-center font-bold text-xl mb-3">=</div>
                    
                    <div className="flex flex-col space-y-2 mt-2">
                        {/* Левая часть - имя переменной */}
                        <div className="flex items-center space-x-1">
                            <label className="text-xs text-gray-500 dark:text-gray-400 mr-1">Имя:</label>
                            {externalConnections.left ? (
                                <div className="bg-gray-700 text-white p-1 text-xs rounded text-center w-full">
                                    (внешние данные)
                                </div>
                            ) : (
                                <>
                                    <input
                                        type="text"
                                        value={localState.leftValue !== undefined ? localState.leftValue : ''}
                                        onChange={(e) => handleChange('leftValue', e.target.value)}
                                        className="w-full p-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded nodrag"
                                        placeholder="Имя переменной"
                                    />
                                </>
                            )}
                        </div>

                        {/* Правая часть - значение */}
                        <div className="flex items-center space-x-1">
                            <label className="text-xs text-gray-500 dark:text-gray-400 mr-1">Знач:</label>
                            {externalConnections.right ? (
                                <div className="bg-gray-700 text-white p-1 text-xs rounded text-center w-full">
                                    (внешние данные)
                                </div>
                            ) : (
                                <>
                                    {localState.rightType === 'boolean' ? (
                                        <select
                                            value={String(localState.rightValue)}
                                            onChange={(e) => handleChange('rightValue', e.target.value === 'true')}
                                            className="w-20 p-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded nodrag"
                                        >
                                            <option value="true">Истина</option>
                                            <option value="false">Ложь</option>
                                        </select>
                                    ) : (
                                        <input
                                            type={localState.rightType === 'number' ? 'number' : 'text'}
                                            value={localState.rightValue !== undefined ? localState.rightValue : ''}
                                            onChange={(e) => {
                                                let value = e.target.value;
                                                if (localState.rightType === 'number') {
                                                    value = e.target.value !== '' ? Number(e.target.value) : 0;
                                                }
                                                handleChange('rightValue', value);
                                            }}
                                            className="w-20 p-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded nodrag"
                                        />
                                    )}

                                    <select
                                        value={localState.rightType || 'any'}
                                        onChange={(e) => handleChange('rightType', e.target.value)}
                                        className="flex-1 p-1 text-xs bg-gray-600 text-white rounded nodrag"
                                    >
                                        <option value="any">Любой</option>
                                        <option value="number">Число</option>
                                        <option value="string">Текст</option>
                                        <option value="boolean">Лог.</option>
                                    </select>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <InputHandles
                inputs={data.inputs}
                nodeId={id}
                nodeType="assignment"
                onConnect={checkExternalConnections}
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