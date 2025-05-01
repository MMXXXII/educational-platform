/**
 * Класс для управления выполнением алгоритма, представленного графом нодов
 */
class ExecutionEngine {
    /**
     * Создает экземпляр движка выполнения
     * @param {Array} nodes - Массив нодов
     * @param {Array} edges - Массив связей между нодами
     */
    constructor(nodes, edges) {
        this.nodes = nodes;
        this.edges = edges;
        this.context = {
            variables: {},
            console: [],
            activeNodeId: null,
            previousNodeId: null,
            visitedNodes: new Set(),
            loopReturn: null
        };
        this.inputCache = {};
        this.isComplete = false;
        this.startNodeIds = [];
        this.currentNodeId = null;
        this.executionPath = [];
        this.debug = false; // Отключаем режим отладки по умолчанию
        this.maxSteps = 100; // Для предотвращения бесконечных циклов
        this.dataTransfers = []; // Список передач данных между нодами
    }

    /**
     * Добавляет отладочное сообщение в консоль
     * @param {string} message - Сообщение для отладки
     * @param {any} data - Дополнительные данные
     */
    log(message, data = null) {
        if (this.debug) {
            if (data) {
                console.log(`[ExecutionEngine] ${message}`, data);
                // Только в режиме отладки добавляем в консоль
                this.context.console.push({
                    type: 'debug',
                    value: `[DEBUG] ${message}: ${JSON.stringify(data).substring(0, 100)}`
                });
            } else {
                console.log(`[ExecutionEngine] ${message}`);
                this.context.console.push({
                    type: 'debug',
                    value: `[DEBUG] ${message}`
                });
            }
        }
    }

    /**
     * Инициализирует движок и находит стартовые ноды
     * @returns {boolean} - Готов ли движок к выполнению
     */
    initialize() {
        // Сбрасываем состояние
        this.context = {
            variables: {},
            console: [],
            activeNodeId: null,
            previousNodeId: null,
            visitedNodes: new Set(),
            loopReturn: null
        };
        this.inputCache = {};
        this.isComplete = false;
        this.executionPath = [];
        this.dataTransfers = [];

        if (this.nodes.length === 0) {
            this.context.console.push({
                type: 'error',
                value: "Ошибка: нет нодов для выполнения"
            });
            return false;
        }

        // Находим все стартовые ноды
        this.startNodeIds = this.findStartingNodes().map(node => node.id);

        if (this.startNodeIds.length === 0) {
            this.context.console.push({
                type: 'error',
                value: "Не найден начальный нод. Добавьте входные ноды (число, строка, переменная)"
            });
            return false;
        }

        // Выбираем первый начальный нод
        this.currentNodeId = this.startNodeIds[0];
        this.context.activeNodeId = this.currentNodeId;

        // Добавляем сообщение о начале выполнения
        this.context.console.push({
            type: 'output',
            value: "Алгоритм готов к выполнению"
        });

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

        // Приоритет для начальных нодов - ноды данных (число, строка, переменная)
        const dataNodes = autonomousNodes.filter(node =>
            ['variable', 'number', 'string'].includes(node.data.type)
        );

        if (dataNodes.length > 0) {
            return dataNodes;
        }

        return autonomousNodes;
    }

    /**
     * Выполняет алгоритм целиком
     * @returns {Object} - Результат выполнения
     */
    runFull() {
        // Сначала инициализируем движок
        if (!this.initialize()) {
            return {
                isComplete: false,
                error: "Ошибка инициализации",
                context: this.context
            };
        }

        // Выполняем последовательно все ноды в правильном порядке
        const result = this.executeAllNodes();
        return result;
    }

