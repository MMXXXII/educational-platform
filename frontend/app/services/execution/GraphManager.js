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

    /**
     * Находит все ноды, принадлежащие блоку цикла
     * @param {string} loopNodeId - ID нода цикла
     * @returns {Array} - Массив ID нодов, принадлежащих блоку цикла
     */
    findLoopBodyNodes(loopNodeId) {
        // Проверяем, что нод существует и является циклом
        const loopNode = this.getNodeById(loopNodeId);
        if (!loopNode || loopNode.data.type !== 'loop') {
            return [];
        }

        // Для хранения ID нодов, принадлежащих телу цикла
        const bodyNodesIds = new Set();

        // Ищем ноды, соединенные с выходом 'body' цикла
        const loopBodyEdges = this.edges.filter(edge =>
            edge.source === loopNodeId &&
            edge.sourceHandle === 'output-body'
        );

        // Если нет соединений с телом цикла, ищем любые соединения с другими нодами (как flow, так и data)
        if (loopBodyEdges.length === 0) {
            // Создаем граф всех соединений, исходящих от цикла (кроме output-next)
            const outgoingEdges = this.edges.filter(edge =>
                edge.source === loopNodeId &&
                edge.sourceHandle !== 'output-next'
            );

            // Если есть исходящие соединения, начинаем с них
            if (outgoingEdges.length > 0) {
                // Рассматриваем все исходящие соединения как потенциальное начало тела цикла
                for (const edge of outgoingEdges) {
                    // Добавляем начальные ноды в граф тела цикла
                    const initialNodeId = edge.target;
                    bodyNodesIds.add(initialNodeId);

                    // Добавляем все ноды, соединенные с этими начальными нодами
                    const connectedNodes = this.findAllConnectedNodes(initialNodeId, loopNodeId);
                    connectedNodes.forEach(id => bodyNodesIds.add(id));
                }
            }
        } else {
            // Если есть прямые соединения с телом цикла (через output-body)
            for (const edge of loopBodyEdges) {
                const initialNodeId = edge.target;
                bodyNodesIds.add(initialNodeId);

                // Добавляем все ноды, соединенные с этими начальными нодами (не через flow-next к циклу)
                const connectedNodes = this.findAllConnectedNodes(initialNodeId, loopNodeId);
                connectedNodes.forEach(id => bodyNodesIds.add(id));
            }
        }

        return Array.from(bodyNodesIds);
    }

    /**
     * Находит все ноды, соединенные с указанным нодом
     * Учитывает как flow, так и data соединения
     * @param {string} startNodeId - ID начального нода
     * @param {string} loopNodeId - ID нода цикла (для исключения соединения с ним через next)
     * @returns {Set} - Множество ID соединенных нодов
     */
    findAllConnectedNodes(startNodeId, loopNodeId) {
        const connectedNodes = new Set();
        const visited = new Set();
        const stack = [startNodeId];

        while (stack.length > 0) {
            const currentNodeId = stack.pop();
            
            if (visited.has(currentNodeId)) {
                continue;
            }

            visited.add(currentNodeId);
            
            // Не добавляем цикл в список связанных нодов
            if (currentNodeId !== loopNodeId) {
                connectedNodes.add(currentNodeId);
            }

            // Находим все исходящие ребра из текущего нода
            const outgoingEdges = this.edges.filter(edge => 
                edge.source === currentNodeId &&
                // Исключаем соединения с нодом цикла через flow-next
                !(edge.target === loopNodeId && edge.targetHandle === 'input-flow')
            );

            // Добавляем все целевые ноды в стек для обхода
            for (const edge of outgoingEdges) {
                if (!visited.has(edge.target)) {
                    stack.push(edge.target);
                }
            }
        }

        return connectedNodes;
    }

    /**
     * Проверяет, нужно ли вернуться в цикл после выполнения нода
     * @param {string} nodeId - ID текущего нода
     * @param {Object} context - Контекст выполнения
     * @returns {string|null} - ID нода цикла для возврата или null
     */
    checkLoopReturn(nodeId, context) {
        // Если нет активного возврата в цикл, выходим
        if (!context.loopReturn) {
            return null;
        }

        // Проверяем, есть ли прямое соединение от текущего нода к ноду цикла
        const hasDirectConnection = this.edges.some(edge =>
            edge.source === nodeId &&
            edge.target === context.loopReturn &&
            edge.targetHandle === 'input-flow'
        );

        if (hasDirectConnection) {
            return context.loopReturn;
        }

        // Если следующего нода нет или найдены все возможные следующие ноды,
        // проверяем, принадлежит ли текущий нод телу цикла
        const loopBodyNodes = this.findLoopBodyNodes(context.loopReturn);
        
        // Проверяем, является ли текущий нод частью тела цикла
        if (loopBodyNodes.includes(nodeId)) {
            // Проверяем, есть ли исходящие соединения к другим нодам тела цикла
            const hasConnectionsToLoopBody = this.edges.some(edge =>
                edge.source === nodeId &&
                edge.target !== context.loopReturn && // Исключаем прямое соединение с нодом цикла
                loopBodyNodes.includes(edge.target)
            );
            
            // Если нет исходящих соединений к другим нодам тела цикла,
            // считаем этот нод концом тела цикла и возвращаемся в цикл
            if (!hasConnectionsToLoopBody) {
                return context.loopReturn;
            }
        }

        return null;
    }
}

export default GraphManager;