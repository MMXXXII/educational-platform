import GraphManager from './GraphManager';
import NodeExecutor from './NodeExecutor';
import DataManager from './DataManager';
import ExecutionState from './ExecutionState';

/**
 * Класс для управления выполнением алгоритма, представленного графом нодов
 */
class ExecutionEngine {
    /**
     * Создает экземпляр движка выполнения
     * @param {Array} nodes - Массив нодов
     * @param {Array} edges - Массив связей между нодами
     * @param {Object} globalVariables - Глобальные переменные
     * @param {Function} setGlobalVariable - Функция для установки глобальной переменной
     */
    constructor(nodes, edges, globalVariables = {}, setGlobalVariable = null) {
        this.nodes = nodes;
        this.edges = edges;

        // Инициализируем компоненты движка
        this.state = new ExecutionState(globalVariables, setGlobalVariable);
        this.state.nodes = nodes; // Сохраняем nodes в state для доступа в NodeExecutor
        this.dataManager = new DataManager(edges);
        this.graphManager = new GraphManager(nodes, edges);
        this.nodeExecutor = new NodeExecutor(this.dataManager, this.state);

        // Состояние движка
        this.isComplete = false;
        this.currentNodeId = null;
        this.maxSteps = 100; // Для предотвращения бесконечных циклов
        this.stepCount = 0;

        // Отслеживаем активные пути выполнения для условных ветвлений
        this.activeBranches = new Map();

        // Отслеживаем текущее тело цикла
        this.currentLoopBody = {
            loopId: null,
            bodyNodes: [],
            executionOrder: [], // Порядок выполнения нодов в теле цикла, основанный на flow-соединениях
            currentIndex: 0     // Текущий индекс в порядке выполнения
        };
    }

    /**
     * Инициализирует движок и находит стартовые ноды
     * @returns {boolean} - Готов ли движок к выполнению
    */
    initialize() {
        // Явно сбрасываем состояние всех нодов перед инициализацией
        this.reset();

        // Сбрасываем состояние выполнения (это дублирование для надежности)
        this.state.reset();
        this.dataManager.reset();

        // Передаем контекст выполнения в DataManager
        this.dataManager.setExecutionContext(this.state);

        this.nodeExecutor.reset();
        this.isComplete = false;
        this.stepCount = 0;
        this.activeBranches.clear();

        // Сбрасываем текущее тело цикла
        this.currentLoopBody = {
            loopId: null,
            bodyNodes: [],
            executionOrder: [],
            currentIndex: 0
        };

        if (this.nodes.length === 0) {
            this.state.log('error', "Ошибка: нет нодов для выполнения");
            return false;
        }

        // Инициализируем граф
        if (!this.graphManager.initialize()) {
            this.state.log('error', "Не найден начальный нод. Добавьте входные ноды (число, строка, переменная)");
            return false;
        }

        // Выбираем первый начальный нод
        this.currentNodeId = this.graphManager.getFirstStartNode();
        this.state.activeNodeId = this.currentNodeId;

        // Добавляем сообщение о начале выполнения
        this.state.log('output', "Алгоритм готов к выполнению");

        return true;
    }

    /**
     * Выполняет алгоритм целиком
     * @returns {Object} - Результат выполнения
     */
    runFull() {
        // Сначала инициализируем движок (включая сброс состояния всех нодов)
        if (!this.initialize()) {
            return {
                isComplete: false,
                error: "Ошибка инициализации",
                context: this.state
            };
        }

        // Выполняем последовательно все ноды в правильном порядке
        this.state.log('output', "Начинаем выполнение алгоритма");

        // Запускаем выполнение пошагово, но с ограничением шагов
        let stepResult;
        let stepCounter = 0;

        do {
            stepResult = this.step();
            stepCounter++;

            // Если превысили лимит шагов, останавливаем выполнение
            if (stepCounter > this.maxSteps) {
                this.state.log('error', `Превышено максимальное количество шагов (${this.maxSteps}). Возможно, в алгоритме есть бесконечный цикл.`);
                return {
                    isComplete: true,
                    error: "Превышен лимит шагов выполнения",
                    context: this.state
                };
            }
        } while (!stepResult.isComplete);

        // Добавляем сообщение о завершении
        this.state.log('output', "Алгоритм выполнен успешно");

        return stepResult;
    }

