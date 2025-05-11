/**
 * Система сигналов для 3D нодов
 * Позволяет нодам отправлять сигналы и подписываться на них
 */

// Константы сигналов
export const SIGNALS = {
    // Сигналы игрока
    PLAYER_MOVE: 'PLAYER_MOVE_SIGNAL',
    PLAYER_TURN: 'PLAYER_TURN_SIGNAL',
    PLAYER_JUMP: 'PLAYER_JUMP_SIGNAL',
    
    // Сигналы проверок
    WALL_CHECK: 'WALL_CHECK_SIGNAL',
    EXIT_CHECK: 'EXIT_CHECK_SIGNAL',
    
    // Системные сигналы
    NODE_EXECUTED: 'NODE_EXECUTED_SIGNAL'
};

// Хранилище подписчиков
const subscribers = new Map();

/**
 * Отправляет сигнал всем подписчикам
 * @param {string} signalType - Тип сигнала из SIGNALS
 * @param {Object} data - Данные сигнала
 * @param {Object} sender - Отправитель сигнала (обычно нод)
 */
export function sendSignal(signalType, data = {}, sender = null) {
    // Логируем отправку сигнала
    console.log(`[SignalSystem] Отправлен сигнал: ${signalType}`, data);
    
    // Создаем объект сигнала
    const signal = {
        type: signalType,
        data,
        sender,
        timestamp: Date.now()
    };
    
    // Отправляем DOM-событие для визуализатора
    if (typeof window !== 'undefined' && window.document) {
        try {
            const event = new CustomEvent('signal', { 
                detail: signal,
                bubbles: true,
                cancelable: true 
            });
            window.dispatchEvent(event);
        } catch (error) {
            console.error('Ошибка при отправке события сигнала:', error);
        }
    }
    
    // Если нет подписчиков на данный сигнал, просто выходим
    if (!subscribers.has(signalType)) {
        return;
    }
    
    // Отправляем сигнал всем подписчикам
    const signalSubscribers = subscribers.get(signalType);
    signalSubscribers.forEach(callback => {
        try {
            callback(signal);
        } catch (error) {
            console.error(`[SignalSystem] Ошибка в обработчике сигнала ${signalType}:`, error);
        }
    });
}

/**
 * Подписывается на сигнал
 * @param {string} signalType - Тип сигнала из SIGNALS
 * @param {Function} callback - Функция-обработчик сигнала
 * @returns {Function} - Функция для отписки
 */
export function subscribeToSignal(signalType, callback) {
    // Если нет подписчиков на данный сигнал, создаем новый массив
    if (!subscribers.has(signalType)) {
        subscribers.set(signalType, new Set());
    }
    
    // Добавляем подписчика
    const signalSubscribers = subscribers.get(signalType);
    signalSubscribers.add(callback);
    
    // Возвращаем функцию для отписки
    return () => {
        signalSubscribers.delete(callback);
        // Если подписчиков не осталось, удаляем массив
        if (signalSubscribers.size === 0) {
            subscribers.delete(signalType);
        }
    };
}

/**
 * Подписывается на все сигналы
 * @param {Function} callback - Функция-обработчик всех сигналов
 * @returns {Function} - Функция для отписки
 */
export function subscribeToAllSignals(callback) {
    const unsubscribers = Object.values(SIGNALS).map(signalType => 
        subscribeToSignal(signalType, callback)
    );
    
    // Возвращаем функцию для отписки от всех сигналов
    return () => {
        unsubscribers.forEach(unsubscribe => unsubscribe());
    };
}

// Инициализация глобальных переменных для тестирования в браузере
if (typeof window !== 'undefined') {
    window.SIGNALS = SIGNALS;
    
    // Создаем глобальную функцию для отправки тестовых сигналов
    window.sendTestSignal = (type, data) => {
        console.log('Отправка тестового сигнала:', type, data);
        sendSignal(type, data, { source: 'test' });
    };
}

// Экспортируем по умолчанию объект с всеми функциями
export default {
    SIGNALS,
    sendSignal,
    subscribeToSignal,
    subscribeToAllSignals
};