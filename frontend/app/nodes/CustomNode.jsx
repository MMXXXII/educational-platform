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
    const nodeRef = data.nodeRef;
    const nodeType = data.type;

    // Получаем экземпляр ReactFlow для доступа к edges
    const { getEdges } = useReactFlow();

    // Используем useStore для получения текущих ребер и подписки на их изменения
    const edges = useStore((state) => state.edges);

    // Получаем определение типа нода из реестра
    const nodeDefinition = getNodeDefinition(nodeType);

    // Используем стандартное определение, если тип не найден в реестре
    const nodeColors = nodeDefinition?.color || {
        bg: 'bg-gray-100 dark:bg-gray-800',
        border: 'border-gray-500',
        text: 'text-gray-800 dark:text-gray-200'
    };

    // Функция для проверки наличия внешних подключений к порту value
    const checkExternalConnections = useCallback(() => {
        if (data.inputs && id && nodeType === 'variable') {
            // Находим входной порт 'value'
            const valueInput = data.inputs.find(input => input.name === 'value');

            if (valueInput) {
                // Проверяем наличие соединений с этим портом
                const hasConnection = edges.some(edge =>
                    edge.target === id &&
                    edge.targetHandle === valueInput.id
                );

                setIsExternalValue(hasConnection);
            }
        }
    }, [data.inputs, id, nodeType, edges]);

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
                variableType: nodeRef.data.variableType || 'any'
            });
        }
    }, [nodeRef]);

    // Проверяем соединения при каждом рендере и изменении зависимостей
    useEffect(() => {
        checkExternalConnections();
    }, [checkExternalConnections, edges]);

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
                                {isExternalValue ? (
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

        // Другие типы нодов (TODO изменить)
        switch (data.type) {
            case 'math':
                return (
                    <div className="w-full">
                        <select
                            value={localState.operation || 'add'}
                            onChange={(e) => handleChange('operation', e.target.value)}
                            className="w-full p-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-sm nodrag"
                        >
                            <option value="add">Сложение</option>
                            <option value="subtract">Вычитание</option>
                            <option value="multiply">Умножение</option>
                            <option value="divide">Деление</option>
                        </select>
                    </div>
                );
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
                    <div className="w-full">
                        <select
                            value={localState.condition || 'equal'}
                            onChange={(e) => handleChange('condition', e.target.value)}
                            className="w-full p-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-sm nodrag"
                        >
                            <option value="equal">Равно</option>
                            <option value="notEqual">Не равно</option>
                            <option value="greater">Больше</option>
                            <option value="less">Меньше</option>
                            <option value="greaterOrEqual">Больше или равно</option>
                            <option value="lessOrEqual">Меньше или равно</option>
                        </select>
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

    return (
        <div
            className={`
                ${nodeColors.bg} ${nodeColors.border} ${nodeColors.text}
                p-3 rounded-md border-2 w-48
                ${selected ? 'shadow-lg ring-2 ring-blue-400' : 'shadow'}
                flex flex-col relative
            `}
            data-nodeid={data.id}
        >
            {/* Индикатор активного состояния */}
            {renderActiveIndicator()}

            {/* Заголовок нода */}
            <div className="font-bold text-center mb-2 pb-1 border-b border-gray-300 dark:border-gray-600">
                {data.label}
            </div>

            {/* Интерактивное содержимое нода */}
            <div className="flex justify-center mb-4 w-full">
                {renderNodeContent()}
            </div>

            {/* Входные порты (слева) */}
            {data.inputs && data.inputs.map((input, index) => (
                <div key={`input-${input.id || index}`} className="absolute left-0">
                    <Handle
                        type="target"
                        position={Position.Left}
                        id={input.id || input.name}
                        style={{
                            left: -8,
                            top: input.dataType === 'flow' ? 24 : 50 + (index * 20),
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
                            style={{ top: input.dataType === 'flow' ? 18 : 44 + (index * 20) }}
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
                            top: output.dataType === 'flow' ? 24 : 50 + (index * 20),
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
                            style={{ top: output.dataType === 'flow' ? 18 : 44 + (index * 20) }}
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