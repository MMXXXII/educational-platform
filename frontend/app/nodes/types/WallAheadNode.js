import BaseNode from '../BaseNode';
import { v4 as uuidv4 } from 'uuid';
import { sendSignal, SIGNALS } from '../../utils/signalSystem';

/**
 * WallAheadNode - нод для проверки стены впереди игрока
 */
export class WallAheadNode extends BaseNode {
    /**
     * @param {string} id - Идентификатор нода
     * @param {Object} data - Данные нода
     */
    constructor(id = uuidv4(), data = {}) {
        super(id, 'wallAhead', 'Стена впереди', data);

        // Добавление портов
        this.addInput('flow', 'Flow', 'flow');  // Flow-вход для активации
        this.addInput('entity', 'Сущность', 'object');

        // Добавляем выходы для условного ветвления
        this.addOutput('true', 'Да', 'flow');  // Выход, если стена есть
        this.addOutput('false', 'Нет', 'flow'); // Выход, если стены нет
        this.addOutput('result', 'Результат', 'boolean'); // Результат проверки
    }

    /**
     * Выполняет логику нода
     * @param {Object} inputValues - Входные значения
     * @param {Object} context - Контекст выполнения
     * @returns {Object} - Выходные значения
     */
    execute(inputValues, context) {
        try {
            // Проверяем наличие контекста 3D сцены
            if (context.scene3d && typeof context.scene3d.nodeActions?.checkWallNode === 'function') {
                // Используем контекст сцены для проверки наличия стены
                const result = context.scene3d.nodeActions.checkWallNode();
                
                // Записываем минимальный результат в состояние нода для отображения
                this.state = {
                    result: result.wallExists
                };
                
                // Отправляем сигнал о проверке стены
                sendSignal(SIGNALS.WALL_CHECK, result, this);
                
                // Отправляем общий сигнал о выполнении нода
                sendSignal(SIGNALS.NODE_EXECUTED, {
                    nodeType: this.type,
                    nodeId: this.id,
                    operation: 'wallCheck',
                    result: result.wallExists
                }, this);
                
                // Возвращаем результат и активируем соответствующий выход
                return {
                    ...(result.wallExists ? { true: true } : { false: true }),
                    result: result.wallExists
                };
            } else {
                // Если контекст сцены недоступен, используем данные визуализатора
                let wallExists = false;
                let position = { x: 0, y: 0 };
                let direction = 'east';
                let positionInFront = { x: 0, y: 0 };
                
                // Если есть визуализатор, получаем данные из него
                if (typeof window !== 'undefined' && window.signalVisualizerData) {
                    const playerState = window.signalVisualizerData.playerState;
                    const walls = window.signalVisualizerData.environmentState.walls;
                    const gridSize = window.signalVisualizerData.environmentState.gridSize;
                    
                    position = playerState.position;
                    direction = playerState.direction;
                    
                    // Вычисляем позицию перед игроком в зависимости от направления
                    positionInFront = { ...position };
                    
                    switch (direction) {
                        case 'north':
                            positionInFront.y -= 1;
                            break;
                        case 'east':
                            positionInFront.x += 1;
                            break;
                        case 'south':
                            positionInFront.y += 1;
                            break;
                        case 'west':
                            positionInFront.x -= 1;
                            break;
                    }
                    
                    // Проверяем, выходит ли позиция за границы сетки
                    const isOutOfBounds = positionInFront.x < 0 || 
                                          positionInFront.x >= gridSize || 
                                          positionInFront.y < 0 || 
                                          positionInFront.y >= gridSize;
                    
                    // Проверяем, есть ли стена на этой позиции
                    const hasWall = walls.some(wall => 
                        wall.x === positionInFront.x && wall.y === positionInFront.y
                    );
                    
                    wallExists = isOutOfBounds || hasWall;
                } else {
                    // Если визуализатора нет, просто рандомизируем результат для тестирования
                    wallExists = Math.random() < 0.5;
                }
                
                // Записываем состояние для отображения
                this.state = {
                    result: wallExists
                };
                
                // Создаем объект результата
                const result = {
                    wallExists: wallExists,
                    position: position,
                    direction: direction,
                    obstaclePosition: wallExists ? positionInFront : null
                };
                
                // Отправляем сигнал о проверке стены
                sendSignal(SIGNALS.WALL_CHECK, result, this);
                
                // Упрощенный вывод в игровую консоль
                if (context) {
                    context.log('output', `Проверка стены впереди: ${wallExists ? "есть стена" : "путь свободен"}`);
                }
                
                // Для отладки выводим полную информацию в консоль браузера
                console.log("Результат проверки стены:", result);
                
                // Отправляем общий сигнал о выполнении нода
                sendSignal(SIGNALS.NODE_EXECUTED, {
                    nodeType: this.type,
                    nodeId: this.id,
                    operation: 'wallCheck',
                    result: wallExists
                }, this);
                
                // Возвращаем результат и активируем соответствующий выход
                return {
                    ...(wallExists ? { true: true } : { false: true }),
                    result: wallExists
                };
            }
        } catch (error) {
            console.error("Ошибка в ноде проверки стены:", error);
            
            if (context) {
                context.log('error', `Ошибка в ноде "Стена впереди": ${error.message}`);
            }
            
            // Отправляем сигнал об ошибке
            sendSignal(SIGNALS.NODE_EXECUTED, {
                nodeType: this.type,
                nodeId: this.id,
                operation: 'wallCheck',
                error: error.message,
                result: false
            }, this);
            
            throw error;
        }
    }
}