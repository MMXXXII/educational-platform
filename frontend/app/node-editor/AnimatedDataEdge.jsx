import React, { useState, useEffect, memo } from 'react';
import { BaseEdge, EdgeLabelRenderer, useReactFlow, getBezierPath } from 'reactflow';

/**
 * Анимированное ребро с визуализацией потока данных
 */
const AnimatedDataEdge = ({
    id,
    source,
    target,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    sourceHandle,
    targetHandle,
    style = {},
    data,
    markerEnd,
}) => {
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const [active, setActive] = useState(false);
    const [dataValue, setDataValue] = useState(null);
    const [animation, setAnimation] = useState(null);

    // Отслеживаем изменения в данных ребра для анимации
    useEffect(() => {
        if (data?.dataTransfer) {
            // Активируем анимацию
            setActive(true);
            setDataValue(data.dataTransfer.value);

            // Создаем уникальный ключ для анимации
            setAnimation(`animate-${Date.now()}`);

            // Через 2 секунды скрываем анимацию
            const timer = setTimeout(() => {
                setActive(false);
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [data?.dataTransfer]);

    const edgeStyle = {
        ...style,
        strokeWidth: active ? 2.5 : 1.5,
        stroke: active ? '#3b82f6' : style.stroke || '#b1b1b7',
    };

    const formatValue = (value) => {
        if (value === null) return 'null';
        if (value === undefined) return 'undefined';
        if (value === 'flow') return '';

        if (typeof value === 'object') {
            try {
                return JSON.stringify(value);
            } catch (e) {
                return '[Объект]';
            }
        }

        return String(value);
    };

    return (
        <>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={edgeStyle} />

            {/* Анимированная частица для потока данных */}
            {active && (
                <svg width="0" height="0">
                    <defs>
                        <marker
                            id={`data-flow-${id}`}
                            viewBox="0 0 10 10"
                            refX="5"
                            refY="5"
                            markerWidth="5"
                            markerHeight="5"
                            orient="auto-start-reverse"
                        >
                            <circle cx="5" cy="5" r="4" fill="#3b82f6" />
                        </marker>
                    </defs>
                </svg>
            )}

            {active && !data?.dataTransfer?.isFlow && (
                <path
                    d={edgePath}
                    className="react-flow__edge-path"
                    strokeDasharray="5,5"
                    strokeWidth={1.5}
                    stroke="#3b82f6"
                    fill="none"
                    markerEnd={`url(#data-flow-${id})`}
                    style={{
                        animation: 'flowAnimation 1.5s infinite linear',
                    }}
                />
            )}

            {/* Отображение значения данных на ребре */}
            {active && dataValue !== null && dataValue !== 'flow' && (
                <EdgeLabelRenderer>
                    <div
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                            background: '#ffffff',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: 12,
                            fontWeight: 500,
                            boxShadow: '0 0 0 1px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.1)',
                            pointerEvents: 'all',
                            color: '#333',
                            zIndex: 1000,
                        }}
                        className="nodrag nopan"
                    >
                        {formatValue(dataValue)}
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
};

export default memo(AnimatedDataEdge);