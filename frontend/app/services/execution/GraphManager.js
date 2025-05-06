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
        this.dependencyGraph = {};
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
        this.dependencyGraph = {};
    }

    /**
     * Инициализирует граф, находит стартовые ноды и строит зависимости
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

        // Строим граф зависимостей между нодами
        this.buildDependencyGraph();

        // Определяем порядок выполнения
        this.executionOrder = this.determineExecutionOrder();

        return true;
    }

    /**
     * Строит граф зависимостей на основе соединений данных
     */
    buildDependencyGraph() {
        this.dependencyGraph = {};
        
        // Инициализируем граф для каждого нода
        this.nodes.forEach(node => {
            this.dependencyGraph[node.id] = {
                inputs: [], // ID нодов, от которых зависит текущий нод
                outputs: [] // ID нодов, которые зависят от текущего нода
            };
        });
        
        // Анализируем все ребра
        this.edges.forEach(edge => {
            const sourceId = edge.source;
            const targetId = edge.target;
            
            if (!this.dependencyGraph[sourceId] || !this.dependencyGraph[targetId]) {
                return; // Пропускаем некорректные ребра
            }
            
            // Определяем тип соединения (flow или data)
            const isFlowConnection = 
                (edge.sourceHandle && edge.sourceHandle.includes('flow')) || 
                (edge.targetHandle && edge.targetHandle.includes('flow'));
            
            // Добавляем зависимость, приоритизируя соединения flow
            if (!this.dependencyGraph[targetId].inputs.includes(sourceId)) {
                this.dependencyGraph[targetId].inputs.push(sourceId);
                
                // Если это flow-соединение, помещаем его в начало списка
                if (isFlowConnection && this.dependencyGraph[targetId].inputs.length > 1) {
                    const idx = this.dependencyGraph[targetId].inputs.indexOf(sourceId);
                    this.dependencyGraph[targetId].inputs.splice(idx, 1);
                    this.dependencyGraph[targetId].inputs.unshift(sourceId);
                }
            }
            
            if (!this.dependencyGraph[sourceId].outputs.includes(targetId)) {
                this.dependencyGraph[sourceId].outputs.push(targetId);
                
                // Если это flow-соединение, помещаем его в начало списка
                if (isFlowConnection && this.dependencyGraph[sourceId].outputs.length > 1) {
                    const idx = this.dependencyGraph[sourceId].outputs.indexOf(targetId);
                    this.dependencyGraph[sourceId].outputs.splice(idx, 1);
                    this.dependencyGraph[sourceId].outputs.unshift(targetId);
                }
            }
        });
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

        // Строим зависимости на основе связей данных
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

        // 1. Первый приоритет: если есть явные управляющие выходы (flow), используем их
        const flowOutputs = ['next', 'true', 'false', 'body', 'flow'];
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

        // 2. Проверяем зависимости данных и находим следующий нод,
        // который готов к выполнению и получает данные от текущего нода
        
        if (currentNode.id in this.dependencyGraph) {
            // Сначала проверяем непосредственных получателей данных от текущего нода
            const directDataReceivers = this.dependencyGraph[currentNode.id].outputs;
            
            for (const targetId of directDataReceivers) {
                const targetNode = this.getNodeById(targetId);
                
                // Если узел уже был посещен, пропускаем его
                if (!targetNode || visitedNodes.has(targetId)) {
                    continue;
                }
                
                // Проверяем готовность этого нода к выполнению
                if (this.isNodeReadyForExecution(targetNode, visitedNodes, inputCache)) {
                    return targetId;
                }
            }
        }

        // 3. Если еще не нашли следующий нод, выбираем любой готовый нод,
        // который еще не был посещен и следует логическому порядку выполнения
        const remainingOrder = this.executionOrder.filter(nodeId => !visitedNodes.has(nodeId));
        
        for (const nodeId of remainingOrder) {
            const node = this.getNodeById(nodeId);
            if (node && this.isNodeReadyForExecution(node, visitedNodes, inputCache)) {
                return nodeId;
            }
        }

        // Если не найден следующий нод, выполнение завершено
        return null;
    }

    /**
     * Проверяет, готов ли нод к выполнению, выполняя полный анализ зависимостей
     * @param {Object} node - Узел для проверки
     * @param {Set} visitedNodes - Множество посещенных нодов
     * @param {Object} inputCache - Кэш входных значений
     * @returns {boolean} - Готов ли нод к выполнению
     */
    isNodeReadyForExecution(node, visitedNodes, inputCache) {
        // Проверяем, что все обязательные входы готовы
        if (!this.areAllInputsReady(node, visitedNodes, inputCache)) {
            return false;
        }
        
        // Дополнительно проверяем, что все ноды-предшественники (по зависимостям данных) выполнены
        if (node.id in this.dependencyGraph) {
            const dependencies = this.dependencyGraph[node.id].inputs;
            
            // Для всех зависимостей
            for (const depId of dependencies) {
                // Проверяем, был ли уже выполнен этот нод-зависимость
                if (!visitedNodes.has(depId)) {
                    return false;
                }
                
                // Проверяем наличие данных от этого нода в кэше ввода
                const edges = this.edges.filter(edge => 
                    edge.source === depId && 
                    edge.target === node.id
                );
                
                for (const edge of edges) {
                    // Проверяем только неуправляющие соединения (не flow)
                    if (!edge.sourceHandle.includes('flow') && !edge.targetHandle.includes('flow')) {
                        const outputName = edge.sourceHandle.replace('output-', '');
                        const cacheKey = `${depId}:${outputName}`;
                        
                        // Если необходимые данные отсутствуют в кэше, нод не готов
                        if (inputCache[cacheKey] === undefined) {
                            return false;
                        }
                    }
                }
            }
        }
        
        return true;
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
                    // Обязательный вход без связи - проверяем, есть ли у нода значение по умолчанию
                    const inputName = input.name;
                    const hasDefaultValue = node.data.nodeRef && 
                                          node.data.nodeRef.data && 
                                          (node.data.nodeRef.data[inputName] !== undefined ||
                                           node.data.nodeRef.data[`${inputName}Value`] !== undefined);
                    
                    if (!hasDefaultValue) {
                        return false;
                    }
                } else {
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