    /**
     * Проверяет, находится ли нод в активной ветви выполнения
     * @param {string} nodeId - ID нода
     * @returns {boolean} - True, если нод находится в активной ветви
     */
    isNodeInActiveBranch(nodeId) {
        // Если нет активных ветвей, считаем все ноды активными
        if (this.activeBranches.size === 0) {
            return true;
        }

        // Проверяем каждую активную ветвь
        for (const [ifNodeId, branchType] of this.activeBranches) {
            // Находим все исходящие связи от условного нода
            const outgoingEdges = this.edges.filter(edge =>
                edge.source === ifNodeId &&
                edge.sourceHandle === `output-${branchType}`
            );

            // Если нод непосредственно связан с активной ветвью условного нода
            if (outgoingEdges.some(edge => edge.target === nodeId)) {
                return true;
            }

            // Рекурсивно проверяем ноды, связанные с активной ветвью
            const directTargets = outgoingEdges.map(edge => edge.target);
            for (const targetId of directTargets) {
                const childEdges = this.edges.filter(edge =>
                    edge.source === targetId
                );

                if (childEdges.some(edge => edge.target === nodeId)) {
                    return true;
                }
            }
        }

        // Если нод не связан ни с одной активной ветвью, считаем его неактивным
        return false;
    }

    /**
     * Строит порядок выполнения нодов для тела цикла, основываясь на flow-соединениях
     * @param {string} loopNodeId - ID нода цикла
     * @returns {Array} - Массив ID нодов в порядке выполнения
     */
    buildLoopBodyExecutionOrder(loopNodeId) {
        const bodyNodes = this.graphManager.findLoopBodyNodes(loopNodeId);
        if (bodyNodes.length === 0) {
            return [];
        }

        // Пытаемся найти первый нод тела цикла (тот, к которому идет body-output из цикла)
        const bodyStartNodes = this.edges.filter(edge =>
            edge.source === loopNodeId &&
            edge.sourceHandle === 'output-body'
        ).map(edge => edge.target);

        // Если нет прямого соединения с output-body, ищем первый нод в теле цикла
        let startNodes = bodyStartNodes.length > 0 ? bodyStartNodes : [];

        // Если все еще нет начальных нодов, ищем все ноды, которые могут быть первыми в цепочке
        if (startNodes.length === 0) {
            // Находим все ноды тела цикла с входящими соединениями 
            // непосредственно от цикла (но не через input-flow)
            startNodes = this.edges.filter(edge =>
                edge.source === loopNodeId &&
                edge.target !== loopNodeId &&
                bodyNodes.includes(edge.target) &&
                edge.targetHandle !== 'input-flow'
            ).map(edge => edge.target);
        }

        // Если все еще нет начальных нодов, пробуем найти ноды без входящих соединений из тела цикла
        if (startNodes.length === 0) {
            // Создаем множество нодов, в которые входят ребра от других нодов тела цикла
            const nodesWithIncomingEdges = new Set();
            this.edges.forEach(edge => {
                if (bodyNodes.includes(edge.source) &&
                    bodyNodes.includes(edge.target) &&
                    edge.source !== edge.target) {
                    nodesWithIncomingEdges.add(edge.target);
                }
            });

            // Ноды без входящих соединений - потенциальные начальные
            startNodes = bodyNodes.filter(nodeId => !nodesWithIncomingEdges.has(nodeId));
        }

        // Если все еще нет начальных нодов, берем первый нод из тела цикла
        if (startNodes.length === 0 && bodyNodes.length > 0) {
            startNodes = [bodyNodes[0]];
        }

        // Строим порядок выполнения, начиная с найденных стартовых нодов
        const executionOrder = [];
        const visited = new Set();

        // Функция для обхода графа в глубину, следуя по flow-соединениям
        const traverseFlowGraph = (nodeId) => {
            if (visited.has(nodeId) || !bodyNodes.includes(nodeId)) {
                return;
            }

            visited.add(nodeId);
            executionOrder.push(nodeId);

            // Находим все исходящие flow-соединения
            const flowEdges = this.edges.filter(edge =>
                edge.source === nodeId &&
                bodyNodes.includes(edge.target) &&
                edge.sourceHandle && edge.sourceHandle.includes('flow')
            );

            // Если есть flow-соединения, следуем по ним
            if (flowEdges.length > 0) {
                for (const edge of flowEdges) {
                    traverseFlowGraph(edge.target);
                }
            } else {
                // Если нет flow-соединений, проверяем соединения по данным
                const dataEdges = this.edges.filter(edge =>
                    edge.source === nodeId &&
                    bodyNodes.includes(edge.target) &&
                    !edge.sourceHandle.includes('flow')
                );

                for (const edge of dataEdges) {
                    traverseFlowGraph(edge.target);
                }
            }
        };

        // Запускаем обход из каждого начального нода
        for (const startNode of startNodes) {
            traverseFlowGraph(startNode);
        }

        // Добавляем оставшиеся ноды, которые не были посещены
        for (const nodeId of bodyNodes) {
            if (!visited.has(nodeId)) {
                executionOrder.push(nodeId);
            }
        }

        console.log("Построен порядок выполнения для тела цикла:", executionOrder);
        return executionOrder;
    }

