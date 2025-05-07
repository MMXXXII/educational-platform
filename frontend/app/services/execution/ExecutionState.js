/**
 * Класс, управляющий состоянием выполнения алгоритма
 * Хранит состояние выполнения, переменные, консоль вывода и т.д.
 */
class ExecutionState {
    /**
     * Создает новое состояние выполнения
     * @param {Object} globalVariables - Глобальные переменные
     * @param {Function} setGlobalVariable - Функция для установки глобальной переменной
     * @param {boolean} debug - Режим отладки
     */
    constructor(globalVariables = {}, setGlobalVariable = null, debug = false) {
        this.variables = {};
        this.console = [];
        this.activeNodeId = null;
        this.previousNodeId = null;
        this.visitedNodes = new Set();
        this.loopReturn = null; // ID цикла, в который нужно вернуться
        this.globalVariables = globalVariables || {};
        this.setGlobalVariable = setGlobalVariable || null;
        this.debug = debug;
    }

    /**
     * Сбрасывает состояние выполнения, сохраняя глобальные переменные
     */
    reset() {
        const globalVariables = this.globalVariables;
        const setGlobalVariable = this.setGlobalVariable;
        const debug = this.debug;

        this.variables = {};
        this.console = [];
        this.activeNodeId = null;
        this.previousNodeId = null;
        this.visitedNodes = new Set();
        
        // Очень важно сбросить состояние цикла!
        if (this.loopReturn) {
            console.log(`Сброс состояния возврата цикла с ID: ${this.loopReturn}`);
        }
        this.loopReturn = null;
        
        this.globalVariables = globalVariables;
        this.setGlobalVariable = setGlobalVariable;
        this.debug = debug;
        
        // Добавляем отладочное сообщение для подтверждения сброса
        this.debugLog("Состояние ExecutionState сброшено");
    }

    /**
     * Устанавливает активный нод
     * @param {string} nodeId - ID активного нода
     */
    setActiveNode(nodeId) {
        this.previousNodeId = this.activeNodeId;
        this.activeNodeId = nodeId;
        this.visitedNodes.add(nodeId);
    }

    /**
     * Добавляет сообщение в консоль
     * @param {string} type - Тип сообщения (output, error, debug)
     * @param {any} value - Значение сообщения
     */
    log(type, value) {
        this.console.push({
            type,
            value
        });
    }

    /**
     * Добавляет отладочное сообщение в консоль
     * @param {string} message - Сообщение для отладки
     * @param {any} data - Дополнительные данные
     */
    debugLog(message, data = null) {
        if (this.debug) {
            if (data) {
                console.log(`[ExecutionEngine] ${message}`, data);
                this.log('debug', `[DEBUG] ${message}: ${JSON.stringify(data).substring(0, 100)}`);
            } else {
                console.log(`[ExecutionEngine] ${message}`);
                this.log('debug', `[DEBUG] ${message}`);
            }
        }
    }

    /**
     * Проверяет, был ли посещен нод
     * @param {string} nodeId - ID нода
     * @returns {boolean} - Был ли посещен нод
     */
    isVisited(nodeId) {
        return this.visitedNodes.has(nodeId);
    }

    /**
     * Устанавливает нод возврата для цикла
     * @param {string} nodeId - ID нода цикла
     */
    setLoopReturn(nodeId) {
        this.loopReturn = nodeId;
        console.log(`Установлен возврат в цикл: ${nodeId}`);
    }

    /**
     * Очищает нод возврата для цикла
     */
    clearLoopReturn() {
        console.log(`Очищен возврат в цикл: ${this.loopReturn}`);
        this.loopReturn = null;
    }

    /**
     * Получает значение переменной
     * @param {string} name - Имя переменной
     * @returns {any} - Значение переменной
     */
    getVariable(name) {
        return this.variables[name];
    }

    /**
     * Устанавливает значение переменной
     * @param {string} name - Имя переменной
     * @param {any} value - Значение переменной
     */
    setVariable(name, value) {
        this.variables[name] = value;
    }

    /**
     * Создает копию состояния
     * @returns {Object} - Копия состояния
     */
    clone() {
        const clone = new ExecutionState(
            this.globalVariables,
            this.setGlobalVariable,
            this.debug
        );

        clone.variables = { ...this.variables };
        clone.console = [...this.console];
        clone.activeNodeId = this.activeNodeId;
        clone.previousNodeId = this.previousNodeId;
        clone.visitedNodes = new Set(this.visitedNodes);
        clone.loopReturn = this.loopReturn;

        return clone;
    }
}

export default ExecutionState;