import BaseNode from '../BaseNode';
import { v4 as uuidv4 } from 'uuid';
import { sendSignal, SIGNALS } from '../../utils/signalSystem';

/**
 * PlayerNode - нод, представляющий игрока на сцене
 * Используется для отображения текущего состояния игрока
 */
export class PlayerNode extends BaseNode {
    /**
     * @param {string} id - Идентификатор нода
     * @param {Object} data - Данные нода
     */
    constructor(id = uuidv4(), data = {}) {
        super(id, 'player', 'Игрок', {
            ...data
        });

        // Добавление портов
        this.addInput('flow', 'Flow', 'flow');  // Flow-вход для активации
        this.addOutput('flow', 'Flow', 'flow');  // Flow-выход для продолжения выполнения
        this.addOutput('actions', 'Действия', 'List');  // Flow-выход для продолжения выполнения
        this.addOutput('direction', 'Направление', 'string');
    }

    /**
     * Выполняет логику нода
     * @param {Object} inputValues - Входные значения
     * @param {Object} context - Контекст выполнения
     * @returns {Object} - Выходные значения
     */
    execute(inputValues, context) {
        try {
            let playerState = { position: { x: 0, y: 0 }, direction: 'east' };
            let mapState = { walls: [], exit: { x: 0, y: 0 } };
            
            // Проверяем наличие контекста 3D сцены
            if (context.scene3d) {
                try {
                    // Получаем текущее состояние игрока из контекста сцены
                    playerState = context.scene3d.getPlayerState();
                    mapState = context.scene3d.getMapState();
                    
                    // Записываем информацию в состояние нода для отображения
                    this.state = {
                        position: playerState.position,
                        direction: playerState.direction,
                        mapState: mapState
                    };
                    
                    // Отображаем информацию в консоли
                    context.log('output', `Игрок: позиция (${playerState.position.x}, ${playerState.position.y}), направление: ${playerState.direction}`);
                    
                    return {
                        flow: true,  // Сигнал для продолжения выполнения
                        position: playerState.position,
                        direction: playerState.direction
                    };
                } catch (error) {
                    console.error('Ошибка при получении данных из контекста сцены:', error);
                    // Продолжаем выполнение с альтернативным вариантом
                }
            }
            
            // Альтернативный вариант, если контекст сцены недоступен
            // Пытаемся получить данные из визуализатора
            if (typeof window !== 'undefined' && window.signalVisualizerData) {
                playerState = window.signalVisualizerData.playerState;
                mapState = window.signalVisualizerData.environmentState;
            }
            
            // Записываем информацию в состояние нода для отображения
            this.state = {
                position: playerState.position,
                direction: playerState.direction,
                mapState: mapState
            };
            
            // Отображаем информацию в консоли
            if (context) {
                context.log('output', `Игрок: позиция (${playerState.position.x}, ${playerState.position.y}), направление: ${playerState.direction}`);
            }
            
            // Создаем объект данных для отправки
            const playerData = {
                position: playerState.position,
                direction: playerState.direction,
                mapState: mapState
            };
            
            // Отправляем общий сигнал о выполнении нода
            sendSignal(SIGNALS.NODE_EXECUTED, {
                nodeType: this.type,
                nodeId: this.id,
                operation: 'playerStatus',
                result: playerData
            }, this);
            
            return {
                flow: true,  // Сигнал для продолжения выполнения
                position: playerState.position,
                direction: playerState.direction
            };
        } catch (error) {
            console.error("Ошибка в ноде игрока:", error);
            
            if (context) {
                context.log('error', `Ошибка в ноде "Игрок": ${error.message}`);
            }
            
            // Отправляем сигнал об ошибке
            sendSignal(SIGNALS.NODE_EXECUTED, {
                nodeType: this.type,
                nodeId: this.id,
                operation: 'playerStatus',
                error: error.message,
                result: false
            }, this);
            
            throw error;
        }
    }
}