/**
 * Тестовый файл для приема и логирования сигналов от 3D нодов
 */
import { subscribeToAllSignals, SIGNALS } from './signalSystem';

// Класс тестового приемника сигналов
class SignalTester {
    constructor() {
        this.receivedSignals = [];
        this.unsubscribe = null;
        this.isListening = false;
    }

    /**
     * Запускает прослушивание сигналов
     */
    startListening() {
        if (this.isListening) {
            console.log('Прослушивание уже запущено');
            return;
        }

        // Подписываемся на все сигналы
        this.unsubscribe = subscribeToAllSignals(this.handleSignal.bind(this));
        this.isListening = true;
        console.log('[SignalTester] Прослушивание сигналов запущено');
    }

    /**
     * Останавливает прослушивание сигналов
     */
    stopListening() {
        if (!this.isListening) {
            console.log('Прослушивание не запущено');
            return;
        }

        // Отписываемся от всех сигналов
        if (this.unsubscribe) {
            this.unsubscribe();
        }

        this.isListening = false;
        console.log('[SignalTester] Прослушивание сигналов остановлено');
    }

    /**
     * Обрабатывает полученный сигнал
     * @param {Object} signal - Объект сигнала
     */
    handleSignal(signal) {
        // Добавляем сигнал в список полученных
        this.receivedSignals.push(signal);

        // Логируем информацию о сигнале
        console.log(`[SignalTester] Получен сигнал: ${signal.type}`);

        // Выводим более подробную информацию в зависимости от типа сигнала
        switch (signal.type) {
            case SIGNALS.PLAYER_MOVE:
                console.log(`  Игрок переместился: ${signal.data.steps} шаг(ов), успех: ${signal.data.success}`);
                break;
            case SIGNALS.PLAYER_TURN:
                console.log(`  Игрок повернулся: ${signal.data.direction}, новое направление: ${signal.data.newDirection}`);
                break;
            case SIGNALS.PLAYER_JUMP:
                console.log(`  Игрок прыгнул: успех: ${signal.data.success}`);
                break;
            case SIGNALS.WALL_CHECK:
                console.log(`  Проверка стены: ${signal.data.result ? 'стена есть' : 'пути свободен'}`);
                break;
            case SIGNALS.EXIT_CHECK:
                console.log(`  Проверка выхода: ${signal.data.isReached ? 'выход достигнут' : 'выход не достигнут'}`);
                break;
            default:
                console.log(`  Данные сигнала:`, signal.data);
                break;
        }
    }

    /**
     * Очищает список полученных сигналов
     */
    clearSignals() {
        this.receivedSignals = [];
        console.log('[SignalTester] Список сигналов очищен');
    }

    /**
     * Возвращает список всех полученных сигналов
     * @returns {Array} - Массив полученных сигналов
     */
    getReceivedSignals() {
        return this.receivedSignals;
    }

    /**
     * Возвращает количество полученных сигналов
     * @returns {number} - Количество сигналов
     */
    getSignalCount() {
        return this.receivedSignals.length;
    }
}

// Создаем и экспортируем экземпляр тестера
export const signalTester = new SignalTester();

// Автоматически запускаем прослушивание сигналов
signalTester.startListening();

// Экспортируем класс для возможности создания дополнительных тестеров
export default SignalTester;