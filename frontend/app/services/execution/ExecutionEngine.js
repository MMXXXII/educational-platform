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
        this.nodeExecutor.reset();
        this.isComplete = false;
        this.stepCount = 0;

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

            // Проверяем, нужно ли вернуться в цикл
            if (this.state.loopReturn) {
                console.log("Активен возврат в цикл:", this.state.loopReturn);

                // Получаем список нодов, относящихся к телу цикла
                const loopBodyNodes = this.graphManager.findLoopBodyNodes(this.state.loopReturn);

                // Проверяем, является ли текущий нод частью тела цикла
                const isPartOfLoopBody = loopBodyNodes.includes(currentNode.id);

                // Проверяем, есть ли следующий нод в теле цикла
                let hasNextNodeInLoopBody = false;

                // Проверяем все исходящие связи с нодами из тела цикла
                if (isPartOfLoopBody) {
                    const outgoingEdges = this.edges.filter(edge =>
                        edge.source === currentNode.id &&
                        loopBodyNodes.includes(edge.target)
                    );
                    hasNextNodeInLoopBody = outgoingEdges.length > 0;
                }

                // Проверяем, есть ли прямое соединение от текущего нода к циклу
                const hasDirectReturnToLoop = this.edges.some(edge =>
                    edge.source === currentNode.id &&
                    edge.target === this.state.loopReturn &&
                    edge.targetHandle === 'input-flow'
                );

                // Если текущий нод - последний в теле цикла или есть прямое соединение,
                // возвращаемся в цикл
                if ((isPartOfLoopBody && !hasNextNodeInLoopBody) || hasDirectReturnToLoop) {
                    console.log("Возврат в цикл:", this.state.loopReturn);
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
                }
            }

            // Если по flow-выходам нет следующего нода, находим через GraphManager
            if (!nextNodeId) {
                nextNodeId = this.graphManager.findNextNode(
                    currentNode,
                    result.outputs || {},
                    this.state.visitedNodes,
                    this.dataManager.inputCache
                );

                if (nextNodeId) {
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