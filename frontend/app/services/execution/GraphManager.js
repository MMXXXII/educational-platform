/**
 * Класс для управления графом нодов
 * Отвечает за анализ структуры графа, определение порядка выполнения,
 * поиск стартовых и следующих нодов
 */
class GraphManager {
    /**
     * Создает новый менеджер графа
     * @param {Array} nodes - Массив нодов
     * @param {Array} edges - Массив связей
     */
    constructor(nodes, edges) {
        this.nodes = nodes;
        this.edges = edges;
        this.startNodeIds = [];
        this.executionOrder = [];
    }

    /**
     * Устанавливает граф для анализа
     * @param {Array} nodes - Массив нодов
     * @param {Array} edges - Массив связей
     */
    setGraph(nodes, edges) {
        this.nodes = nodes;
        this.edges = edges;
        this.startNodeIds = [];
        this.executionOrder = [];
    }

    /**
     * Инициализирует граф, находит стартовые ноды
     * @returns {boolean} - Успешно ли инициализирован граф
     */
    initialize() {
        if (this.nodes.length === 0) {
            return false;
        }

        // Находим все стартовые ноды
        this.startNodeIds = this.findStartingNodes().map(node => node.id);

        if (this.startNodeIds.length === 0) {
            return false;
        }

        // Определяем порядок выполнения
        this.executionOrder = this.determineExecutionOrder();

        return true;
    }

    /**
     * Находит все возможные начальные ноды для выполнения
     * @returns {Array} - Массив начальных нодов
     */
    findStartingNodes() {
        // Создаем множество ID нодов с входными связями
        const nodesWithInputs = new Set(
            this.edges
                .filter(edge => edge.target)
                .map(edge => edge.target)
        );

        // Ноды без входных связей - автономные или начальные
        const autonomousNodes = this.nodes.filter(node => !nodesWithInputs.has(node.id));

        // Приоритет для начальных нодов - ноды получения данных (get_variable)
        const dataNodes = autonomousNodes.filter(node =>
            ['get_variable'].includes(node.data.type)
        );

        if (dataNodes.length > 0) {
            return dataNodes;
        }

        return autonomousNodes;
    }

    /**
     * Определяет порядок выполнения нодов на основе их зависимостей
     * @returns {Array} - Массив ID нодов в правильном порядке выполнения
     */
    determineExecutionOrder() {
        // Создаем граф зависимостей
        const graph = {};
        const inDegree = {};

        // Инициализируем каждый нод
        this.nodes.forEach(node => {
            graph[node.id] = [];
            inDegree[node.id] = 0;
        });

        // Строим зависимости
        this.edges.forEach(edge => {
            // source -> target означает, что target зависит от source
            if (graph[edge.source]) {
                graph[edge.source].push(edge.target);
                inDegree[edge.target] = (inDegree[edge.target] || 0) + 1;
            }
        });

        // Находим ноды без зависимостей (начальные ноды)
        const queue = this.startNodeIds.slice();
        const order = [];

        // Алгоритм топологической сортировки
        while (queue.length > 0) {
            const current = queue.shift();
            order.push(current);

            // Обрабатываем соседей
            if (graph[current]) {
                graph[current].forEach(neighbor => {
                    inDegree[neighbor]--;

                    if (inDegree[neighbor] === 0) {
                        queue.push(neighbor);
                    }
                });
            }
        }

        // Проверяем, что все ноды включены в порядок
        if (order.length !== this.nodes.length) {
            // Есть циклы или недостижимые ноды
            // Добавляем оставшиеся ноды в порядок
            this.nodes.forEach(node => {
                if (!order.includes(node.id)) {
                    order.push(node.id);
                }
            });
        }

        return order;
    }

    /**
     * Находит нод по ID
     * @param {string} nodeId - ID нода
     * @returns {Object|null} - Нод или null, если не найден
     */
    getNodeById(nodeId) {
        return this.nodes.find(node => node.id === nodeId) || null;
    }

    /**
     * Получает первый стартовый нод
     * @returns {string|null} - ID первого стартового нода или null
     */
    getFirstStartNode() {
        return this.startNodeIds.length > 0 ? this.startNodeIds[0] : null;
    }

