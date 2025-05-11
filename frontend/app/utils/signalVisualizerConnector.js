/**
 * Коннектор между системой сигналов и компонентом визуализации
 * Перенаправляет сигналы от нодов в визуализатор
 */
import { subscribeToAllSignals, SIGNALS } from './signalSystem';

// Проверяем, находимся ли мы в среде браузера
const isBrowser = typeof window !== 'undefined';

// Глобальный объект для обмена данными между системой сигналов и визуализатором
if (isBrowser) {
  window.signalVisualizerData = {
    // Начальное состояние игрока
    playerState: {
        position: { x: 2, y: 2 },
        direction: 'east',
        isJumping: false
    },

    // Состояние окружения
    environmentState: {
        walls: [
            { x: 2, y: 3 },
            { x: 1, y: 2 },
            { x: 4, y: 4 },
            { x: 5, y: 2 },
            { x: 3, y: 5 },
        ],
        exit: { x: 7, y: 7 }, // Позиция выхода
        gridSize: 10 // Размер сетки
    },

    // Последние действия и сигналы
    lastAction: 'Система запущена',
    lastSignals: [],

    // Колбэки для обновления визуализатора
    updateCallbacks: [],

    // Регистрирует функцию обновления
    registerUpdateCallback: (callback) => {
        if (isBrowser) {
            window.signalVisualizerData.updateCallbacks.push(callback);
        }
    },

    // Удаляет функцию обновления
    unregisterUpdateCallback: (callback) => {
        if (isBrowser) {
            window.signalVisualizerData.updateCallbacks =
                window.signalVisualizerData.updateCallbacks.filter(cb => cb !== callback);
        }
    },

    // Вызывает все зарегистрированные колбэки
    notifyUpdateCallbacks: () => {
        if (isBrowser) {
            window.signalVisualizerData.updateCallbacks.forEach(callback => {
                try {
                    callback(window.signalVisualizerData);
                } catch (error) {
                    console.error('Ошибка при вызове колбэка визуализатора:', error);
                }
            });
        }
    }
  };
}

/**
 * Инициализирует коннектор и начинает прослушивание сигналов
 */
export function initSignalVisualizerConnector() {
    // На сервере не инициализируем
    if (!isBrowser) {
        console.log('Коннектор не инициализирован - серверная среда');
        return null;
    }

    // Отписываемся от предыдущих сигналов при повторной инициализации
    if (window.signalVisualizerUnsubscribe) {
        window.signalVisualizerUnsubscribe();
    }

    // Подписываемся на все сигналы
    window.signalVisualizerUnsubscribe = subscribeToAllSignals(handleSignal);

    console.log('Коннектор визуализатора сигналов инициализирован');

    return window.signalVisualizerData;
}

/**
 * Обрабатывает полученный сигнал и обновляет данные визуализатора
 * @param {Object} signal - Полученный сигнал
 */
function handleSignal(signal) {
    if (!isBrowser) return;

    console.log('Коннектор получил сигнал:', signal.type, signal.data);

    // Добавляем сигнал в историю
    window.signalVisualizerData.lastSignals.unshift({
        type: signal.type,
        data: signal.data,
        timestamp: signal.timestamp || Date.now()
    });

    // Ограничиваем историю до 5 сигналов
    if (window.signalVisualizerData.lastSignals.length > 5) {
        window.signalVisualizerData.lastSignals.pop();
    }

    // Обрабатываем разные типы сигналов
    switch (signal.type) {
        case SIGNALS.PLAYER_MOVE:
            handleMoveSignal(signal.data);
            break;

        case SIGNALS.PLAYER_TURN:
            handleTurnSignal(signal.data);
            break;

        case SIGNALS.PLAYER_JUMP:
            handleJumpSignal(signal.data);
            break;

        case SIGNALS.WALL_CHECK:
            handleWallCheckSignal(signal.data);
            break;

        case SIGNALS.EXIT_CHECK:
            handleExitCheckSignal(signal.data);
            break;

        case SIGNALS.NODE_EXECUTED:
            // Общий сигнал о выполнении, обычно игнорируем
            break;

        default:
            window.signalVisualizerData.lastAction = `Получен неизвестный сигнал: ${signal.type}`;
            break;
    }

    // Уведомляем визуализатор об изменениях
    window.signalVisualizerData.notifyUpdateCallbacks();
}

/**
 * Обрабатывает сигнал перемещения
 * @param {Object} data - Данные сигнала
 */
