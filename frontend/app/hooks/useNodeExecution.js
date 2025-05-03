import { useState, useEffect, useRef, useCallback } from 'react';
import ExecutionEngine from '../services/execution';
import { useGlobalVariables } from '../contexts/GlobalVariablesContext';

/**
 * Хук для управления выполнением нодового графа
 * 
 * @param {Array} nodes - Массив нодов
 * @param {Array} edges - Массив связей между нодами
 * @param {Function} updateNodes - Функция для обновления состояния нодов
 * @returns {Object} - Методы и состояние для управления выполнением
 */
const useNodeExecution = (nodes, edges, updateNodes) => {
    // Доступ к глобальным переменным
    const { variableValues, setVariableValue } = useGlobalVariables();

    // Состояние выполнения
    const [isExecuting, setIsExecuting] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [executionStep, setExecutionStep] = useState(0);
    const [executionSpeed, setExecutionSpeed] = useState(1);
    const [activeNodeId, setActiveNodeId] = useState(null);
    const [error, setError] = useState(null);
    const [consoleOutput, setConsoleOutput] = useState([]);

    // Состояние для анимации передачи данных
    const [dataFlows, setDataFlows] = useState([]);

    // Движок выполнения
    const engineRef = useRef(null);
    // Таймер для автоматического выполнения
    const timerRef = useRef(null);
    // Флаг, который показывает, что движок был инициализирован
    const isInitializedRef = useRef(false);

    /**
      * Инициализирует движок выполнения
      */
    const initializeEngine = useCallback(() => {
        // Функция для установки значения глобальной переменной
        const setGlobalVar = (name, value) => {
            setVariableValue(name, value);
            return true;
        };

        // Создаем новый экземпляр движка для каждого запуска с доступом к глобальным переменным
        engineRef.current = new ExecutionEngine(nodes, edges, variableValues, setGlobalVar);

        const success = engineRef.current.initialize();
        isInitializedRef.current = success;

        if (!success) {
            setError("Не удалось инициализировать движок выполнения. Проверьте граф узлов.");

            setConsoleOutput(prev => [...prev, {
                type: 'error',
                value: "Не удалось инициализировать движок выполнения. Проверьте граф узлов."
            }]);
        }

        return success;
    }, [nodes, edges]);

    /**
     * Обновляет визуальное состояние нодов
     * @param {Object} stepResult - Результаты выполнения шага
     */
    const updateNodesState = useCallback((stepResult) => {
        if (!stepResult) return;

        // Обновляем состояние нодов для визуализации
        updateNodes(prevNodes =>
            prevNodes.map(node => {
                // Если нод активен
                const isActive = node.id === stepResult.currentNodeId;
                // Если нод был предыдущим активным
                const isPrevious = node.id === stepResult.previousNodeId;
                // Если нод был посещен
                const isVisited = stepResult.context.visitedNodes?.has(node.id);
                // Если произошла ошибка в ноде
                const hasError = node.id === stepResult.errorNodeId;

                // Обновляем стили нода в зависимости от его состояния
                const nodeStyles = {};

                if (isActive) {
                    nodeStyles.boxShadow = '0 0 0 2px #3b82f6';
                    nodeStyles.zIndex = 1000;
                } else if (isPrevious) {
                    nodeStyles.boxShadow = '0 0 0 1px #3b82f6';
                    nodeStyles.opacity = 0.9;
                } else if (hasError) {
                    nodeStyles.boxShadow = '0 0 0 2px #ef4444';
                    nodeStyles.zIndex = 1000;
                } else if (isVisited) {
                    nodeStyles.opacity = 0.7;
                }

                return {
                    ...node,
                    style: {
                        ...node.style,
                        ...nodeStyles
                    }
                };
            })
        );

        // Обновляем потоки данных для анимации
        if (stepResult.dataTransfers && stepResult.dataTransfers.length > 0) {
            setDataFlows(stepResult.dataTransfers);
        }
    }, [updateNodes]);

    /**
     * Подготавливает и сбрасывает состояние для нового выполнения
     */
    const prepareExecution = useCallback(() => {
        // Сбрасываем предыдущее состояние, если необходимо
        if (isComplete || !isInitializedRef.current) {
            setExecutionStep(0);
            setActiveNodeId(null);
            setIsComplete(false);
            setError(null);
            setConsoleOutput([]);
            setDataFlows([]);

            // Сбрасываем выделение всех нодов
            updateNodes(prevNodes =>
                prevNodes.map(node => ({
                    ...node,
                    style: {}
                }))
            );

            // Сбрасываем флаг инициализации
            isInitializedRef.current = false;
        }

        // Инициализируем движок, если не инициализирован
        if (!isInitializedRef.current) {
            return initializeEngine();
        }

        return true;
    }, [isComplete, initializeEngine, updateNodes]);

    /**
     * Выполняет один шаг алгоритма
     */
    const executeStep = useCallback(() => {
        // Подготавливаем выполнение, если необходимо
        if (!prepareExecution()) {
            return { error: "Не удалось подготовить выполнение" };
        }

        try {
            // Выполняем шаг
            const stepResult = engineRef.current.step();

            // Обновляем счетчик шагов
            setExecutionStep(prevStep => prevStep + 1);

            // Обновляем активный нод
            setActiveNodeId(stepResult.currentNodeId || null);

            // Обновляем консоль
            if (stepResult.context && stepResult.context.console) {
                // Важно: заменяем всю консоль, чтобы видеть все сообщения
                setConsoleOutput(stepResult.context.console);
            }

            // Если есть ошибка, устанавливаем её
            if (stepResult.error) {
                setError(stepResult.error);
                setIsExecuting(false);
                setIsComplete(true);
            }

            // Если выполнение завершено, устанавливаем соответствующий флаг
            if (stepResult.isComplete) {
                setIsComplete(true);
                setIsExecuting(false);
            }

            // Отслеживаем передачу данных для анимации
            if (stepResult.dataTransfers) {
                // Подготавливаем данные о передаче значений между нодами
                const dataTransfers = stepResult.dataTransfers.map(transfer => ({
                    ...transfer,
                    animationId: Math.random().toString(36).substr(2, 9)
                }));

                setDataFlows(dataTransfers);
            }

            // Обновляем визуальное состояние нодов
            updateNodesState(stepResult);

            return stepResult;
        } catch (error) {
            setError(error.message);
            setIsExecuting(false);
            setIsComplete(true);

            // Добавляем сообщение об ошибке в консоль
            setConsoleOutput(prev => [...prev, {
                type: 'error',
                value: `Ошибка при выполнении: ${error.message}`
            }]);

            return {
                error: error.message,
                isComplete: true
            };
        }
    }, [prepareExecution, updateNodesState]);

    /**
     * Выполняет автоматический шаг алгоритма
     */
    const autoStep = useCallback(() => {
        if (!isExecuting || isPaused || isComplete) return;

        try {
            const stepResult = executeStep();

            // Если выполнение не завершено и не приостановлено, планируем следующий шаг
            if (!stepResult.isComplete && isExecuting && !isPaused) {
                // Задержка в зависимости от скорости
                const delay = Math.max(300, 800 / executionSpeed);
                timerRef.current = setTimeout(autoStep, delay);
            }
        } catch (error) {
            setIsExecuting(false);
            setError(error.message);

            // Добавляем сообщение об ошибке в консоль
            setConsoleOutput(prev => [...prev, {
                type: 'error',
                value: `Ошибка автоматического выполнения: ${error.message}`
            }]);
        }
    }, [isExecuting, isPaused, isComplete, executeStep, executionSpeed]);

    /**
     * Запускает выполнение всего алгоритма
     */
    const runFullAlgorithm = useCallback(() => {
        try {
            // Подготавливаем выполнение
            if (!prepareExecution()) {
                return { error: "Не удалось подготовить выполнение" };
            }

            // Запускаем выполнение всего алгоритма
            const result = engineRef.current.runFull();

            // Обрабатываем результат
            if (result.error) {
                setError(result.error);
                setConsoleOutput(result.context.console || []);
                setIsComplete(true);
                return result;
            }

            // Успешное выполнение
            setConsoleOutput(result.context.console || []);

            // Подсвечиваем все выполненные ноды
            updateNodes(prevNodes =>
                prevNodes.map(node => {
                    const isVisited = result.context.visitedNodes?.has(node.id);
                    return {
                        ...node,
                        style: {
                            ...node.style,
                            opacity: isVisited ? 0.7 : 1
                        }
                    };
                })
            );

            setIsComplete(true);
            setExecutionStep(result.executionPath?.length || 0);

            return result;
        } catch (error) {
            setError(error.message);
            setConsoleOutput(prev => [...prev, {
                type: 'error',
                value: `Ошибка выполнения: ${error.message}`
            }]);
            setIsComplete(true);

            return { error: error.message };
        }
    }, [prepareExecution, updateNodes]);

    /**
     * Запускает выполнение алгоритма
     */
    const startExecution = useCallback(() => {
        // Подготавливаем выполнение
        if (!prepareExecution()) {
            return;
        }

        // Устанавливаем флаг выполнения
        setIsExecuting(true);
        setIsPaused(false);

        // Сбрасываем таймер автоматического выполнения
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }

        // Запускаем автоматическое выполнение с начальной задержкой
        timerRef.current = setTimeout(autoStep, 500);
    }, [prepareExecution, autoStep]);

    /**
     * Останавливает выполнение алгоритма
     */
    const stopExecution = useCallback(() => {
        setIsExecuting(false);
        setIsPaused(false);
        setDataFlows([]);

        // Сбрасываем таймер автоматического выполнения
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }

        // Добавляем сообщение о остановке выполнения
        setConsoleOutput(prev => [...prev, {
            type: 'output',
            value: "Выполнение остановлено"
        }]);

        // Сбрасываем выделение нодов
        updateNodes(prevNodes =>
            prevNodes.map(node => ({
                ...node,
                style: {}
            }))
        );
    }, [updateNodes]);

    /**
     * Приостанавливает/возобновляет выполнение алгоритма
     */
    const togglePause = useCallback(() => {
        setIsPaused(prevPaused => {
            const newPaused = !prevPaused;

            // Добавляем сообщение о паузе/возобновлении
            setConsoleOutput(prev => [...prev, {
                type: 'output',
                value: newPaused ? "Выполнение приостановлено" : "Выполнение возобновлено"
            }]);

            // Если выполнение возобновлено, запускаем автоматическое выполнение
            if (!newPaused && isExecuting) {
                if (timerRef.current) {
                    clearTimeout(timerRef.current);
                }
                timerRef.current = setTimeout(autoStep, 500);
            }

            return newPaused;
        });
    }, [isExecuting, autoStep]);

    /**
     * Изменяет скорость выполнения
     * @param {number} speed - Новая скорость выполнения
     */
    const setSpeed = useCallback((speed) => {
        setExecutionSpeed(speed);

        // Если выполнение активно и не приостановлено, обновляем таймер
        if (isExecuting && !isPaused && timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = setTimeout(autoStep, 1000 / speed);
        }
    }, [isExecuting, isPaused, autoStep]);

    // Обновляем движок при изменении графа
    useEffect(() => {
        if (engineRef.current && isExecuting) {
            engineRef.current.updateGraph(nodes, edges);
        }
    }, [nodes, edges, isExecuting]);

    // Очищаем таймер при размонтировании компонента
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    // Возвращаем методы и состояние
    return {
        isExecuting,
        isPaused,
        isComplete,
        executionStep,
        executionSpeed,
        activeNodeId,
        error,
        consoleOutput,
        dataFlows,
        runFullAlgorithm,
        startExecution,
        stopExecution,
        togglePause,
        executeStep,
        runFullAlgorithm,
        setSpeed
    };
};

export default useNodeExecution;