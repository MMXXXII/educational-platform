import BaseNode from '../BaseNode';
import { v4 as uuidv4 } from 'uuid';
import { sendSignal, SIGNALS } from '../../utils/signalSystem';

/**
 * JumpNode - нод для выполнения прыжка
 */
export class JumpNode extends BaseNode {
    /**
     * @param {string} id - Идентификатор нода
     * @param {Object} data - Данные нода
     */
    constructor(id = uuidv4(), data = {}) {
        super(id, 'jump', 'Прыжок', data);

        // Добавление портов
        this.addInput('flow', 'Flow', 'flow');  // Flow-вход для активации

        this.addOutput('flow', 'Flow', 'flow');  // Flow-выход для продолжения выполнения
        this.addOutput('success', 'Успех', 'boolean');  // Успешно ли выполнен прыжок
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
            if (context.scene3d && typeof context.scene3d.nodeActions?.jumpPlayerNode === 'function') {
                // Используем контекст сцены для выполнения прыжка
                const result = context.scene3d.nodeActions.jumpPlayerNode();
                
                // Обновляем состояние нода для отображения
                this.state = {
                    success: result.success,
                    executed: true
                };
                
                // Отправляем сигнал о прыжке
                sendSignal(SIGNALS.PLAYER_JUMP, result, this);
                
                // Выводим информацию в консоль
                if (context) {
                    const message = result.success ? "Выполнен прыжок" : "Не удалось выполнить прыжок";
                    context.log('output', message);
                }
                
                // Отправляем общий сигнал о выполнении нода
                sendSignal(SIGNALS.NODE_EXECUTED, {
                    nodeType: this.type,
                    nodeId: this.id,
                    operation: 'jump',
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
                
                // Если есть визуализатор, получаем данные из него и выполняем прыжок
                if (typeof window !== 'undefined' && window.signalVisualizerData) {
                    position = window.signalVisualizerData.playerState.position;
                    
                    // Устанавливаем состояние прыжка
                    window.signalVisualizerData.playerState.isJumping = true;
                    window.signalVisualizerData.notifyUpdateCallbacks();
                    
                    // Через секунду возвращаем в обычное состояние
                    setTimeout(() => {
                        window.signalVisualizerData.playerState.isJumping = false;
                        window.signalVisualizerData.notifyUpdateCallbacks();
                    }, 1000);
                }
                
                // Обновляем состояние нода для отображения
                this.state = {
                    success: success,
                    executed: true
                };
                
                // Создаем объект результата
                const result = {
                    success: success,
                    height: 1,
                    position: position
                };
                
                // Отправляем сигнал о прыжке
                sendSignal(SIGNALS.PLAYER_JUMP, result, this);
                
                // Выводим информацию в консоль
                if (context) {
                    const message = success ? "Выполнен прыжок" : "Не удалось выполнить прыжок";
                    context.log('output', message);
                }
                
                // Для отладки выводим более подробную информацию в консоль браузера
                console.log(`Нод прыжка: success=${success}, height=${result.height}`);
                
                // Отправляем общий сигнал о выполнении нода
                sendSignal(SIGNALS.NODE_EXECUTED, {
                    nodeType: this.type,
                    nodeId: this.id,
                    operation: 'jump',
                    result: success
                }, this);
                
                return {
                    flow: true,  // Сигнал для продолжения выполнения
                    success: success
                };
            }
        } catch (error) {
            console.error("Ошибка в ноде прыжка:", error);
            
            if (context) {
                context.log('error', `Ошибка в ноде "Прыжок": ${error.message}`);
            }
            
            // Отправляем сигнал об ошибке
            sendSignal(SIGNALS.NODE_EXECUTED, {
                nodeType: this.type,
                nodeId: this.id,
                operation: 'jump',
                error: error.message,
                result: false
            }, this);
            
            throw error;
        }
    }
}