function handleMoveSignal(data) {
    if (!isBrowser) return;

    window.signalVisualizerData.lastAction =
        `Перемещение: ${data.steps} шаг(ов), ${data.success ? 'успешно' : 'заблокировано'}`;

    if (data.success) {
        const playerState = window.signalVisualizerData.playerState;
        const direction = playerState.direction;
        const steps = data.steps || 1;

        // Вычисляем новую позицию на основе направления
        const newPosition = { ...playerState.position };

        switch (direction) {
            case 'north':
                newPosition.y = Math.max(0, newPosition.y - steps);
                break;
            case 'east':
                newPosition.x = Math.min(window.signalVisualizerData.environmentState.gridSize - 1, newPosition.x + steps);
                break;
            case 'south':
                newPosition.y = Math.min(window.signalVisualizerData.environmentState.gridSize - 1, newPosition.y + steps);
                break;
            case 'west':
                newPosition.x = Math.max(0, newPosition.x - steps);
                break;
        }

        // Проверяем, не столкнемся ли мы со стеной
        const willHitWall = window.signalVisualizerData.environmentState.walls.some(
            wall => wall.x === newPosition.x && wall.y === newPosition.y
        );

        if (!willHitWall) {
            window.signalVisualizerData.playerState.position = newPosition;
        } else {
            window.signalVisualizerData.lastAction =
                `Перемещение заблокировано: впереди стена`;
        }
    }
}

/**
 * Обрабатывает сигнал поворота
 * @param {Object} data - Данные сигнала
 */
function handleTurnSignal(data) {
    if (!isBrowser) return;

    // Исправлено: более четкий вывод направления поворота
    window.signalVisualizerData.lastAction =
        `Поворот: ${data.direction === 'left' ? 'налево' : 'направо'}, новое направление: ${data.newDirection || 'неизвестно'}`;

    // Обновляем направление игрока
    if (data.newDirection) {
        console.log(`Поворот: обновление направления на ${data.newDirection} (из данных сигнала)`);
        window.signalVisualizerData.playerState.direction = data.newDirection;
    } else {
        // Если newDirection не указано, определяем сами
        const directions = ['north', 'east', 'south', 'west'];
        const currentDirection = window.signalVisualizerData.playerState.direction;
        const currentIndex = directions.indexOf(currentDirection);

        if (currentIndex !== -1) {
            // ИСПРАВЛЕНО: корректная логика поворота
            // Поворот по часовой стрелке (направо): north -> east -> south -> west -> north
            // Поворот против часовой стрелки (налево): north -> west -> south -> east -> north
            const nextIndex = data.direction === 'right'
                ? (currentIndex + 1) % 4  // По часовой стрелке
                : (currentIndex + 3) % 4; // Против часовой стрелки (+3 вместо -1, чтобы избежать отрицательных индексов)

            const newDirection = directions[nextIndex];
            console.log(`Поворот: вычисленное направление ${currentDirection} -> ${newDirection} (${data.direction})`);
            window.signalVisualizerData.playerState.direction = newDirection;
        }
    }
}

/**
 * Обрабатывает сигнал прыжка
 * @param {Object} data - Данные сигнала
 */
function handleJumpSignal(data) {
    if (!isBrowser) return;

    window.signalVisualizerData.lastAction =
        `Прыжок: ${data.success ? 'успешно' : 'не удалось'}`;

    if (data.success) {
        // Запускаем анимацию прыжка
        window.signalVisualizerData.playerState.isJumping = true;

        // Возвращаем в обычное состояние через секунду
        setTimeout(() => {
            window.signalVisualizerData.playerState.isJumping = false;
            window.signalVisualizerData.notifyUpdateCallbacks();
        }, 1000);
    }
}

/**
 * Обрабатывает сигнал проверки стены
 * @param {Object} data - Данные сигнала
 */
function handleWallCheckSignal(data) {
    if (!isBrowser) return;

    window.signalVisualizerData.lastAction =
        `Проверка стены: ${data.result ? 'стена есть' : 'путь свободен'}`;
}

/**
 * Обрабатывает сигнал проверки выхода
 * @param {Object} data - Данные сигнала
 */
function handleExitCheckSignal(data) {
    if (!isBrowser) return;

    window.signalVisualizerData.lastAction =
        `Проверка выхода: ${data.isReached ? 'выход достигнут!' : 'выход не достигнут'}`;

    // Если выход достигнут, можно показать сообщение
    if (data.isReached) {
        setTimeout(() => {
            if (isBrowser && window.alert) {
                window.alert('Поздравляем! Выход достигнут!');
            }
        }, 500);
    }
}

/**
 * Сбрасывает позицию игрока в исходное состояние
 * и уведомляет все компоненты об изменении
 */
export function resetPlayerState() {
    if (!isBrowser) {
        console.log('Сброс позиции не выполнен - серверная среда');
        return false;
    }

    console.log('Сброс позиции игрока через signalVisualizerConnector...');

    // Устанавливаем начальные значения
    window.signalVisualizerData.playerState = {
        position: { x: 2, y: 2 }, // Начальная позиция
        direction: 'east',        // Начальное направление
        isJumping: false          // В прыжке или нет
    };

    // Устанавливаем текст действия
    window.signalVisualizerData.lastAction = 'Позиция сброшена в исходное состояние';

    // Принудительно уведомляем всех подписчиков
    window.signalVisualizerData.notifyUpdateCallbacks();

    console.log('Позиция игрока сброшена в исходное состояние', window.signalVisualizerData.playerState);
    return true;
}

// Автоматически инициализируем коннектор при импорте только в браузере
if (isBrowser) {
    initSignalVisualizerConnector();
}

export default {
    initSignalVisualizerConnector,
    getVisualizerData: () => isBrowser ? window.signalVisualizerData : null,
    resetPlayerState
};