    /**
     * Обновляет информацию о текущем теле цикла
     * @param {string} loopNodeId - ID нода цикла
     */
    updateCurrentLoopBody(loopNodeId) {
        // Если loopNodeId изменился, обновляем список нодов тела цикла и порядок выполнения
        if (this.currentLoopBody.loopId !== loopNodeId) {
            const bodyNodes = this.graphManager.findLoopBodyNodes(loopNodeId);
            const executionOrder = this.buildLoopBodyExecutionOrder(loopNodeId);

            this.currentLoopBody = {
                loopId: loopNodeId,
                bodyNodes: bodyNodes,
                executionOrder: executionOrder,
                currentIndex: 0
            };

            console.log(`Обновлена информация о теле цикла для ${loopNodeId}:`);
            console.log("Ноды тела цикла:", bodyNodes);
            console.log("Порядок выполнения:", executionOrder);
        }
    }

    /**
     * Находит следующий нод для выполнения в теле цикла
     * @returns {string|null} - ID следующего нода или null, если все ноды выполнены
     */
    findNextNodeInLoopBody() {
        if (!this.currentLoopBody.loopId ||
            this.currentLoopBody.executionOrder.length === 0 ||
            this.currentLoopBody.currentIndex >= this.currentLoopBody.executionOrder.length) {
            return null;
        }

        // Берем следующий нод по порядку и увеличиваем индекс
        const nextNodeId = this.currentLoopBody.executionOrder[this.currentLoopBody.currentIndex];
        this.currentLoopBody.currentIndex++;

        return nextNodeId;
    }

    /**
     * Проверяет, все ли ноды в теле цикла выполнены
     * @returns {boolean} - true, если все ноды выполнены
     */
    isLoopBodyComplete() {
        return this.currentLoopBody.currentIndex >= this.currentLoopBody.executionOrder.length;
    }

