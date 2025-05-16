import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from 'reactflow';
import { checkNodeConnections } from '../../utils/nodeUtils';
import { InputHandles, OutputHandles, NodeStateIndicator } from './NodeHandles';

/**
 * Компонент для отображения нода операции (математической или логической)
 * @param {Object} props - Свойства компонента
 * @param {string} props.id - ID нода
 * @param {Object} props.data - Данные нода
 * @param {boolean} props.selected - Выбран ли узел
 * @param {Object} props.nodeDefinition - Определение типа нода
 * @returns {JSX.Element} JSX элемент
 */
const OperationNode = ({ id, data, selected, nodeDefinition }) => {
    const nodeType = data.type; // 'math' или 'logical'

    const [localState, setLocalState] = useState({
        operation: '',
        leftValue: 0,
        rightValue: 0,
        leftType: 'number',
        rightType: 'number'
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
                operation: data.nodeRef.data.operation || (nodeType === 'math' ? 'add' : 'equal'),
                leftValue: data.nodeRef.data.leftValue !== undefined ? data.nodeRef.data.leftValue : 0,
                rightValue: data.nodeRef.data.rightValue !== undefined ? data.nodeRef.data.rightValue : 0,
                leftType: data.nodeRef.data.leftType || 'number',
                rightType: data.nodeRef.data.rightType || 'number'
            });
        }
    }, [data.nodeRef, nodeType]);

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

    // Рендеринг содержимого нода в зависимости от его типа
    const renderContent = () => {
        if (nodeType === 'math') {
            return (
                <>
                    {/* Выбор математической операции */}
                    <select
                        value={localState.operation || 'add'}
                        onChange={(e) => handleChange('operation', e.target.value)}
                        className="w-full p-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-sm nodrag mb-2"
                    >
                        <option value="add">Сложение (+)</option>
                        <option value="subtract">Вычитание (-)</option>
                        <option value="multiply">Умножение (*)</option>
                        <option value="divide">Деление (/)</option>
                        <option value="modulo">Остаток (%)</option>
                    </select>
                </>
            );
        } else if (nodeType === 'logical') {
            return (
                <>
                    {/* Выбор логической операции */}
                    <select
                        value={localState.operation || 'equal'}
                        onChange={(e) => handleChange('operation', e.target.value)}
                        className="w-full p-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-sm nodrag mb-2"
                    >
                        <option value="equal">Равно (==)</option>
                        <option value="notEqual">Не равно (!=)</option>
                        <option value="strictEqual">Строго равно (===)</option>
                        <option value="strictNotEqual">Строго не равно (!==)</option>
                        <option value="greater">Больше (&gt;)</option>
                        <option value="greaterEqual">Больше или равно (&gt;=)</option>
                        <option value="less">Меньше (&lt;)</option>
                        <option value="lessEqual">Меньше или равно (&lt;=)</option>
                    </select>
                </>
            );
        } else if (nodeType === 'booleanLogic') {
            return (
                <>
                    {/* Выбор логической операции AND/OR */}
                    <select
                        value={localState.operation || 'and'}
                        onChange={(e) => handleChange('operation', e.target.value)}
                        className="w-full p-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-sm nodrag mb-2"
                    >
                        <option value="and">Логическое И (AND)</option>
                        <option value="or">Логическое ИЛИ (OR)</option>
                    </select>
                </>
            );
        }
        return null;
    };

    // Рендеринг полей для левого и правого операндов
    const renderOperands = () => {
        return (
            <div className="flex flex-col space-y-2 mt-2">
                {/* Левый операнд */}
                <div className="flex items-center" title="Левый операнд">
                    {externalConnections.left ? (
                        <div className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white p-1 text-xs rounded text-center w-full">
                            (внешние данные)
                        </div>
                    ) : (
                        <div className="flex space-x-1 w-full">
                            {/* Сначала поле ввода, потом выбор типа */}
                            {localState.leftType === 'boolean' ? (
                                <select
                                    value={String(localState.leftValue)}
                                    onChange={(e) => handleChange('leftValue', e.target.value === 'true')}
                                    className="w-20 p-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded nodrag"
                                >
                                    <option value="true">Истина</option>
                                    <option value="false">Ложь</option>
                                </select>
                            ) : (
                                <input
                                    type={localState.leftType === 'number' ? 'number' : 'text'}
                                    value={localState.leftValue !== undefined ? localState.leftValue : ''}
                                    onChange={(e) => {
                                        let value = e.target.value;
                                        if (localState.leftType === 'number') {
                                            value = e.target.value !== '' ? Number(e.target.value) : 0;
                                        }
                                        handleChange('leftValue', value);
                                    }}
                                    className="w-20 p-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded nodrag"
                                />
                            )}

                            <select
                                value={localState.leftType || 'number'}
                                onChange={(e) => handleChange('leftType', e.target.value)}
                                className="flex-1 p-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded nodrag"
                            >
                                <option value="number">Число</option>
                                <option value="string">Текст</option>
                                <option value="boolean">Лог.</option>
                            </select>
                        </div>
                    )}
                </div>

                {/* Правый операнд */}
                <div className="flex items-center" title="Правый операнд">
                    {externalConnections.right ? (
                        <div className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white p-1 text-xs rounded text-center w-full">
                            (внешние данные)
                        </div>
                    ) : (
                        <div className="flex space-x-1 w-full">
                            {/* Сначала поле ввода, потом выбор типа */}
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
                                value={localState.rightType || 'number'}
                                onChange={(e) => handleChange('rightType', e.target.value)}
                                className="flex-1 p-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded nodrag"
                            >
                                <option value="number">Число</option>
                                <option value="string">Текст</option>
                                <option value="boolean">Лог.</option>
                            </select>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div
            className={`${nodeColors.bg} ${nodeColors.text} flex flex-col relative`}
            style={{
                minWidth: '200px',
                minHeight: '150px',
                padding: '1rem',
                borderRadius: '0.375rem',
                borderWidth: '2px',
                borderStyle: 'solid',
                borderColor: selected ? '#ffffff' : (
                    nodeType === 'math' ? '#a855f7' : '#3b82f6'  // purple-500 для math, blue-500 для logical
                ),
                boxShadow: selected ?
                    `0 0 0 1px ${nodeType === 'math' ? '#a855f7' : '#3b82f6'}, 0 4px 6px -1px rgba(0, 0, 0, 0.1)` :
                    '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s ease'
            }}
        >
            {/* Индикатор активного состояния */}
            <NodeStateIndicator nodeRef={data.nodeRef} nodeType={nodeType} />

            {/* Содержимое нода */}
            <div className="w-full">
                {renderContent()}
                {renderOperands()}
            </div>

            {/* Порты */}
            <InputHandles
                inputs={data.inputs}
                nodeId={id}
                nodeType={nodeType}
                onConnect={checkExternalConnections}
            />
            <OutputHandles
                outputs={data.outputs}
                nodeId={id}
                nodeType={nodeType}
            />
        </div>
    );
};

export default OperationNode;