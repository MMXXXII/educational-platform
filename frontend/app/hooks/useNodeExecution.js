import { useState, useEffect, useRef, useCallback, useContext } from 'react';
import ExecutionEngine from '../services/execution';
import Scene3DContext from '../contexts/Scene3DContext';

/**
 * Хук для управления выполнением нодового графа
 * 
 * @param {Array} nodes - Массив нодов
 * @param {Array} edges - Массив связей между нодами
 * @param {Function} updateNodes - Функция для обновления состояния нодов
 * @param {Object} options - Дополнительные параметры
 * @param {Function} options.resetVisualizerState - Функция для сброса состояния визуализатора
 * @returns {Object} - Методы и состояние для управления выполнением
 */
const useNodeExecution = (nodes, edges, updateNodes, options = {}) => {
    // Получаем resetVisualizerState из опций
    const { resetVisualizerState } = options;

    // Безопасное получение контекста 3D сцены (если доступен)
    // Используем безопасный подход - пробуем получить контекст, но не выбрасываем ошибку, если его нет
    let scene3dContext = null;
    try {
        scene3dContext = useContext(Scene3DContext);
        // Проверяем, что контекст имеет реальные значения, а не просто пустой объект
        if (scene3dContext && (!scene3dContext.nodeActions || !scene3dContext.resetScene)) {
            scene3dContext = null;
        }
    } catch (error) {
        console.log("3D сцена недоступна, продолжаем без неё");
    }

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
        // Создаем новый экземпляр движка при каждой инициализации
        // Передаем контекст 3D сцены в качестве внешнего контекста (если он доступен)
        const externalContexts = {};
        
        // Если контекст 3D сцены доступен, добавляем его
        if (scene3dContext) {
            externalContexts.scene3d = scene3dContext;
        }
        
        engineRef.current = new ExecutionEngine(
            nodes, 
            edges, 
            {}, // глобальные переменные 
            null, // функция установки глобальных переменных
            externalContexts // внешние контексты (может быть пустым объектом)
        );

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
    }, [nodes, edges, scene3dContext]);

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
                    // Активный нод выделяем ярко
                    nodeStyles.boxShadow = '0 0 0 4px #10b981';
                    nodeStyles.zIndex = 1000;
                } else if (isPrevious) {
                    // Предыдущий активный нод помечаем тонким контуром
                    nodeStyles.boxShadow = '0 0 0 1px #10b981';
                } else if (hasError) {
                    // Нод с ошибкой выделяем красным
                    nodeStyles.boxShadow = '0 0 0 2px #ef4444';
                    nodeStyles.zIndex = 1000;
                } else if (isVisited) {
                    // Посещенные ноды помечаем тонкой рамкой
                    nodeStyles.boxShadow = '0 0 0 1px #5c8f7a';
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
        // Сбрасываем предыдущее состояние при каждом новом запуске
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

        // Всегда пересоздаем и инициализируем движок для нового выполнения
        isInitializedRef.current = false;
        const success = initializeEngine();
        
        // ВАЖНО: Для полного сброса состояния сцены необходимо вызвать
        // внешний метод сброса из LevelWalkthrough
        if (typeof resetVisualizerState === 'function') {
            resetVisualizerState();
        }
        
        return success;
    }, [initializeEngine, updateNodes, resetVisualizerState]);

    /**
     * Выполняет один шаг алгоритма
     */
    const executeStep = useCallback(() => {
        try {
            // Подготавливаем выполнение ТОЛЬКО если это первый шаг или выполнение завершено
            if (executionStep === 0 || isComplete) {
                if (!prepareExecution()) {
                    return { error: "Не удалось подготовить выполнение" };
                }
            }

            // Проверяем, что движок инициализирован
            if (!engineRef.current) {
                console.error("Движок выполнения не инициализирован");
                return { error: "Движок выполнения не инициализирован" };
            }

            // Выполняем шаг
            const stepResult = engineRef.current.step();

            // Обновляем счетчик шагов
            setExecutionStep(prevStep => prevStep + 1);

            // Обновляем активный нод
            setActiveNodeId(stepResult.currentNodeId || null);

            // Обновляем консоль
            if (stepResult.context && stepResult.context.console) {
                // Заменяем всю консоль, чтобы видеть все сообщения
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
    }, [prepareExecution, updateNodesState, executionStep, isComplete]);

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
            // Подготавливаем выполнение с полным сбросом
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
                            boxShadow: isVisited ? '0 0 0 1px #10b981' : undefined,
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

        // Сбрасываем состояние движка если он существует
        if (engineRef.current) {
            console.log("Сброс состояния движка при остановке");
            engineRef.current.reset();
        }
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