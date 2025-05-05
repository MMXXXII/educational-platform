import React, { memo, useState, useEffect, useCallback } from 'react';
import { Handle, Position, useReactFlow, useStore } from 'reactflow';
import { getNodeDefinition, formatDisplayValue } from '../services/nodeRegistry';

/**
 * Компонент CustomNode для визуализации нода в ReactFlow
 */
const CustomNode = ({ data, selected, id }) => {
    const [hoveredInput, setHoveredInput] = useState(null);
    const [hoveredOutput, setHoveredOutput] = useState(null);
    const [localState, setLocalState] = useState({});
    const [isExternalValue, setIsExternalValue] = useState(false);
    const [externalConnections, setExternalConnections] = useState({
        left: false,
        right: false,
        value: false
    });
    const nodeRef = data.nodeRef;
    const nodeType = data.type;

    // Получаем экземпляр ReactFlow для доступа к edges
    const { getEdges, getNode } = useReactFlow();

    // Используем useStore для получения текущих ребер и подписки на их изменения
    const edges = useStore((state) => state.edges);
    
    // Функция для проверки наличия внешних подключений к портам
    const checkExternalConnections = useCallback(() => {
        if (data.inputs && id) {
            const connections = {
                left: false,
                right: false,
                value: false
            };

            // Проверяем все входные порты
            data.inputs.forEach(input => {
                if (input.name === 'left' || input.name === 'right' || input.name === 'value') {
                    // Проверяем наличие соединений с этим портом
                    const hasConnection = edges.some(edge =>
                        edge.target === id &&
                        edge.targetHandle === input.id
                    );

                    connections[input.name] = hasConnection;
                }
            });

            setExternalConnections(connections);

            // Для обратной совместимости 
            if (nodeType === 'variable') {
                setIsExternalValue(connections.value);
            }
        }
    }, [data.inputs, id, nodeType, edges]);
    
    // Подписываемся на изменения в графе для немедленного обновления
    // Эта функция регистрирует callback, который будет вызываться при каждом изменении состояния
    useEffect(() => {
        // Создаем кастомный обработчик, который вызовет проверку соединений
        const onEdgesChange = () => {
            setTimeout(checkExternalConnections, 0);
        };
        
        // Подписываемся на события ReactFlow
        const flowInstance = getNode(id) ? { 
            on: (event, callback) => document.addEventListener(event, callback),
            off: (event, callback) => document.removeEventListener(event, callback)
        } : null;
        
        if (flowInstance) {
            // Подписываемся на события изменения ребер
            flowInstance.on('connect', onEdgesChange);
            flowInstance.on('remove', onEdgesChange);
            
            // Отписываемся при размонтировании
            return () => {
                flowInstance.off('connect', onEdgesChange);
                flowInstance.off('remove', onEdgesChange);
            };
        }
    }, [id, getNode, checkExternalConnections]);

    // Получаем определение типа нода из реестра
    const nodeDefinition = getNodeDefinition(nodeType);

    // Используем стандартное определение, если тип не найден в реестре
    const nodeColors = nodeDefinition?.color || {
        bg: 'bg-gray-100 dark:bg-gray-800',
        border: 'border-gray-500',
        text: 'text-gray-800 dark:text-gray-200'
    };

    // Является ли нод операцией (math или logical)
    const isOperationNode = nodeType === 'math' || nodeType === 'logical';

    // Инициализируем локальное состояние из данных нода
    useEffect(() => {
        if (nodeRef) {
            setLocalState({
                name: nodeRef.data.name || '',
                value: nodeRef.data.value !== undefined ? nodeRef.data.value : '',
                initialValue: nodeRef.data.initialValue !== undefined ? nodeRef.data.initialValue : '',
                operation: nodeRef.data.operation || 'add',
                count: nodeRef.data.count !== undefined ? nodeRef.data.count : 5,
                condition: nodeRef.data.condition || 'equal',
                variableName: nodeRef.data.variableName || '',
                variableType: nodeRef.data.variableType || 'any',
                // Добавляем новые поля для LogicalNode и MathNode
                leftValue: nodeRef.data.leftValue !== undefined ? nodeRef.data.leftValue : 0,
                rightValue: nodeRef.data.rightValue !== undefined ? nodeRef.data.rightValue : 0,
                leftType: nodeRef.data.leftType || 'number',
                rightType: nodeRef.data.rightType || 'number'
            });
        }
    }, [nodeRef]);

    // Добавляем прямую проверку соединений при монтировании компонента
    // и при создании/удалении соединений
    useEffect(() => {
        // Проверяем соединения сразу
        checkExternalConnections();
        
        // Добавляем периодическую проверку для сложных взаимодействий
        const interval = setInterval(() => {
            checkExternalConnections();
        }, 300);
        
        return () => clearInterval(interval);
    }, [checkExternalConnections]);

    // Получаем функцию для определения цвета порта
    const getPortColor = (dataType) => {
        switch (dataType) {
            case 'number': return 'bg-green-500';
            case 'string': return 'bg-blue-500';
            case 'boolean': return 'bg-yellow-500';
            case 'flow': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    // Обработчик изменения значений в интерактивных элементах
    const handleChange = (key, value) => {
        setLocalState(prev => ({ ...prev, [key]: value }));

        if (nodeRef) {
            nodeRef.setProperty(key, value);
        }
    };

    // Индикатор текущего состояния
    const renderActiveIndicator = () => {
        if (!data.nodeRef || !data.nodeRef.state) return null;

        const state = data.nodeRef.state;
        const hasData = Object.keys(state).length > 0;

        if (!hasData) return null;

        // Определяем значение для отображения
        if (state.currentValue !== undefined) {
            const displayValue = formatDisplayValue(state.currentValue);

            return (
                <div className="absolute -top-2 -right-2 py-1 px-2 bg-blue-500 text-white text-xs rounded-full shadow-md font-semibold z-10">
                    {displayValue}
                </div>
            );
        }

        // Специальный индикатор для узла сравнения
        if (nodeType === 'logical' && state.result !== undefined) {
            return (
                <div className={`absolute -top-2 -right-2 py-1 px-2 ${state.result ? 'bg-green-500' : 'bg-red-500'} text-white text-xs rounded-full shadow-md font-semibold z-10`}>
                    {state.result ? 'Истина' : 'Ложь'}
                </div>
            );
        }

        // Индикатор ошибки
        if (state.error) {
            return (
                <div className="absolute -top-2 -right-2 py-1 px-2 bg-red-500 text-white text-xs rounded-full shadow-md font-semibold z-10">
                    Ошибка
                </div>
            );
        }

        return null;
    };

    // Мы больше не используем эту функцию, так как переделали интерфейс узла сравнения
    // Оставляем пустую функцию для совместимости с остальным кодом
    const renderValueInput = () => null;

    // Рендерим содержимое нода в зависимости от его типа
    const renderNodeContent = () => {
        if (nodeType === 'variable') {
            return (
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
            );
        }

        // Для логических операций
        if (nodeType === 'logical') {
            return (
                <div className="w-full">
                    {/* Выбор операции сравнения */}
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

                    {/* Контейнер для левого и правого операндов (вертикальное расположение) */}
                    <div className="flex flex-col space-y-2 mt-2">
                        {/* Левый операнд */}
                        <div className="flex items-center" title="Левый операнд">
                            {externalConnections.left ? (
                                <div className="bg-gray-700 text-white p-1 text-xs rounded text-center w-full">
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
                                        className="flex-1 p-1 text-xs bg-gray-600 text-white rounded nodrag"
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
                                <div className="bg-gray-700 text-white p-1 text-xs rounded text-center w-full">
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
                                        className="flex-1 p-1 text-xs bg-gray-600 text-white rounded nodrag"
                                    >
                                        <option value="number">Число</option>
                                        <option value="string">Текст</option>
                                        <option value="boolean">Лог.</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        // Для математических операций
        if (nodeType === 'math') {
            return (
                <div className="w-full">
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

                    {/* Контейнер для левого и правого операндов (вертикальное расположение) */}
                    <div className="flex flex-col space-y-2 mt-2">
                        {/* Левый операнд */}
                        <div className="flex items-center" title="Левый операнд">
                            {externalConnections.left ? (
                                <div className="bg-gray-700 text-white p-1 text-xs rounded text-center w-full">
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
                                        className="flex-1 p-1 text-xs bg-gray-600 text-white rounded nodrag"
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
                                <div className="bg-gray-700 text-white p-1 text-xs rounded text-center w-full">
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
                                        className="flex-1 p-1 text-xs bg-gray-600 text-white rounded nodrag"
                                    >
                                        <option value="number">Число</option>
                                        <option value="string">Текст</option>
                                        <option value="boolean">Лог.</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        // Другие типы нодов
        switch (data.type) {
            case 'loop':
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
            case 'if':
                return (
                    <div className="w-full text-center text-sm">
                        Условное ветвление
                    </div>
                );

            case 'print':
                return (
                    <div className="w-full text-center text-sm">
                        Выводит значение в консоль
                    </div>
                );
            default:
                return <div>{data.content}</div>;
        }
    };

    // Функция для определения позиции выходных портов
    const getOutputPortPosition = (output, index, totalOutputs) => {
        // Для нода If, имеющего выходы true и false, позиционируем их раздельно
        if (nodeType === 'if') {
            // Если это выход 'true', помещаем его в верхнюю часть
            if (output.name === 'true') {
                return 30;
            }
            // Если это выход 'false', помещаем его в нижнюю часть
            if (output.name === 'false') {
                return 90;
            }
        }
        
        // Для остальных нодов стандартное позиционирование
        if (output.dataType === 'flow') {
            return 24; // Фиксированная позиция для flow-выходов
        } else if (isOperationNode) {
            // Позиции для операционных нодов
            return (output.name === 'result') ? 60 : 85;
        } else {
            // Позиции для обычных нодов - распределяем равномерно
            return 60 + (index * 25);
        }
    };

    return (
        <div
            className={`
                ${nodeColors.bg} ${nodeColors.border} ${nodeColors.text}
                p-3 rounded-md border-2 w-48
                ${nodeType === 'logical' || nodeType === 'math' ? 'min-h-[160px]' : isOperationNode ? 'h-[120px]' : 'min-h-[140px]'}
                ${selected ? 'shadow-lg ring-2 ring-blue-400' : 'shadow'}
                flex flex-col relative
            `}
            data-nodeid={data.id}
        >
            {/* Индикатор активного состояния */}
            {renderActiveIndicator()}

            {/* Заголовок нода (скрываем для операций) */}
            {!isOperationNode && (
                <div className="font-bold text-center mb-2 pb-1 border-b border-gray-300 dark:border-gray-600">
                    {data.label}
                </div>
            )}

            {/* Интерактивное содержимое нода */}
            {isOperationNode ? (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full px-3">
                        {renderNodeContent()}
                    </div>
                </div>
            ) : (
                <div className="flex justify-center mb-4 w-full">
                    {renderNodeContent()}
                </div>
            )}

            {/* Входные порты (слева) */}
            {data.inputs && data.inputs.map((input, index) => (
                <div key={`input-${input.id || index}`} className="absolute left-0">
                    <Handle
                        type="target"
                        position={Position.Left}
                        id={input.id || input.name}
                        style={{
                            left: -8,
                            top: input.dataType === 'flow' ? 24 : (isOperationNode) 
                                ? (input.name === 'left' ? 60 : 85)  // Позиции для операционных нодов
                                : 60 + (index * 25),                 // Позиции для обычных нодов
                            width: input.dataType === 'flow' ? 14 : 12,
                            height: input.dataType === 'flow' ? 14 : 12,
                            transform: input.dataType === 'flow' ? 'rotate(45deg)' : 'none',
                            borderRadius: input.dataType === 'flow' ? 0 : '50%',
                        }}
                        className={`${getPortColor(input.dataType)} border-2 border-white dark:border-gray-800 transition-all ${hoveredInput === index ? 'scale-125' : ''}`}
                        onMouseEnter={() => setHoveredInput(index)}
                        onMouseLeave={() => setHoveredInput(null)}
                        onConnect={() => {
                            // Дополнительный триггер при создании соединения
                            setTimeout(checkExternalConnections, 0);
                        }}
                    />
                    {hoveredInput === index && (
                        <div
                            className="absolute left-2 text-xs bg-gray-800 text-white px-2 py-1 rounded z-10 whitespace-nowrap"
                            style={{ 
                                top: input.dataType === 'flow' ? 18 : (isOperationNode)
                                    ? (input.name === 'left' ? 54 : 79)  // Позиции для операционных нодов
                                    : 54 + (index * 25)                  // Позиции для обычных нодов
                            }}
                        >
                            {input.label || input.name} {input.dataType !== 'flow' && `(${input.dataType})`}
                        </div>
                    )}
                </div>
            ))}

            {/* Выходные порты (справа) */}
            {data.outputs && data.outputs.map((output, index) => (
                <div key={`output-${output.id || index}`} className="absolute right-0">
                    <Handle
                        type="source"
                        position={Position.Right}
                        id={output.id || output.name}
                        style={{
                            right: -8,
                            top: getOutputPortPosition(output, index, data.outputs.length),
                            width: output.dataType === 'flow' ? 14 : 12,
                            height: output.dataType === 'flow' ? 14 : 12,
                            transform: output.dataType === 'flow' ? 'rotate(45deg)' : 'none',
                            borderRadius: output.dataType === 'flow' ? 0 : '50%',
                        }}
                        className={`${getPortColor(output.dataType)} border-2 border-white dark:border-gray-800 transition-all ${hoveredOutput === index ? 'scale-125' : ''}`}
                        onMouseEnter={() => setHoveredOutput(index)}
                        onMouseLeave={() => setHoveredOutput(null)}
                    />
                    {hoveredOutput === index && (
                        <div
                            className="absolute right-2 text-xs bg-gray-800 text-white px-2 py-1 rounded z-10 whitespace-nowrap"
                            style={{ 
                                top: getOutputPortPosition(output, index, data.outputs.length) - 6
                            }}
                        >
                            {output.label || output.name} {output.dataType !== 'flow' && `(${output.dataType})`}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default memo(CustomNode);