    /**
     * Выполняет все ноды в правильном порядке
     * @returns {Object} - Результат выполнения
     */
    executeAllNodes() {
        // Сначала определяем порядок выполнения
        const executionOrder = this.determineExecutionOrder();
        
        // Добавляем сообщение о начале выполнения
        this.context.console.push({
            type: 'output',
            value: "Начинаем выполнение алгоритма"
        });

        // Выполняем все ноды по порядку
        for (const nodeId of executionOrder) {
            const result = this.executeNode(nodeId);
            if (result.error) {
                return result;
            }
        }

        // Добавляем сообщение о завершении
        this.context.console.push({
            type: 'output',
            value: "Алгоритм выполнен успешно"
        });

        return {
            isComplete: true,
            executionPath: this.executionPath,
            context: this.context,
            dataTransfers: this.dataTransfers
        };
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
            graph[edge.source].push(edge.target);
            inDegree[edge.target] = (inDegree[edge.target] || 0) + 1;
        });
        
        // Находим ноды без зависимостей (начальные ноды)
        const queue = this.startNodeIds.slice();
        const order = [];
        
        // Алгоритм топологической сортировки
        while (queue.length > 0) {
            const current = queue.shift();
            order.push(current);
            
            // Обрабатываем соседей
            graph[current].forEach(neighbor => {
                inDegree[neighbor]--;
                
                if (inDegree[neighbor] === 0) {
                    queue.push(neighbor);
                }
            });
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
     * Выполняет отдельный нод
     * @param {string} nodeId - ID нода для выполнения
     * @returns {Object} - Результат выполнения
     */
    executeNode(nodeId) {
        const node = this.nodes.find(n => n.id === nodeId);
        
        if (!node) {
            return {
                error: `Нод с ID ${nodeId} не найден`,
                nodeId
            };
        }
        
        try {
            // Добавляем нод в список посещенных
            this.context.visitedNodes.add(nodeId);
            this.executionPath.push(nodeId);
            
            // Обновляем активный нод в контексте
            this.context.previousNodeId = this.context.activeNodeId;
            this.context.activeNodeId = nodeId;
            
            // Собираем входные значения для нода
            const inputValues = this.collectInputValues(node);
            
            // Выполняем логику нода
            const nodeRef = node.data.nodeRef;
            if (!nodeRef) {
                throw new Error(`Нод с ID ${nodeId} не имеет ссылки на реализацию`);
            }
            
            // Выполняем нод
            const outputs = nodeRef.execute(inputValues, this.context);
            
            // Сохраняем выходные значения в кэше
            this.cacheOutputValues(node, outputs);
            
            // Добавляем информацию о выполнении для важных нодов
            if (node.data.type === 'math') {
                // Показываем промежуточные результаты вычислений
                const operation = nodeRef.data.operation;
                const a = inputValues.a;
                const b = inputValues.b;
                const result = outputs.result;
                
                let opSymbol = '';
                switch (operation) {
                    case 'add': opSymbol = '+'; break;
                    case 'subtract': opSymbol = '-'; break;
                    case 'multiply': opSymbol = '*'; break;
                    case 'divide': opSymbol = '/'; break;
                }
                
                this.context.console.push({
                    type: 'debug',
                    value: `Вычисление: ${a} ${opSymbol} ${b} = ${result}`
                });
            }
            
            return { 
                success: true, 
                nodeId, 
                outputs 
            };
        } catch (error) {
            this.context.console.push({
                type: 'error',
                value: `Ошибка в ноде "${node.data.label}": ${error.message}`
            });
            
            return {
                error: error.message,
                nodeId
            };
        }
    }

    /**
     * Выполняет следующий шаг алгоритма
     * @returns {Object} - Информация о выполненном шаге
     */
    step() {
        // Если выполнение завершено, возвращаем соответствующий статус
        if (this.isComplete) {
            return {
                isComplete: true,
                context: this.context
            };
        }

        // Очищаем предыдущие данные о передаче данных
        this.dataTransfers = [];

        try {
            // Если график не инициализирован, инициализируем его
            if (!this.currentNodeId) {
                if (!this.initialize()) {
                    this.isComplete = true;
                    return {
                        isComplete: true,
                        error: "Не удалось инициализировать движок",
                        context: this.context
                    };
                }
            }

            // Находим текущий нод
            const currentNode = this.nodes.find(node => node.id === this.currentNodeId);
            if (!currentNode) {
                throw new Error(`Нод с ID ${this.currentNodeId} не найден`);
            }

            // Выполняем текущий нод
            const result = this.executeNode(this.currentNodeId);
            if (result.error) {
                this.isComplete = true;
                return {
                    isComplete: true,
                    error: result.error,
                    errorNodeId: this.currentNodeId,
                    context: this.context,
                    dataTransfers: this.dataTransfers
                };
            }

            // Находим следующий нод для выполнения
            const nextNodeId = this.findNextNode(currentNode, result.outputs);
            
            // Если следующий нод не найден, выполнение завершено
            if (!nextNodeId) {
                this.isComplete = true;
                return {
                    isComplete: true,
                    lastNodeId: this.currentNodeId,
                    context: this.context,
                    dataTransfers: this.dataTransfers
                };
            }

            this.currentNodeId = nextNodeId;

            return {
                isComplete: false,
                currentNodeId: this.currentNodeId,
                previousNodeId: currentNode.id,
                context: this.context,
                dataTransfers: this.dataTransfers
            };
        } catch (error) {
            this.isComplete = true;
            this.context.console.push({
                type: 'error',
                value: `Ошибка выполнения: ${error.message}`
            });
            
            return {
                isComplete: true,
                error: error.message,
                context: this.context,
                dataTransfers: this.dataTransfers
            };
        }
    }

    /**
     * Собирает входные значения для нода из связей
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
                const sourceNode = this.nodes.find(n => n.id === sourceEdge.source);

                if (sourceNode) {
                    // Получаем имя выходного порта из источника
                    const sourceHandleId = sourceEdge.sourceHandle;
                    const outputName = sourceHandleId.replace('output-', '');

                    // Проверяем кэш выходных значений
                    const cacheKey = `${sourceNode.id}:${outputName}`;

                    if (this.inputCache[cacheKey] !== undefined) {
                        const value = this.inputCache[cacheKey];
                        inputValues[inputName] = value;
                        
                        // Записываем информацию о передаче данных для анимации
                        this.dataTransfers.push({
                            edgeId: sourceEdge.id,
                            sourceNodeId: sourceNode.id,
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
     * Находит следующий нод для выполнения на основе выходных значений текущего нода
     * @param {Object} currentNode - Текущий нод
     * @param {Object} outputs - Выходные значения текущего нода
     * @returns {string|null} - ID следующего нода или null, если следующий нод не найден
     */
    findNextNode(currentNode, outputs) {
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
                const nextNode = this.nodes.find(n => n.id === nextNodeId);
                
                if (nextNode) {
                    // Записываем информацию о передаче управления (flow)
                    this.dataTransfers.push({
                        edgeId: outgoingEdges[0].id,
                        sourceNodeId: currentNode.id,
                        targetNodeId: nextNodeId, 
                        sourceHandle: sourceHandleId,
                        targetHandle: null, // Для flow не важно, на какой вход
                        value: 'flow',
                        isFlow: true,
                        timestamp: Date.now()
                    });
                    
                    return nextNodeId;
                }
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
            const targetNode = this.nodes.find(n => n.id === edge.target);
            
            if (targetNode && !this.context.visitedNodes.has(targetNode.id)) {
                // Проверяем, готовы ли все входные порты этого нода
                const allInputsReady = this.areAllInputsReady(targetNode);
                
                if (allInputsReady) {
                    return targetNode.id;
                }
            }
        }
        
        // 3. Третий приоритет: выбираем любой готовый узел, который не был посещен
        for (const node of this.nodes) {
            if (!this.context.visitedNodes.has(node.id) && this.areAllInputsReady(node)) {
                return node.id;
            }
        }

        // Если не найден следующий нод, выполнение завершено
        return null;
    }

    /**
     * Проверяет, готовы ли все обязательные входы узла
     * @param {Object} node - Узел для проверки
     * @returns {boolean} - Готовы ли все обязательные входы
     */
    areAllInputsReady(node) {
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

                    if (this.context.visitedNodes.has(sourceNodeId)) {
                        // ВАЖНО: учитываем префикс output- в sourceHandle
                        const outputName = edge.sourceHandle.replace('output-', '');
                        const cacheKey = `${sourceNodeId}:${outputName}`;

                        if (this.inputCache[cacheKey] !== undefined) {
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
     * Получает текущий контекст выполнения
     * @returns {Object} - Контекст выполнения
     */
    getContext() {
        return { ...this.context };
    }

    /**
     * Обновляет набор нодов и связей
     * @param {Array} nodes - Новый массив нодов
     * @param {Array} edges - Новый массив связей
     */
    updateGraph(nodes, edges) {
        this.nodes = nodes;
        this.edges = edges;
        this.initialize();
    }
}

export default ExecutionEngine;