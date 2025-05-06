import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { getPortColor, getInputPortPosition, getOutputPortPosition, formatDisplayValue } from '../nodeUtils';

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

    if (!inputs || inputs.length === 0) return null;

    return (
        <>
            {inputs.map((input, index) => (
                <div key={`input-${input.id || index}`} className="absolute left-0">
                    <Handle
                        type="target"
                        position={Position.Left}
                        id={input.id || input.name}
                        style={{
                            left: -8,
                            top: getInputPortPosition(input, index, nodeType),
                            width: input.dataType === 'flow' ? 14 : 12,
                            height: input.dataType === 'flow' ? 14 : 12,
                            transform: input.dataType === 'flow' ? 'rotate(45deg)' : 'none',
                            borderRadius: input.dataType === 'flow' ? 0 : '50%',
                        }}
                        className={`${getPortColor(input.dataType)} border-2 border-white dark:border-gray-800 transition-all ${hoveredInput === index ? 'scale-125' : ''}`}
                        onMouseEnter={() => setHoveredInput(index)}
                        onMouseLeave={() => setHoveredInput(null)}
                        onConnect={onConnect}
                    />
                    {hoveredInput === index && (
                        <div
                            className="absolute left-2 text-xs bg-gray-800 text-white px-2 py-1 rounded z-10 whitespace-nowrap"
                            style={{ 
                                top: getInputPortPosition(input, index, nodeType) - 6
                            }}
                        >
                            {input.label || input.name} {input.dataType !== 'flow' && `(${input.dataType})`}
                        </div>
                    )}
                </div>
            ))}
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

    if (!outputs || outputs.length === 0) return null;

    return (
        <>
            {outputs.map((output, index) => (
                <div key={`output-${output.id || index}`} className="absolute right-0">
                    <Handle
                        type="source"
                        position={Position.Right}
                        id={output.id || output.name}
                        style={{
                            right: -8,
                            top: getOutputPortPosition(output, index, outputs.length, nodeType),
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
                                top: getOutputPortPosition(output, index, outputs.length, nodeType) - 6
                            }}
                        >
                            {output.label || output.name} {output.dataType !== 'flow' && `(${output.dataType})`}
                        </div>
                    )}
                </div>
            ))}
        </>
    );
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
