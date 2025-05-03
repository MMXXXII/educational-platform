/**
 * Класс для управления данными между нодами
 * Отвечает за сбор входных данных и кэширование выходных значений
 */
class DataManager {
    /**
     * Создает новый менеджер данных
     * @param {Array} edges - Массив связей между нодами
     */
    constructor(edges) {
        this.edges = edges;
        this.inputCache = {};
        this.dataTransfers = [];
    }

    /**
     * Устанавливает массив связей
     * @param {Array} edges - Массив связей
     */
    setEdges(edges) {
        this.edges = edges;
    }

    /**
     * Очищает кэш и историю передачи данных
     */
    reset() {
        this.inputCache = {};
        this.dataTransfers = [];
    }

    /**
     * Сбор входных значений для нода из связей
     * @param {Object} node - Нод, для которого собираются входные значения
     * @returns {Object} - Объект с входными значениями
     */
    collectInputValues(node) {
        const inputValues = {};

        // Проверяем, есть ли у нода входные порты
        if (!node.data.inputs || node.data.inputs.length === 0) {
            return inputValues;
        }

        // Проходим по всем входным портам нода
        node.data.inputs.forEach(input => {
            const inputId = input.id;
            const inputName = input.name;

            // Находим все входящие связи к этому порту
            const incomingEdges = this.edges.filter(edge =>
                edge.target === node.id && edge.targetHandle === inputId
            );

            // Если есть входящая связь, получаем значение из источника
            if (incomingEdges.length > 0) {
                const sourceEdge = incomingEdges[0]; // Берем первую связь, если их несколько
                const sourceNode = sourceEdge.source;

                if (sourceNode) {
                    // Получаем имя выходного порта из источника
                    const sourceHandleId = sourceEdge.sourceHandle;
                    const outputName = sourceHandleId.replace('output-', '');

                    // Проверяем кэш выходных значений
                    const cacheKey = `${sourceNode}:${outputName}`;

                    if (this.inputCache[cacheKey] !== undefined) {
                        const value = this.inputCache[cacheKey];
                        inputValues[inputName] = value;

                        // Записываем информацию о передаче данных для анимации
                        this.dataTransfers.push({
                            edgeId: sourceEdge.id,
                            sourceNodeId: sourceNode,
                            targetNodeId: node.id,
                            sourceHandle: sourceHandleId,
                            targetHandle: inputId,
                            value: value,
                            timestamp: Date.now()
                        });
                    }
                }
            }
        });

        return inputValues;
    }

    /**
     * Сохраняет выходные значения нода в кэше
     * @param {Object} node - Нод, выходные значения которого сохраняются
     * @param {Object} outputs - Выходные значения нода
     */
    cacheOutputValues(node, outputs) {
        if (!outputs) {
            return;
        }

        Object.entries(outputs).forEach(([key, value]) => {
            // Пропускаем управляющие выходы (flow)
            if (key !== 'next' && key !== 'true' && key !== 'false' && key !== 'body') {
                const cacheKey = `${node.id}:${key}`;
                this.inputCache[cacheKey] = value;
            }
        });
    }

    /**
     * Получает историю передачи данных
     * @returns {Array} - Массив объектов с информацией о передаче данных
     */
    getDataTransfers() {
        return this.dataTransfers;
    }

    /**
     * Очищает историю передачи данных
     */
    clearDataTransfers() {
        this.dataTransfers = [];
    }

    /**
     * Проверяет, есть ли выходное значение в кэше
     * @param {string} nodeId - ID нода
     * @param {string} outputName - Имя выходного порта
     * @returns {boolean} - Есть ли значение в кэше
     */
    hasOutputValue(nodeId, outputName) {
        const cacheKey = `${nodeId}:${outputName}`;
        return this.inputCache[cacheKey] !== undefined;
    }

    /**
     * Получает выходное значение из кэша
     * @param {string} nodeId - ID нода
     * @param {string} outputName - Имя выходного порта
     * @returns {any} - Значение из кэша
     */
    getOutputValue(nodeId, outputName) {
        const cacheKey = `${nodeId}:${outputName}`;
        return this.inputCache[cacheKey];
    }
}

export default DataManager;