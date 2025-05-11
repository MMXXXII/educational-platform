import React, { useState, useEffect } from 'react';
import { Handle, Position, useUpdateNodeInternals } from 'reactflow';

/**
 * Компонент для отображения входных портов нода
 * @param {Object} props - Свойства компонента
 * @param {Array} props.inputs - Массив входных портов
 * @param {string} props.nodeId - ID нода
 * @param {string} props.nodeType - Тип нода
 * @param {Function} props.onConnect - Функция обратного вызова при соединении
 * @returns {JSX.Element} JSX элемент
 */
export const InputHandles = ({ inputs, nodeId, nodeType, onConnect }) => {
    const [hoveredInput, setHoveredInput] = useState(null);
    const updateNodeInternals = useUpdateNodeInternals();

    // Обновляем внутреннее состояние нода при монтировании и изменении inputs
    useEffect(() => {
        if (nodeId) {
            updateNodeInternals(nodeId);
        }
    }, [nodeId, inputs, updateNodeInternals, nodeType]);

    if (!inputs || inputs.length === 0) return null;

    // Функция для определения позиции входного порта
    const getInputPortPosition = (input, index) => {
        // Базовые позиции по типу нода
        const basePositions = {
            if: {
                flow: 22,
                test: 45
            },
            loop: {
                flow: 22,
                firstIndex: 42,
                lastIndex: 72,
                step: 102
            },
            assignment: {
                flow: 22,
                left: 60,
                right: 80
            },
            variable: {
                flow: 22,
                value: 77
            },
            print: {
                flow: 22,
                value: 52
            },
            math: {
                flow: 22,
                left: 52,
                right: 86
            },
            logical: {
                flow: 22,
                left: 52,
                right: 86
            },
            booleanLogic: {
                flow: 22,
                left: 52,
                right: 72
            },
            player: {
                flow: 22,
            },
            move: {
                flow: 22,
                entity: 50,
            },
            turn: {
              flow: 22,
              entity: 50,  
            },
            wallAhead: {
                flow: 22,
                entity: 50
            },
            exitReached: {
                flow: 22,
                entity: 50
            },
            jump: {
                flow: 22,
            }
        };
        
        // Если есть заранее определенная позиция для этого типа нода и порта
        if (nodeType in basePositions && input.name in basePositions[nodeType]) {
            return basePositions[nodeType][input.name];
        }
        
        // Для остальных случаев базовое позиционирование
        if (input.dataType === 'flow') {
            return 24; // Flow порты всегда вверху
        } else {
            const dataInputs = inputs.filter(inp => inp.dataType !== 'flow');
            const dataIndex = dataInputs.findIndex(inp => inp.id === input.id);
            
            // Распределяем data порты равномерно начиная с 50px
            return 50 + (dataIndex * 30);
        }
    };

    return (
        <>
            {inputs.map((input, index) => {
                // Получаем позицию для порта
                const portPosition = getInputPortPosition(input, index);
                
                return (
                    <div key={`input-${input.id || index}`} className="absolute left-0">
                        <Handle
                            type="target"
                            position={Position.Left}
                            id={input.id || input.name}
                            style={{
                                left: -8,
                                top: portPosition,
                                width: input.dataType === 'flow' ? 14 : 12,
                                height: input.dataType === 'flow' ? 14 : 12,
                                transform: input.dataType === 'flow' ? 'rotate(45deg)' : 'none',
                                borderRadius: input.dataType === 'flow' ? 0 : '50%',
                            }}
                            onMouseEnter={() => setHoveredInput(index)}
                            onMouseLeave={() => setHoveredInput(null)}
                            onConnect={onConnect}
                        />
                        {hoveredInput === index && (
                            <div
                                className="absolute left-2 text-xs bg-gray-800 text-white px-2 py-1 rounded z-10 whitespace-nowrap"
                                style={{ 
                                    top: portPosition - 6
                                }}
                            >
                                {input.label || input.name} {input.dataType !== 'flow' && `(${input.dataType})`}
                            </div>
                        )}
                    </div>
                );
            })}
        </>
    );
};

/**
 * Компонент для отображения выходных портов нода
 * @param {Object} props - Свойства компонента
 * @param {Array} props.outputs - Массив выходных портов
 * @param {string} props.nodeId - ID нода
 * @param {string} props.nodeType - Тип нода
 * @returns {JSX.Element} JSX элемент
 */
