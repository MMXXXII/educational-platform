import React, { useState, useEffect, memo } from 'react';
import { BaseEdge, EdgeLabelRenderer, useReactFlow, getBezierPath } from 'reactflow';

/**
 * Анимированное ребро с визуализацией потока данных
 * Улучшенная версия с использованием animateMotion
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
    const [animationKey, setAnimationKey] = useState(null);

    // Отслеживаем изменения в данных ребра для анимации
    useEffect(() => {
        if (data?.dataTransfer) {
            // Сначала принудительно сбрасываем предыдущее состояние
            setActive(false);
            setAnimationKey(null);
            
            // Микротаска для переключения состояния
            setTimeout(() => {
                // Активируем новую анимацию с новым ключом
                setActive(true);
                setDataValue(data.dataTransfer.value);
                setAnimationKey(`animate-${Date.now()}`);
                
                // Через 2 секунды скрываем анимацию
                const timer = setTimeout(() => {
                    setActive(false);
                    setAnimationKey(null);
                }, 2000);
                
                return () => clearTimeout(timer);
            }, 0);
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
            {/* Определяем фильтр для свечения (вне условия) */}
            <defs>
                <filter id={`glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>

            {/* Базовый путь ребра */}
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={edgeStyle} />

            {/* Анимированная частица для потока данных с использованием animateMotion */}
            {active && animationKey && (
                <svg
                    key={animationKey}
                    style={{
                        overflow: 'visible',
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none'
                    }}
                >
                    <circle 
                        r="4" 
                        fill="#3b82f6" 
                        filter={`url(#glow-${id})`}
                    >
                        <animateMotion
                            dur="1.5s"
                            repeatCount="2"
                            path={edgePath}
                            rotate="auto"
                        />
                    </circle>
                </svg>
            )}

            {/* Отображение значения данных на ребре */}
            {active && dataValue !== null && dataValue !== 'flow' && (
                <EdgeLabelRenderer>
                    <div
                        key={`label-${animationKey}`}
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