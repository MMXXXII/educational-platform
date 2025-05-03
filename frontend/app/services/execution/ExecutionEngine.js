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
        this.dataManager = new DataManager(edges);
        this.graphManager = new GraphManager(nodes, edges);
        this.nodeExecutor = new NodeExecutor(this.dataManager, this.state);

        // Состояние движка
        this.isComplete = false;
        this.currentNodeId = null;
        this.maxSteps = 100; // Для предотвращения бесконечных циклов
    }

    /**
     * Инициализирует движок и находит стартовые ноды
     * @returns {boolean} - Готов ли движок к выполнению
     */
    initialize() {
        // Сбрасываем состояние
        this.state.reset();
        this.dataManager.reset();
        this.nodeExecutor.reset();
        this.isComplete = false;

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
        // Сначала инициализируем движок
        if (!this.initialize()) {
            return {
                isComplete: false,
                error: "Ошибка инициализации",
                context: this.state
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
        // Получаем порядок выполнения
        const executionOrder = this.graphManager.getExecutionOrder();

        // Добавляем сообщение о начале выполнения
        this.state.log('output', "Начинаем выполнение алгоритма");

        // Выполняем все ноды по порядку
        for (const nodeId of executionOrder) {
            const node = this.graphManager.getNodeById(nodeId);
            if (!node) continue;

            const result = this.nodeExecutor.executeNode(node);
            if (result.error) {
                return {
                    isComplete: true,
                    error: result.error,
                    errorNodeId: nodeId,
                    context: this.state,
                    dataTransfers: this.dataManager.getDataTransfers()
                };
            }
        }

        // Добавляем сообщение о завершении
        this.state.log('output', "Алгоритм выполнен успешно");

        return {
            isComplete: true,
            executionPath: this.nodeExecutor.getExecutionPath(),
            context: this.state,
            dataTransfers: this.dataManager.getDataTransfers()
        };
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

            // Выполняем текущий нод
            const result = this.nodeExecutor.executeNode(currentNode);
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

            // Находим следующий нод для выполнения
            const nextNodeId = this.graphManager.findNextNode(
                currentNode,
                result.outputs,
                this.state.visitedNodes,
                this.dataManager.inputCache
            );

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
}

export default ExecutionEngine;