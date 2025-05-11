import BaseNode from '../BaseNode';
import { v4 as uuidv4 } from 'uuid';
import { sendSignal, SIGNALS } from '../../utils/signalSystem';

/**
 * MoveNode - нод для перемещения игрока на сцене
 */
export class MoveNode extends BaseNode {
    /**
     * @param {string} id - Идентификатор нода
     * @param {Object} data - Данные нода
     * @param {number} data.steps - Количество шагов
     */
    constructor(id = uuidv4(), data = {}) {
        super(id, 'move', 'Движение', {
            steps: data.steps !== undefined ? data.steps : 1,
            ...data
        });

        // Добавление портов
        this.addInput('flow', 'Flow', 'flow');  // Flow-вход для активации
        this.addInput('entity', 'Сущность', 'Object');  // Flow-вход для активации

        // Упрощенная версия выходов
        this.addOutput('flow', 'Flow', 'flow');  // Flow-выход для продолжения выполнения
        this.addOutput('success', 'Успех', 'boolean');  // Успешно ли выполнилось движение
    }

    /**
     * Выполняет логику нода
     * @param {Object} inputValues - Входные значения
     * @param {Object} context - Контекст выполнения
     * @returns {Object} - Выходные значения
     */
    execute(inputValues, context) {
        try {
            // Определяем количество шагов
            const steps = this.data.steps;
            
            // Проверяем наличие контекста 3D сцены
            if (context.scene3d && typeof context.scene3d.nodeActions?.movePlayerNode === 'function') {
                // Используем контекст сцены для перемещения
                const result = context.scene3d.nodeActions.movePlayerNode(steps);
                
                // Обновляем состояние нода для отображения
                this.state = {
                    success: result.success,
                    steps: steps
                };
                
                // Отправляем сигнал о движении
                sendSignal(SIGNALS.PLAYER_MOVE, result, this);
                
                // Отправляем общий сигнал о выполнении нода
                sendSignal(SIGNALS.NODE_EXECUTED, {
                    nodeType: this.type,
                    nodeId: this.id,
                    operation: 'move',
                    result: result.success
                }, this);
                
                return {
                    flow: true,  // Сигнал для продолжения выполнения
                    success: result.success
                };
            } else {
                // Если контекст сцены недоступен, используем данные визуализатора
                let success = true;
                let position = { x: 0, y: 0 };
                let direction = 'east';
                
                // Если есть визуализатор, получаем данные из него
                if (typeof window !== 'undefined' && window.signalVisualizerData) {
                    const playerState = window.signalVisualizerData.playerState;
                    const walls = window.signalVisualizerData.environmentState.walls;
                    const gridSize = window.signalVisualizerData.environmentState.gridSize;
                    
                    position = {...playerState.position};
                    direction = playerState.direction;
                    
                    // Вычисляем новую позицию в зависимости от направления
                    const newPosition = {...position};
                    
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
                    
                    // Проверяем, выходит ли позиция за границы сетки
                    const isOutOfBounds = newPosition.x < 0 || 
                                         newPosition.x >= gridSize || 
                                         newPosition.y < 0 || 
                                         newPosition.y >= gridSize;
                    
                    // Проверяем, есть ли стена на этой позиции
                    const hasWall = walls.some(wall => 
                        wall.x === newPosition.x && wall.y === newPosition.y
                    );
                    
                    // Определяем, можно ли двигаться
                    success = !isOutOfBounds && !hasWall;
                    
                    // Если можно двигаться, обновляем позицию в визуализаторе
                    if (success) {
                        window.signalVisualizerData.playerState.position = newPosition;
                        window.signalVisualizerData.notifyUpdateCallbacks();
                        position = newPosition;
                    }
                }
                
                // Обновляем состояние нода для отображения
                this.state = {
                    success: success,
                    steps: steps
                };
                
                // Создаем объект результата
                const result = {
                    success: success,
                    steps: steps,
                    position: position,
                    direction: direction
                };
                
                // Отправляем сигнал о движении
                sendSignal(SIGNALS.PLAYER_MOVE, result, this);
                
                // Упрощенный вывод в консоль игры
                if (context) {
                    if (success) {
                        context.log('output', `Игрок переместился на ${steps} шаг(ов)`);
                    } else {
                        context.log('output', `Не удалось переместиться - путь заблокирован`);
                    }
                }
                
                // Отправляем общий сигнал о выполнении нода
                sendSignal(SIGNALS.NODE_EXECUTED, {
                    nodeType: this.type,
                    nodeId: this.id,
                    operation: 'move',
                    result: success
                }, this);
                
                return {
                    flow: true,  // Сигнал для продолжения выполнения
                    success: success
                };
            }
        } catch (error) {
            console.error("Ошибка в ноде движения:", error);
            
            if (context) {
                context.log('error', `Ошибка в ноде "Движение": ${error.message}`);
            }
            
            // Отправляем сигнал об ошибке
            sendSignal(SIGNALS.NODE_EXECUTED, {
                nodeType: this.type,
                nodeId: this.id,
                operation: 'move',
                error: error.message,
                result: false
            }, this);
            
            throw error;
        }
    }
}