import BaseNode from '../BaseNode';
import { v4 as uuidv4 } from 'uuid';
import { sendSignal, SIGNALS } from '../../utils/signalSystem';

/**
 * ExitReachedNode - нод для проверки достижения выхода
 */
export class ExitReachedNode extends BaseNode {
    /**
     * @param {string} id - Идентификатор нода
     * @param {Object} data - Данные нода
     */
    constructor(id = uuidv4(), data = {}) {
        super(id, 'exitReached', 'Выход достигнут', data);

        // Добавление портов
        this.addInput('flow', 'Flow', 'flow');  // Flow-вход для активации
        this.addInput('entity', 'Сущность', 'object');

        // Добавляем выходы для условного ветвления
        this.addOutput('true', 'Да', 'flow');  // Выход, если выход достигнут
        this.addOutput('false', 'Нет', 'flow'); // Выход, если выход не достигнут
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
            if (context.scene3d && typeof context.scene3d.nodeActions?.checkExitNode === 'function') {
                // Используем контекст сцены для проверки достижения выхода
                const result = context.scene3d.nodeActions.checkExitNode();
                
                // Записываем результат в состояние нода для отображения
                this.state = {
                    isReached: result.isReached,
                    position: result.position,
                    exitPosition: result.exitPosition
                };
                
                // Отправляем сигнал о проверке выхода
                sendSignal(SIGNALS.EXIT_CHECK, result, this);
                
                // Выводим информацию в консоль
                if (context) {
                    const exitText = result.isReached ? "достигнут" : "не достигнут";
                    context.log('output', `Проверка выхода: выход ${exitText}`);
                    
                    // Если выход достигнут, также выводим поздравление
                    if (result.isReached) {
                        context.log('output', `Поздравляем! Выход успешно достигнут!`);
                    }
                }
                
                // Отправляем общий сигнал о выполнении нода
                sendSignal(SIGNALS.NODE_EXECUTED, {
                    nodeType: this.type,
                    nodeId: this.id,
                    operation: 'exitCheck',
                    result: result.isReached
                }, this);
                
                // Возвращаем результат и активируем соответствующий выход
                return {
                    ...(result.isReached ? { true: true } : { false: true }),
                    result: result.isReached
                };
            } else {
                // Если контекст сцены недоступен, используем данные визуализатора
                let isReached = false;
                let position = { x: 0, y: 0 };
                let exitPosition = { x: 10, y: 10 };
                
                // Если есть визуализатор, получаем данные из него
                if (typeof window !== 'undefined' && window.signalVisualizerData) {
                    const playerState = window.signalVisualizerData.playerState;
                    const exit = window.signalVisualizerData.environmentState.exit;
                    
                    position = playerState.position;
                    exitPosition = exit;
                    
                    // Проверяем, находится ли игрок на выходе
                    isReached = position.x === exit.x && position.y === exit.y;
                } else {
                    // Если визуализатора нет, просто рандомизируем результат для тестирования
                    isReached = Math.random() < 0.3;
                }
                
                // Записываем результат в состояние нода для отображения
                this.state = {
                    isReached: isReached,
                    position: position,
                    exitPosition: exitPosition
                };
                
                // Создаем объект результата
                const result = {
                    isReached: isReached,
                    position: position,
                    exitPosition: exitPosition
                };
                
                // Отправляем сигнал о проверке выхода
                sendSignal(SIGNALS.EXIT_CHECK, result, this);
                
                // Выводим информацию в консоль
                if (context) {
                    const exitText = isReached ? "достигнут" : "не достигнут";
                    context.log('output', `Проверка выхода: выход ${exitText}`);
                    
                    // Если выход достигнут, также выводим поздравление
                    if (isReached) {
                        context.log('output', `Поздравляем! Выход успешно достигнут!`);
                    }
                }
                
                // Отправляем общий сигнал о выполнении нода
                sendSignal(SIGNALS.NODE_EXECUTED, {
                    nodeType: this.type,
                    nodeId: this.id,
                    operation: 'exitCheck',
                    result: isReached
                }, this);
                
                // Возвращаем результат и активируем соответствующий выход
                return {
                    ...(isReached ? { true: true } : { false: true }),
                    result: isReached
                };
            }
        } catch (error) {
            console.error("Ошибка в ноде проверки выхода:", error);
            
            if (context) {
                context.log('error', `Ошибка в ноде "Выход достигнут": ${error.message}`);
            }
            
            // Отправляем сигнал об ошибке
            sendSignal(SIGNALS.NODE_EXECUTED, {
                nodeType: this.type,
                nodeId: this.id,
                operation: 'exitCheck',
                error: error.message,
                result: false
            }, this);
            
            throw error;
        }
    }
}