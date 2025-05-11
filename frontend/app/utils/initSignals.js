/**
 * Инициализирует систему сигналов и глобальные переменные
 * Предназначен для импорта в точке входа приложения
 */
import { SIGNALS, sendSignal } from './signalSystem';
import { initSignalVisualizerConnector } from './signalVisualizerConnector';

/**
 * Инициализирует систему сигналов и делает SIGNALS доступными глобально
 */
export function initSignals() {
    // Инициализируем коннектор визуализатора
    initSignalVisualizerConnector();

    // Делаем SIGNALS и sendSignal доступными глобально для тестирования
    if (typeof window !== 'undefined') {
        window.SIGNALS = SIGNALS;
        window.sendTestSignal = (type, data) => {
            console.log('Отправка тестового сигнала:', type, data);
            sendSignal(type, data, { source: 'test' });
        };
    }

    console.log('Система сигналов инициализирована');

    return { SIGNALS, sendTestSignal: window.sendTestSignal };
}

// Для удобства автоматически инициализируем
// Это обеспечит, что после загрузки функция будет сразу доступна
export const signalsInitialized = initSignals();

export default {
    initSignals,
    signalsInitialized,
    SIGNALS
};