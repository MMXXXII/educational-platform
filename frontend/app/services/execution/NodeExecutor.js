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

        // Хранилище для внешних контекстов
        this.externalContexts = {};
    }

    /**
     * Сбрасывает состояние исполнителя
     */
    reset() {
        this.executionPath = [];
    }

    /**
     * Устанавливает внешний контекст для нодов
     * @param {string} contextName - Имя контекста
     * @param {Object} contextValue - Значение контекста
     */
    setExternalContext(contextName, contextValue) {
        this.externalContexts[contextName] = contextValue;
    }

    /**
     * Выполняет отдельный нод
     * @param {Object} node - Нод для выполнения
     * @param {Object} graphManager - Менеджер графа для связей
     * @returns {Object} - Результат выполнения
     */
    executeNode(node, graphManager = null) {
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

            // Создаем контекст выполнения с внешними контекстами
            const executeContext = {
                ...this.state,
                ...this.externalContexts,
                // Гарантируем, что методы для управления циклами привязаны к state
                log: this.state.log?.bind(this.state),
                setLoopReturn: this.state.setLoopReturn?.bind(this.state),
                clearLoopReturn: this.state.clearLoopReturn?.bind(this.state)
            };

            // Выполняем нод
            const outputs = nodeRef.execute(inputValues, executeContext);

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
        // Получаем информацию о текущей итерации цикла
        let loopInfo = '';
        let iteration = -1;
        let totalIterations = -1;

        if (this.state.loopReturn) {
            const loopNodeId = this.state.loopReturn;
            // Попробуем найти нод цикла в доступных нодах
            const loopNode = this.state.nodes?.find(n => n.id === loopNodeId);

            if (loopNode && loopNode.data.nodeRef && loopNode.data.nodeRef.state) {
                iteration = loopNode.data.nodeRef.state.currentIteration;
                totalIterations = loopNode.data.nodeRef.state.count;
                loopInfo = ` (Итерация ${iteration + 1}/${totalIterations})`;
            } else {
                loopInfo = ' (в цикле)';
            }
        }

        if (node.data.type === 'math') {
            // Эта логика теперь перенесена в MathNode.execute для лучшего форматирования
            // Здесь можем добавить дополнительную информацию, если необходимо
        } else if (node.data.type === 'if') {
            // Логируем результат условия
            const result = node.data.nodeRef.state.result;
            this.state.log('output', `Условие: ${result ? 'ИСТИНА' : 'ЛОЖЬ'}${loopInfo}`);
        } else if (node.data.type === 'loop') {
            // Логируем информацию о цикле
            if (outputs.body) {
                const iteration = node.data.nodeRef.state.currentIteration;
                const count = node.data.nodeRef.state.count;
                this.state.log('output', `Цикл: начало итерации ${iteration + 1}/${count}`);
            } else if (outputs.next) {
                const count = node.data.nodeRef.state.count;
                this.state.log('output', `Цикл: завершён (${count} итераций)`);
            }
        } else if (node.data.type === 'print') {
            // Для нода print добавляем информацию об итерации
            if (this.state.loopReturn) {
                console.log(`Вывод в цикле (итерация=${iteration + 1}/${totalIterations})`);
            }
        }
    }

    /**
     * Получает текущую итерацию цикла
     * @param {string} loopNodeId - ID нода цикла
     * @returns {string} - Информация об итерации
     */
    getLoopIteration(loopNodeId) {
        const loopNode = this.getNodeById(loopNodeId);
        if (loopNode && loopNode.data && loopNode.data.nodeRef &&
            loopNode.data.nodeRef.state && loopNode.data.nodeRef.state.currentIteration !== undefined) {
            const iteration = loopNode.data.nodeRef.state.currentIteration + 1;
            const count = loopNode.data.nodeRef.state.count || 5;
            return `${iteration}/${count}`;
        }
        return '';
    }

    /**
     * Находит нод по ID
     * @param {string} nodeId - ID нода
     * @returns {Object|null} - Найденный нод или null
     */
    getNodeById(nodeId) {
        if (!nodeId) return null;

        // Пытаемся найти нод в текущем пути выполнения
        const executionNodes = this.executionPath.map(id => {
            const nodes = this.state.nodes || [];
            return nodes.find(node => node.id === id);
        }).filter(Boolean);

        return executionNodes.find(node => node.id === nodeId) || null;
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