    /**
     * Находит следующий нод для выполнения на основе выходных значений текущего нода
     * @param {Object} currentNode - Текущий нод
     * @param {Object} outputs - Выходные значения текущего нода
     * @param {Set} visitedNodes - Множество посещенных нодов
     * @param {Object} inputCache - Кэш входных значений
     * @returns {string|null} - ID следующего нода или null, если следующий нод не найден
     */
    findNextNode(currentNode, outputs, visitedNodes, inputCache) {
        // Если у нода нет выходов, выполнение завершено
        if (!currentNode.data.outputs || currentNode.data.outputs.length === 0) {
            return null;
        }

        // 1. Первый приоритет: проверяем управляющие выходы (flow)
        const flowOutputs = ['next', 'true', 'false', 'body'];
        const activeOutput = flowOutputs.find(output => outputs[output]);

        if (activeOutput) {
            // Находим все исходящие связи от этого порта
            const sourceHandleId = `output-${activeOutput}`;
            const outgoingEdges = this.edges.filter(edge =>
                edge.source === currentNode.id &&
                edge.sourceHandle === sourceHandleId
            );

            if (outgoingEdges.length > 0) {
                const nextNodeId = outgoingEdges[0].target;
                return nextNodeId;
            }
        }

        // 2. Второй приоритет: следуем зависимостям данных
        // Находим все выходные порты нода
        const outputPorts = currentNode.data.outputs
            .filter(output => !flowOutputs.includes(output.name))
            .map(output => `output-${output.name}`);

        // Находим все связи от этих портов
        const dataEdges = this.edges.filter(edge =>
            edge.source === currentNode.id &&
            outputPorts.includes(edge.sourceHandle)
        );

        // Проверяем, есть ли ноды, которые зависят только от этого нода
        for (const edge of dataEdges) {
            const targetNode = this.getNodeById(edge.target);

            if (targetNode && !visitedNodes.has(targetNode.id)) {
                // Проверяем, готовы ли все входные порты этого нода
                const allInputsReady = this.areAllInputsReady(targetNode, visitedNodes, inputCache);

                if (allInputsReady) {
                    return targetNode.id;
                }
            }
        }

        // 3. Третий приоритет: выбираем любой готовый узел, который не был посещен
        for (const node of this.nodes) {
            if (!visitedNodes.has(node.id) && this.areAllInputsReady(node, visitedNodes, inputCache)) {
                return node.id;
            }
        }

        // Если не найден следующий нод, выполнение завершено
        return null;
    }

    /**
     * Проверяет, готовы ли все обязательные входы узла
     * @param {Object} node - Узел для проверки
     * @param {Set} visitedNodes - Множество посещенных нодов
     * @param {Object} inputCache - Кэш входных значений
     * @returns {boolean} - Готовы ли все обязательные входы
     */
    areAllInputsReady(node, visitedNodes, inputCache) {
        const inputs = node.data.inputs || [];

        // Если у узла нет входов, он готов
        if (inputs.length === 0) {
            return true;
        }

        // Проверяем каждый обязательный вход
        for (const input of inputs) {
            if (input.required) {
                // Находим все входящие связи к этому порту
                const incomingEdges = this.edges.filter(edge =>
                    edge.target === node.id && edge.targetHandle === input.id
                );

                if (incomingEdges.length === 0) {
                    // Обязательный вход без связи
                    return false;
                }

                // Проверяем, все ли источники были выполнены и есть ли значения в кэше
                let hasValue = false;

                for (const edge of incomingEdges) {
                    const sourceNodeId = edge.source;

                    if (visitedNodes.has(sourceNodeId)) {
                        // ВАЖНО: учитываем префикс output- в sourceHandle
                        const outputName = edge.sourceHandle.replace('output-', '');
                        const cacheKey = `${sourceNodeId}:${outputName}`;

                        if (inputCache[cacheKey] !== undefined) {
                            hasValue = true;
                            break;
                        }
                    }
                }

                if (!hasValue) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Получает список всех стартовых нодов
     * @returns {Array} - Массив ID стартовых нодов
     */
    getStartNodes() {
        return this.startNodeIds;
    }

    /**
     * Получает порядок выполнения нодов
     * @returns {Array} - Массив ID нодов в порядке выполнения
     */
    getExecutionOrder() {
        return this.executionOrder;
    }
}

export default GraphManager;