    /**
     * Сбрасывает состояние текущего тела цикла для новой итерации
     */
    resetLoopBodyExecution() {
        this.currentLoopBody.currentIndex = 0;
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
                context: this.state
            };
        }

        // Увеличиваем счетчик шагов
        this.stepCount++;

        // Если превысили лимит шагов, останавливаем выполнение
        if (this.stepCount > this.maxSteps) {
            this.isComplete = true;
            this.state.log('error', `Превышено максимальное количество шагов (${this.maxSteps}). Возможно, в алгоритме есть бесконечный цикл.`);
            return {
                isComplete: true,
                error: "Превышен лимит шагов выполнения",
                context: this.state
            };
        }

        // Очищаем предыдущие данные о передаче данных
        this.dataManager.clearDataTransfers();

        try {
            // Если график не инициализирован, инициализируем его
            if (!this.currentNodeId) {
                if (!this.initialize()) {
                    this.isComplete = true;
                    return {
                        isComplete: true,
                        error: "Не удалось инициализировать движок",
                        context: this.state
                    };
                }
            }

            // Находим текущий нод
            const currentNode = this.graphManager.getNodeById(this.currentNodeId);
            if (!currentNode) {
                throw new Error(`Нод с ID ${this.currentNodeId} не найден`);
            }

            console.log("Выполнение шага, текущий нод:", this.currentNodeId, "тип:", currentNode.data.type);

            // Выполняем текущий нод
            const result = this.nodeExecutor.executeNode(currentNode, this.graphManager);
            if (result.error) {
                this.isComplete = true;
                return {
                    isComplete: true,
                    error: result.error,
                    errorNodeId: this.currentNodeId,
                    context: this.state,
                    dataTransfers: this.dataManager.getDataTransfers()
                };
            }

            // Если это нод цикла и output-body активен, начинаем выполнение тела цикла
            if (currentNode.data.type === 'loop' && result.outputs && result.outputs.body) {
                // Обновляем информацию о текущем теле цикла
                this.updateCurrentLoopBody(currentNode.id);
                // Сбрасываем индекс выполнения тела цикла для новой итерации
                this.resetLoopBodyExecution();

                // Находим первый нод для выполнения в теле цикла
                const firstBodyNode = this.findNextNodeInLoopBody();
                if (firstBodyNode) {
                    console.log("Начинаем выполнение тела цикла с нода:", firstBodyNode);
                    this.currentNodeId = firstBodyNode;

                    return {
                        isComplete: false,
                        currentNodeId: this.currentNodeId,
                        previousNodeId: currentNode.id,
                        context: this.state,
                        dataTransfers: this.dataManager.getDataTransfers()
                    };
                }
            }

            // Проверяем, активен ли возврат в цикл и выполняются ли ноды тела цикла
            if (this.state.loopReturn) {
                console.log("Активен возврат в цикл:", this.state.loopReturn);

                // Обновляем информацию о текущем теле цикла, если не обновлена
                this.updateCurrentLoopBody(this.state.loopReturn);

                // Если текущий нод в теле цикла, проверяем, есть ли еще ноды для выполнения
                if (this.currentLoopBody.bodyNodes.includes(currentNode.id)) {
                    const nextNodeInLoop = this.findNextNodeInLoopBody();

                    if (nextNodeInLoop) {
                        console.log("Следующий нод в теле цикла:", nextNodeInLoop);
                        this.currentNodeId = nextNodeInLoop;

                        return {
                            isComplete: false,
                            currentNodeId: this.currentNodeId,
                            previousNodeId: currentNode.id,
                            context: this.state,
                            dataTransfers: this.dataManager.getDataTransfers()
                        };
                    }

                    // Если все ноды тела цикла выполнены, возвращаемся в цикл
                    if (this.isLoopBodyComplete()) {
                        console.log("Все ноды тела цикла выполнены, возвращаемся в цикл");
                        this.currentNodeId = this.state.loopReturn;

                        return {
                            isComplete: false,
                            currentNodeId: this.currentNodeId,
                            previousNodeId: currentNode.id,
                            context: this.state,
                            dataTransfers: this.dataManager.getDataTransfers()
                        };
                    }
                }

                // Если текущий нод - это цикл и выход next активен, продолжаем выполнение
                if (currentNode.id === this.state.loopReturn && result.outputs && result.outputs.next) {
                    console.log("Выход из цикла");
                    this.state.clearLoopReturn();
                    // Продолжаем с обычной логикой поиска следующего нода
                } else if (currentNode.id === this.state.loopReturn) {
                    // Если мы вернулись в цикл, но нет активного выхода next, продолжаем выполнение тела цикла
                    this.resetLoopBodyExecution();
                    const firstBodyNode = this.findNextNodeInLoopBody();
                    if (firstBodyNode) {
                        console.log("Продолжаем выполнение тела цикла с нода:", firstBodyNode);
                        this.currentNodeId = firstBodyNode;

                        return {
                            isComplete: false,
                            currentNodeId: this.currentNodeId,
                            previousNodeId: currentNode.id,
                            context: this.state,
                            dataTransfers: this.dataManager.getDataTransfers()
                        };
                    }
                }
            }

            // Находим следующий нод для выполнения
            let nextNodeId = null;

            // Проверяем выходные значения нода для определения следующего нода
            if (result.outputs) {
                // Ищем активные flow-выходы
                const flowOutputs = Object.keys(result.outputs).filter(key =>
                    (key === 'flow' || key === 'true' || key === 'false' || key === 'body' || key === 'next') &&
                    result.outputs[key]
                );

                if (flowOutputs.length > 0) {
                    // Берем первый активный flow-выход
                    const activeOutput = flowOutputs[0];

                    // Ищем связи от этого выхода
                    const sourceHandleId = `output-${activeOutput}`;
                    const outgoingEdges = this.edges.filter(edge =>
                        edge.source === currentNode.id &&
                        edge.sourceHandle === sourceHandleId
                    );

                    if (outgoingEdges.length > 0) {
                        nextNodeId = outgoingEdges[0].target;
                        console.log("Следующий нод по flow-выходу:", nextNodeId);
                    }

                    // Если это условный нод, запоминаем активную ветвь
                    if (currentNode.data.type === 'if') {
                        console.log(`Условие ${currentNode.id} определило ветвь: ${activeOutput}`);
                        this.activeBranches.set(currentNode.id, activeOutput);
                    }
                }
            }

            // Если текущий нод условный, и не найден активный выход, завершаем выполнение этой ветви
            if (currentNode.data.type === 'if' && !nextNodeId) {
                this.isComplete = true;
                return {
                    isComplete: true,
                    lastNodeId: this.currentNodeId,
                    context: this.state,
                    dataTransfers: this.dataManager.getDataTransfers()
                };
            }

            // Если по flow-выходам нет следующего нода, находим через GraphManager
            if (!nextNodeId) {
                // Используем GraphManager только для нахождения следующего нода по данным
                nextNodeId = this.graphManager.findNextNode(
                    currentNode,
                    result.outputs || {},
                    this.state.visitedNodes,
                    this.dataManager.inputCache
                );

                // Дополнительно проверяем, находится ли найденный нод в активной ветви
                if (nextNodeId && !this.isNodeInActiveBranch(nextNodeId)) {
                    console.log(`Нод ${nextNodeId} не в активной ветви выполнения, пропускаем`);
                    nextNodeId = null;
                } else if (nextNodeId) {
                    console.log("Следующий нод найден через GraphManager:", nextNodeId);
                }
            }

            // Если следующий нод не найден, выполнение завершено
            if (!nextNodeId) {
                this.isComplete = true;
                return {
                    isComplete: true,
                    lastNodeId: this.currentNodeId,
                    context: this.state,
                    dataTransfers: this.dataManager.getDataTransfers()
                };
            }

            this.currentNodeId = nextNodeId;

            return {
                isComplete: false,
                currentNodeId: this.currentNodeId,
                previousNodeId: currentNode.id,
                context: this.state,
                dataTransfers: this.dataManager.getDataTransfers()
            };
        } catch (error) {
            console.error("Ошибка выполнения:", error);
            this.isComplete = true;
            this.state.log('error', `Ошибка выполнения: ${error.message}`);

            return {
                isComplete: true,
                error: error.message,
                context: this.state,
                dataTransfers: this.dataManager.getDataTransfers()
            };
        }
    }

    /**
     * Получает текущий контекст выполнения
     * @returns {Object} - Контекст выполнения
     */
    getContext() {
        return this.state;
    }

    /**
     * Обновляет набор нодов и связей
     * @param {Array} nodes - Новый массив нодов
     * @param {Array} edges - Новый массив связей
     */
    updateGraph(nodes, edges) {
        this.nodes = nodes;
        this.edges = edges;
        this.graphManager.setGraph(nodes, edges);
        this.dataManager.setEdges(edges);
        this.initialize();
    }

    /**
     * Включить/выключить режим отладки
     * @param {boolean} enabled - Включен ли режим отладки
     */
    setDebugMode(enabled) {
        this.state.debug = enabled;
    }

    /**
     * Полностью сбрасывает состояние движка выполнения
     * Подготавливает движок к новому запуску
     * @returns {boolean} - Успешно ли выполнен сброс
     */
    reset() {
        try {
            // Сбрасываем внутреннее состояние движка
            this.isComplete = false;
            this.currentNodeId = null;
            this.stepCount = 0;
            this.activeBranches.clear();

            // Сбрасываем информацию о текущем теле цикла
            this.currentLoopBody = {
                loopId: null,
                bodyNodes: [],
                executionOrder: [],
                currentIndex: 0
            };

            // Сбрасываем состояние всех компонентов
            this.state.reset();
            this.dataManager.reset();
            this.nodeExecutor.reset();

            // Сбрасываем состояние всех нодов
            if (this.nodes && Array.isArray(this.nodes)) {
                this.nodes.forEach(node => {
                    if (node.data && node.data.nodeRef) {
                        // Явно вызываем метод reset() для каждого нода, особенно для циклов
                        if (typeof node.data.nodeRef.reset === 'function') {
                            console.log(`Сброс нода ${node.id} типа ${node.data.type}`);
                            node.data.nodeRef.reset();
                        } else {
                            // Если метода reset нет, просто очищаем state
                            node.data.nodeRef.state = {};
                        }

                        // Удаляем визуальные стили нода
                        if (node.style) {
                            node.style = {};
                        }
                    }
                });
            }

            console.log("Состояние всех нодов сброшено");
            this.state.log('output', "Состояние алгоритма сброшено");
            return true;
        } catch (error) {
            console.error("Ошибка при сбросе движка:", error);
            return false;
        }
    }
}

export default ExecutionEngine;