export const OutputHandles = ({ outputs, nodeId, nodeType }) => {
    const [hoveredOutput, setHoveredOutput] = useState(null);
    const updateNodeInternals = useUpdateNodeInternals();

    // Обновляем внутреннее состояние нода при монтировании и изменении outputs
    useEffect(() => {
        if (nodeId) {
            updateNodeInternals(nodeId);
        }
    }, [nodeId, outputs, updateNodeInternals, nodeType]);

    if (!outputs || outputs.length === 0) return null;

    // Функция для определения позиции выходного порта
    const getOutputPortPosition = (output, index) => {
        // Базовые позиции по типу нода
        const basePositions = {
            if: {
                flow: null, // У if нет выхода flow
                true: 22,
                false: 45,
                result: 70
            },
            loop: {
                flow: null, // У loop нет общего выхода flow
                body: 22,
                next: 45,
                index: 70
            },
            assignment: {
                flow: 22,
                result: 70
            },
            variable: {
                flow: 22,
                reference: 77
            },
            print: {
                flow: 22
            },
            math: {
                flow: 22,
                result: 68
            },
            logical: {
                flow: 22,
                result: 68
            },
            booleanLogic: {
                flow: 22,
                result: 62
            },
            player: {
                flow: 22,
                actions: 50,
                direction: 70,
            },
            move: {
                flow: 22,
                success: 50,
            },
            turn: {
                flow: 22,
                direction: 50,
            },
            wallAhead: {
                flow: null,
                true: 22,
                false: 45,
                result: 70,
            },
            exitReached: {
                flow: 22,
                result: 50,
            },
            jump: {
                flow: 22,
                success: 50,
            }
        };
        
        // Если есть заранее определенная позиция для этого типа нода и порта
        if (nodeType in basePositions && output.name in basePositions[nodeType] && basePositions[nodeType][output.name] !== null) {
            return basePositions[nodeType][output.name];
        }
        
        // Для остальных случаев базовое позиционирование
        if (output.dataType === 'flow') {
            return 24; // Flow порты всегда вверху
        } else {
            const dataOutputs = outputs.filter(out => out.dataType !== 'flow');
            const dataIndex = dataOutputs.findIndex(out => out.id === output.id);
            
            // Распределяем data порты равномерно начиная с 50px
            return 50 + (dataIndex * 30);
        }
    };

    return (
        <>
            {outputs.map((output, index) => {
                // Получаем позицию для порта
                const portPosition = getOutputPortPosition(output, index);
                
                return (
                    <div key={`output-${output.id || index}`} className="absolute right-0">
                        <Handle
                            type="source"
                            position={Position.Right}
                            id={output.id || output.name}
                            style={{
                                right: -8,
                                top: portPosition,
                                width: output.dataType === 'flow' ? 14 : 12,
                                height: output.dataType === 'flow' ? 14 : 12,
                                transform: output.dataType === 'flow' ? 'rotate(45deg)' : 'none',
                                borderRadius: output.dataType === 'flow' ? 0 : '50%',
                            }}
                            onMouseEnter={() => setHoveredOutput(index)}
                            onMouseLeave={() => setHoveredOutput(null)}
                        />
                        {hoveredOutput === index && (
                            <div
                                className="absolute right-2 text-xs bg-gray-800 text-white px-2 py-1 rounded z-10 whitespace-nowrap"
                                style={{ 
                                    top: portPosition - 6
                                }}
                            >
                                {output.label || output.name} {output.dataType !== 'flow' && `(${output.dataType})`}
                            </div>
                        )}
                    </div>
                );
            })}
        </>
    );
};

/**
 * Форматирует значение для отображения в индикаторе
 * @param {any} value - Значение для форматирования
 * @returns {string} - Отформатированное значение
 */
const formatDisplayValue = (value) => {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';

    if (typeof value === 'object') {
        try {
            return JSON.stringify(value);
        } catch (e) {
            return '[Объект]';
        }
    }

    const stringValue = String(value);

    // Ограничиваем длину строки для отображения
    if (stringValue.length > 10) {
        return stringValue.substring(0, 8) + '...';
    }

    return stringValue;
};

/**
 * Компонент для отображения индикатора активного состояния нода
 * @param {Object} props - Свойства компонента
 * @param {Object} props.nodeRef - Ссылка на экземпляр нода
 * @param {string} props.nodeType - Тип нода
 * @returns {JSX.Element} JSX элемент
 */
export const NodeStateIndicator = ({ nodeRef, nodeType }) => {
    if (!nodeRef || !nodeRef.state) return null;

    const state = nodeRef.state;
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

    // Специальный индикатор для нода сравнения
    if ((nodeType === 'logical' || nodeType === 'if') && state.result !== undefined) {
        return (
            <div className={`absolute -top-2 -right-2 py-1 px-2 ${state.result ? 'bg-green-500' : 'bg-red-500'} text-white text-xs rounded-full shadow-md font-semibold z-10`}>
                {state.result ? 'Истина' : 'Ложь'}
            </div>
        );
    }

    // Индикатор для цикла - показываем только если цикл выполняется или был выполнен
    if (nodeType === 'loop') {
        // Показываем индикатор только если isFirstRun = false, что означает что выполнение началось
        if (state.currentIteration !== undefined && state.isFirstRun === false) {
            // Предотвращаем отображение значения, превышающего общее количество итераций
            const currentIteration = state.isCompleted 
                ? state.count // Если цикл завершен, показываем полное кол-во итераций
                : Math.min(state.currentIteration + 1, state.count);
                
            const iterationText = `${currentIteration}/${state.count}`;
            
            return (
                <div className="absolute -top-2 -right-2 py-1 px-2 bg-purple-500 text-white text-xs rounded-full shadow-md font-semibold z-10">
                    {iterationText}
                </div>
            );
        }
        return null;
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