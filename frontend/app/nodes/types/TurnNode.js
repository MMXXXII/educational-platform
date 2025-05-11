import BaseNode from '../BaseNode';
import { v4 as uuidv4 } from 'uuid';
import { sendSignal, SIGNALS } from '../../utils/signalSystem';

/**
 * TurnNode - нод для поворота игрока на сцене
 */
export class TurnNode extends BaseNode {
    /**
     * @param {string} id - Идентификатор нода
     * @param {Object} data - Данные нода
     * @param {string} data.direction - Направление поворота ('left' или 'right')
     */
    constructor(id = uuidv4(), data = {}) {
        // Устанавливаем понятную метку в зависимости от направления
        const dirText = data.direction === 'left' ? 'налево' : 'направо';
        const nodeLabel = `Поворот ${dirText}`;
        
        super(id, 'turn', nodeLabel, {
            direction: data.direction || 'right',
            ...data
        });

        // Добавление портов
        this.addInput('flow', 'Flow', 'flow');  // Flow-вход для активации
        this.addInput('entity', 'Сущность', 'object');

        this.addOutput('flow', 'Flow', 'flow');  // Flow-выход для продолжения выполнения
        this.addOutput('direction', 'Направление', 'string');  // Новое направление игрока
    }

    /**
     * Выполняет логику нода
     * @param {Object} inputValues - Входные значения
     * @param {Object} context - Контекст выполнения
     * @returns {Object} - Выходные значения
     */
    execute(inputValues, context) {
        try {
            // Направление поворота: 'left' (налево) или 'right' (направо)
            const direction = this.data.direction;
            
            // Проверяем наличие контекста 3D сцены
            if (context.scene3d && typeof context.scene3d.nodeActions?.turnPlayerNode === 'function') {
                // Используем контекст сцены для выполнения поворота
                const result = context.scene3d.nodeActions.turnPlayerNode(direction);
                
                // Обновляем состояние нода
                this.state = {
                    turnDirection: direction,
                    previousDirection: result.previousDirection,
                    newDirection: result.newDirection
                };
                
                // Отправляем сигнал о повороте
                sendSignal(SIGNALS.PLAYER_TURN, result, this);
                
                // Отправляем общий сигнал о выполнении нода
                sendSignal(SIGNALS.NODE_EXECUTED, {
                    nodeType: this.type,
                    nodeId: this.id,
                    operation: 'turn',
                    direction: direction,
                    result: true
                }, this);
                
                return {
                    flow: true,  // Сигнал для продолжения выполнения
                    direction: result.newDirection
                };
            } else {
                // Если контекст сцены недоступен, используем карту поворотов
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
                
                // Получаем текущее направление из глобального состояния или из объекта игрока
                let currentDirection = 'east'; // Направление по умолчанию
                
                // Если есть визуализатор, используем его данные
                if (typeof window !== 'undefined' && window.signalVisualizerData) {
                    currentDirection = window.signalVisualizerData.playerState.direction || currentDirection;
                }
                
                // Определяем новое направление с использованием карты поворотов
                const newDirection = turnMap[direction][currentDirection];
                
                if (!newDirection) {
                    console.error(`Некорректное направление поворота или текущее направление: ${direction}, ${currentDirection}`);
                    console.log('Карта поворотов:', turnMap);
                    console.log('Текущие значения:', { direction, currentDirection });
                    
                    // Логируем ошибку в контекст
                    if (context) {
                        context.log('error', `Ошибка поворота: некорректное направление ${currentDirection}`);
                    }
                    
                    return {
                        flow: true,
                        direction: currentDirection
                    };
                }
                
                // Обновляем состояние нода
                this.state = {
                    turnDirection: direction,
                    previousDirection: currentDirection,
                    newDirection: newDirection
                };
                
                // Если есть визуализатор, обновляем его состояние
                if (typeof window !== 'undefined' && window.signalVisualizerData) {
                    window.signalVisualizerData.playerState.direction = newDirection;
                    window.signalVisualizerData.notifyUpdateCallbacks();
                }
                
                // Отправляем сигнал о повороте
                const result = {
                    direction,
                    previousDirection: currentDirection,
                    newDirection,
                    success: true
                };
                
                sendSignal(SIGNALS.PLAYER_TURN, result, this);
                
                // Вывод в консоль
                if (context) {
                    const directionText = direction === 'left' ? 'налево' : 'направо';
                    context.log('output', `Игрок повернулся ${directionText}, новое направление: ${newDirection}`);
                }
                
                // Отправляем общий сигнал о выполнении нода
                sendSignal(SIGNALS.NODE_EXECUTED, {
                    nodeType: this.type,
                    nodeId: this.id,
                    operation: 'turn',
                    direction: direction,
                    result: true
                }, this);
                
                return {
                    flow: true,  // Сигнал для продолжения выполнения
                    direction: newDirection
                };
            }
        } catch (error) {
            console.error("Ошибка в ноде поворота:", error);
            
            if (context) {
                context.log('error', `Ошибка в ноде "Поворот": ${error.message}`);
            }
            
            // Отправляем сигнал об ошибке
            sendSignal(SIGNALS.NODE_EXECUTED, {
                nodeType: this.type,
                nodeId: this.id,
                operation: 'turn',
                error: error.message,
                result: false
            }, this);
            
            throw error;
        }
    }

    /**
     * Переопределение метода setProperty для специфичной логики
     * @param {string} key - Ключ свойства
     * @param {any} value - Значение свойства 
     */
    setProperty(key, value) {
        super.setProperty(key, value);

        // Обновляем метку нода в зависимости от направления поворота
        if (key === 'direction') {
            const dirText = value === 'left' ? 'налево' : 'направо';
            this.label = `Поворот ${dirText}`;
        }

        return this;
    }
}