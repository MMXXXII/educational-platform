import React, { memo, useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { getNodeDefinition, formatDisplayValue } from '../services/nodeRegistry';

/**
 * Компонент CustomNode для визуализации нода в ReactFlow
 */
const CustomNode = ({ data, selected }) => {
    const [hoveredInput, setHoveredInput] = useState(null);
    const [hoveredOutput, setHoveredOutput] = useState(null);
    const [localState, setLocalState] = useState({});
    const nodeRef = data.nodeRef;
    const nodeType = data.type;

    // Получаем определение типа нода из реестра
    const nodeDefinition = getNodeDefinition(nodeType);

    // Используем стандартное определение, если тип не найден в реестре
    const nodeColors = nodeDefinition?.color || {
        bg: 'bg-gray-100 dark:bg-gray-800',
        border: 'border-gray-500',
        text: 'text-gray-800 dark:text-gray-200'
    };

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
                variableName: nodeRef.data.variableName || ''
            });
        }
    }, [nodeRef]);

    // Получаем функцию для определения цвета порта
    const getPortColor = nodeDefinition?.getPortColor || ((dataType) => {
        switch (dataType) {
            case 'number': return 'bg-green-500';
            case 'string': return 'bg-blue-500';
            case 'boolean': return 'bg-yellow-500';
            case 'flow': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    });

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

        // Определяем значение для отображения с использованием реестра нодов
        let keyValue = null;
        
        if (nodeDefinition && typeof nodeDefinition.getActiveValue === 'function') {
            keyValue = nodeDefinition.getActiveValue(data.nodeRef);
        } else if (state.error) {
            keyValue = 'Ошибка';
        }

        if (keyValue !== null) {
            // Активный нод с данными - показываем индикатор
            const displayValue = formatDisplayValue(keyValue);

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

    // Рендерим интерактивные элементы в зависимости от типа нода
    const renderNodeContent = () => {
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
            <div className="flex justify-center mb-2 w-full">
                {renderNodeContent()}
            </div>

            {/* Входные порты */}
            {data.inputs && data.inputs.map((input, index) => (
                <div key={`input-${input.id || index}`} className="absolute left-0">
                    <Handle
                        type="target"
                        position={Position.Left}
                        id={input.id || input.name}
                        style={{
                            left: -8,
                            top: 50 + index * 20,
                            width: 12,
                            height: 12,
                        }}
                        className={`${getPortColor(input.dataType)} border-2 border-white dark:border-gray-800 transition-all ${hoveredInput === index ? 'scale-125' : ''
                            }`}
                        onMouseEnter={() => setHoveredInput(index)}
                        onMouseLeave={() => setHoveredInput(null)}
                    />
                    {hoveredInput === index && (
                        <div
                            className="absolute left-2 text-xs bg-gray-800 text-white px-2 py-1 rounded z-10 whitespace-nowrap"
                            style={{ top: 44 + index * 20 }}
                        >
                            {input.label} ({input.dataType})
                        </div>
                    )}
                </div>
            ))}

            {/* Выходные порты */}
            {data.outputs && data.outputs.map((output, index) => (
                <div key={`output-${output.id || index}`} className="absolute right-0">
                    <Handle
                        type="source"
                        position={Position.Right}
                        id={output.id || output.name}
                        style={{
                            right: -8,
                            top: 50 + index * 20,
                            width: 12,
                            height: 12,
                        }}
                        className={`${getPortColor(output.dataType)} border-2 border-white dark:border-gray-800 transition-all ${hoveredOutput === index ? 'scale-125' : ''
                            }`}
                        onMouseEnter={() => setHoveredOutput(index)}
                        onMouseLeave={() => setHoveredOutput(null)}
                    />
                    {hoveredOutput === index && (
                        <div
                            className="absolute right-2 text-xs bg-gray-800 text-white px-2 py-1 rounded z-10 whitespace-nowrap"
                            style={{ top: 44 + index * 20 }}
                        >
                            {output.label} ({output.dataType})
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default memo(CustomNode);