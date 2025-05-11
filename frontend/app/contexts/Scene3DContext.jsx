import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { sendSignal, SIGNALS, subscribeToAllSignals } from '../utils/signalSystem';

// Создаем контекст для 3D сцены
const Scene3DContext = createContext();

/**
 * Провайдер контекста 3D сцены
 * Предоставляет состояние и методы для взаимодействия с 3D сценой
 * @param {Object} props - Свойства компонента
 * @param {React.ReactNode} props.children - Дочерние компоненты
 */
export const Scene3DProvider = ({ children }) => {
    // Состояние игрока
    const [playerState, setPlayerState] = useState({
        position: { x: 2, y: 2 }, // Начальная позиция
        direction: 'east',        // Начальное направление
        isJumping: false          // Флаг прыжка
    });

    // Состояние окружения
    const [environmentState, setEnvironmentState] = useState({
        walls: [
            { x: 2, y: 3 },
            { x: 1, y: 2 },
            { x: 4, y: 4 },
            { x: 5, y: 2 },
            { x: 3, y: 5 },
        ],
        exit: { x: 7, y: 7 }, // Позиция выхода
        gridSize: 10          // Размер сетки
    });

    // История действий
    const [actionHistory, setActionHistory] = useState([]);

    // Обработчик для логирования действий
    const logAction = useCallback((action) => {
        setActionHistory(prev => [action, ...prev.slice(0, 9)]);
        // Обновляем также глобальное состояние для взаимодействия с внешними компонентами
        if (typeof window !== 'undefined' && window.signalVisualizerData) {
            window.signalVisualizerData.lastAction = action;
        }
    }, []);

    /**
     * Проверяет, есть ли стена в указанной позиции
     * @param {Object} position - Позиция для проверки {x, y}
     * @returns {boolean} - true, если есть стена
     */
    const isWallAt = useCallback((position) => {
        return environmentState.walls.some(
            wall => wall.x === position.x && wall.y === position.y
        );
    }, [environmentState.walls]);

    /**
     * Проверяет, находится ли позиция в пределах сетки
     * @param {Object} position - Позиция для проверки {x, y}
     * @returns {boolean} - true, если позиция в пределах сетки
     */
    const isInBounds = useCallback((position) => {
        return position.x >= 0 && 
               position.x < environmentState.gridSize && 
               position.y >= 0 && 
               position.y < environmentState.gridSize;
    }, [environmentState.gridSize]);

    /**
     * Получает позицию перед игроком в зависимости от направления
     * @param {number} steps - Количество шагов вперед (по умолчанию 1)
     * @returns {Object} - Позиция {x, y}
     */
    const getPositionInFront = useCallback((steps = 1) => {
        const { position, direction } = playerState;
        const newPosition = { ...position };

        switch (direction) {
            case 'north':
                newPosition.y -= steps;
                break;
            case 'east':
                newPosition.x += steps;
                break;
            case 'south':
                newPosition.y += steps;
                break;
            case 'west':
                newPosition.x -= steps;
                break;
        }

        return newPosition;
    }, [playerState]);

    /**
     * Сбрасывает состояние сцены в начальное
     */
    const resetScene = useCallback(() => {
        setPlayerState({
            position: { x: 2, y: 2 },
            direction: 'east',
            isJumping: false
        });
        
        // Обновляем также глобальное состояние для визуализатора
        if (typeof window !== 'undefined' && window.signalVisualizerData) {
            window.signalVisualizerData.playerState = {
                position: { x: 2, y: 2 },
                direction: 'east',
                isJumping: false
            };
            window.signalVisualizerData.notifyUpdateCallbacks();
        }
        
        logAction('Сцена сброшена в исходное состояние');
    }, [logAction]);

    // Набор методов для выполнения действий в сцене
    // Эти методы будут использоваться нодами
    const nodeActions = {
        /**
         * Перемещает игрока вперед
         * @param {number} steps - Количество шагов
         * @returns {Object} - Результат операции
         */
        movePlayerNode: useCallback((steps = 1) => {
            const newPosition = getPositionInFront(steps);
            const canMove = isInBounds(newPosition) && !isWallAt(newPosition);
            
            if (canMove) {
                // Обновляем позицию игрока
                setPlayerState(prev => ({
                    ...prev,
                    position: newPosition
                }));
                
                // Обновляем также глобальное состояние для визуализатора
                if (typeof window !== 'undefined' && window.signalVisualizerData) {
                    window.signalVisualizerData.playerState.position = newPosition;
                    window.signalVisualizerData.notifyUpdateCallbacks();
                }
                
                logAction(`Игрок переместился на ${steps} шаг(ов)`);
            } else {
                logAction(`Не удалось переместиться - путь заблокирован`);
            }
            
            return {
                success: canMove,
                steps: steps,
                position: canMove ? newPosition : playerState.position,
                direction: playerState.direction
            };
        }, [getPositionInFront, isInBounds, isWallAt, playerState, logAction]),
        
        /**
         * Поворачивает игрока в указанном направлении
         * @param {string} direction - Направление поворота ('left' или 'right')
         * @returns {Object} - Результат операции
         */
        turnPlayerNode: useCallback((direction) => {
            // Карта поворотов для каждого направления
            const turnMap = {
                left: { // Поворот налево (против часовой стрелки)
                    north: 'west',
                    west: 'south',
                    south: 'east',
                    east: 'north'
                },
                right: { // Поворот направо (по часовой стрелке)
                    north: 'east',
                    east: 'south',
                    south: 'west',
                    west: 'north'
                }
            };
            
            // Текущее направление
            const previousDirection = playerState.direction;
            // Новое направление после поворота
            const newDirection = turnMap[direction][previousDirection];
            
            if (!newDirection) {
                console.error(`Некорректное направление поворота или текущее направление: ${direction}, ${previousDirection}`);
                console.log('Карта поворотов:', turnMap);
                console.log('Текущие значения:', { direction, previousDirection });
                return {
                    success: false,
                    direction: direction,
                    previousDirection: previousDirection,
                    newDirection: previousDirection // Не изменяем
                };
            }
            
            // Обновляем направление игрока
            setPlayerState(prev => ({
                ...prev,
                direction: newDirection
            }));
            
            // Обновляем также глобальное состояние для визуализатора
            if (typeof window !== 'undefined' && window.signalVisualizerData) {
                window.signalVisualizerData.playerState.direction = newDirection;
                window.signalVisualizerData.notifyUpdateCallbacks();
            }
            
            const dirText = direction === 'left' ? 'налево' : 'направо';
            logAction(`Игрок повернулся ${dirText}, новое направление: ${newDirection}`);
            
            return {
                success: true,
                direction: direction,
                previousDirection: previousDirection,
                newDirection: newDirection
            };
        }, [playerState.direction, logAction]),
        
        /**
         * Выполняет прыжок игрока
         * @returns {Object} - Результат операции
         */
        jumpPlayerNode: useCallback(() => {
            // Обновляем состояние прыжка
            setPlayerState(prev => ({
                ...prev,
                isJumping: true
            }));
            
            // Обновляем также глобальное состояние для визуализатора
            if (typeof window !== 'undefined' && window.signalVisualizerData) {
                window.signalVisualizerData.playerState.isJumping = true;
                window.signalVisualizerData.notifyUpdateCallbacks();
                
                // Через некоторое время возвращаем в обычное состояние
                setTimeout(() => {
                    window.signalVisualizerData.playerState.isJumping = false;
                    window.signalVisualizerData.notifyUpdateCallbacks();
                    
                    setPlayerState(prev => ({
                        ...prev,
                        isJumping: false
                    }));
                }, 1000);
            }
            
            logAction('Игрок выполнил прыжок');
            
            return {
                success: true,
                height: 1,
                position: playerState.position
            };
        }, [playerState.position, logAction]),
        
        /**
         * Проверяет наличие стены перед игроком
         * @returns {Object} - Результат операции
         */
        checkWallNode: useCallback(() => {
            const positionInFront = getPositionInFront();
            const wallExists = !isInBounds(positionInFront) || isWallAt(positionInFront);
            
            logAction(`Проверка стены впереди: ${wallExists ? "есть стена" : "путь свободен"}`);
            
            return {
                wallExists: wallExists,
                position: playerState.position,
                direction: playerState.direction,
                obstaclePosition: wallExists ? positionInFront : null
            };
        }, [getPositionInFront, isInBounds, isWallAt, playerState, logAction]),
        
        /**
         * Проверяет, достиг ли игрок выхода
         * @returns {Object} - Результат операции
         */
        checkExitNode: useCallback(() => {
            const { position } = playerState;
            const { exit } = environmentState;
            const isReached = position.x === exit.x && position.y === exit.y;
            
            if (isReached) {
                logAction('Проверка выхода: выход достигнут!');
            } else {
                logAction('Проверка выхода: выход не достигнут');
            }
            
            return {
                isReached: isReached,
                position: position,
                exitPosition: exit
            };
        }, [playerState, environmentState, logAction])
    };

    /**
     * Получает текущее состояние игрока
     * @returns {Object} - Состояние игрока
     */
    const getPlayerState = useCallback(() => {
        return { ...playerState };
    }, [playerState]);

    /**
     * Получает текущее состояние карты
     * @returns {Object} - Состояние карты
     */
    const getMapState = useCallback(() => {
        return { ...environmentState };
    }, [environmentState]);

    // Синхронизация с глобальным объектом визуализатора при монтировании
    useEffect(() => {
        if (typeof window !== 'undefined' && window.signalVisualizerData) {
            // Инициализируем глобальное состояние
            window.signalVisualizerData.playerState = { ...playerState };
            window.signalVisualizerData.environmentState = { ...environmentState };
            
            // Обновляем колбэки
            window.signalVisualizerData.notifyUpdateCallbacks();
        }
    }, [playerState, environmentState]);

    // Подписываемся на сигналы для синхронизации состояния
    useEffect(() => {
        // Функция-обработчик сигналов
        const handleSignal = (signal) => {
            // Обновляем состояние на основе полученных сигналов
            // Это позволяет синхронизироваться с внешними источниками
            switch (signal.type) {
                case SIGNALS.PLAYER_MOVE:
                    if (signal.data.success && signal.data.position) {
                        setPlayerState(prev => ({
                            ...prev,
                            position: signal.data.position
                        }));
                    }
                    break;
                    
                case SIGNALS.PLAYER_TURN:
                    if (signal.data.newDirection) {
                        setPlayerState(prev => ({
                            ...prev,
                            direction: signal.data.newDirection
                        }));
                    }
                    break;
                    
                case SIGNALS.PLAYER_JUMP:
                    if (signal.data.success) {
                        setPlayerState(prev => ({
                            ...prev,
                            isJumping: true
                        }));
                        
                        // Через секунду возвращаем в обычное состояние
                        setTimeout(() => {
                            setPlayerState(prev => ({
                                ...prev,
                                isJumping: false
                            }));
                        }, 1000);
                    }
                    break;
            }
        };
        
        // Подписываемся на все сигналы
        const unsubscribe = subscribeToAllSignals(handleSignal);
        
        // Отписываемся при размонтировании
        return () => {
            unsubscribe();
        };
    }, []);

    // Значение контекста
    const contextValue = {
        // Состояние
        playerState,
        environmentState,
        actionHistory,
        
        // Методы
        resetScene,
        getPlayerState,
        getMapState,
        
        // Методы для нодов
        nodeActions
    };

    return (
        <Scene3DContext.Provider value={contextValue}>
            {children}
        </Scene3DContext.Provider>
    );
};

/**
 * Хук для использования контекста 3D сцены
 * @returns {Object} - Значение контекста сцены
 */
export const useScene3D = () => {
    const context = useContext(Scene3DContext);
    
    if (!context) {
        throw new Error('useScene3D должен использоваться внутри Scene3DProvider');
    }
    
    return context;
};

export default Scene3DContext;