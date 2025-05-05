/**
 * Класс для выполнения логики отдельных нодов
 * Отвечает за запуск выполнения нода, обработку результата и ошибок
 */
class NodeExecutor {
    /**
     * Создает экземпляр исполнителя нодов
     * @param {DataManager} dataManager - Менеджер данных
     * @param {ExecutionState} state - Состояние выполнения
     */
    constructor(dataManager, state) {
        this.dataManager = dataManager;
        this.state = state;
        this.executionPath = [];
    }

    /**
     * Сбрасывает состояние исполнителя
     */
    reset() {
        this.executionPath = [];
    }

    /**
     * Выполняет отдельный нод
     * @param {Object} node - Нод для выполнения
     * @returns {Object} - Результат выполнения
     */
    executeNode(node) {
        if (!node) {
            return {
                error: `Нод не найден`,
                nodeId: null
            };
        }

        try {
            // Обновляем активный нод в состоянии
            this.state.setActiveNode(node.id);
            this.executionPath.push(node.id);

            // Собираем входные значения для нода
            const inputValues = this.dataManager.collectInputValues(node);

            // Выполняем логику нода
            const nodeRef = node.data.nodeRef;
            if (!nodeRef) {
                throw new Error(`Нод с ID ${node.id} не имеет ссылки на реализацию`);
            }

            // Выполняем нод
            const outputs = nodeRef.execute(inputValues, this.state);

            // Сохраняем выходные значения в кэше
            this.dataManager.cacheOutputValues(node, outputs);

            // Добавляем информацию о выполнении для важных нодов
            this.logNodeExecution(node, inputValues, outputs);

            return {
                success: true,
                nodeId: node.id,
                outputs
            };
        } catch (error) {
            this.state.log('error', `Ошибка в ноде "${node.data.label}": ${error.message}`);

            return {
                error: error.message,
                nodeId: node.id
            };
        }
    }

    /**
     * Логирует информацию о выполнении важных нодов
     * @param {Object} node - Выполненный нод
     * @param {Object} inputValues - Входные значения нода
     * @param {Object} outputs - Выходные значения нода
     */
    logNodeExecution(node, inputValues, outputs) {
        if (node.data.type === 'math') {
            // Показываем промежуточные результаты вычислений
            const nodeRef = node.data.nodeRef;
            const operation = nodeRef.data.operation;
            
            const formatValue = (value) => {
                if (value === undefined || value === null) return 'не задано';
                return value;
            };
            
            // Получаем левый операнд (из inputValues или из настроек нода)
            let left = inputValues.left;
            if (left === undefined && nodeRef.data && nodeRef.data.leftValue !== undefined) {
                left = nodeRef.data.leftValue;
            }
            left = formatValue(left);
            
            // Получаем правый операнд (из inputValues или из настроек нода)
            let right = inputValues.right;
            if (right === undefined && nodeRef.data && nodeRef.data.rightValue !== undefined) {
                right = nodeRef.data.rightValue;
            }
            right = formatValue(right);
            
            const result = outputs.result;

            let opSymbol = '';
            switch (operation) {
                case 'add': opSymbol = '+'; break;
                case 'subtract': opSymbol = '-'; break;
                case 'multiply': opSymbol = '*'; break;
                case 'divide': opSymbol = '/'; break;
                case 'modulo': opSymbol = '%'; break;
            }

            this.state.log('debug', `Вычисление: ${left} ${opSymbol} ${right} = ${result}`);
        } else if (node.data.type === 'variable') {
            // Логируем изменение переменной
            const name = node.data.nodeRef.data.name;
            const value = outputs.value;
            this.state.debugLog(`Переменная ${name} = ${value}`);
        } else if (node.data.type === 'if') {
            // Логируем результат условия
            const result = node.data.nodeRef.state.result;
            this.state.debugLog(`Условие: ${result ? 'ИСТИНА' : 'ЛОЖЬ'}`);
        } else if (node.data.type === 'loop') {
            // Логируем итерацию цикла
            const iteration = node.data.nodeRef.state.currentIteration;
            const count = node.data.nodeRef.state.count;
            this.state.debugLog(`Цикл: итерация ${iteration + 1}/${count}`);
        }
    }

    /**
     * Получает путь выполнения
     * @returns {Array} - Массив ID нодов в порядке их выполнения
     */
    getExecutionPath() {
        return this.executionPath;
    }

    /**
     * Проверяет, есть ли нод в пути выполнения
     * @param {string} nodeId - ID нода для проверки
     * @returns {boolean} - Был ли нод выполнен
     */
    wasNodeExecuted(nodeId) {
        return this.executionPath.includes(nodeId);
    }
}

export default NodeExecutor;