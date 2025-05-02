import React, { useState, useEffect } from 'react';
import {
    StopIcon,
    ForwardIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    InformationCircleIcon,
    ExclamationCircleIcon,
    CheckCircleIcon,
    BoltIcon
} from '@heroicons/react/24/solid';

/**
 * Панель управления выполнением алгоритма
 * 
 * @param {Object} props - Свойства компонента
 * @param {boolean} props.isExecuting - Выполняется ли алгоритм сейчас
 * @param {number} props.executionStep - Текущий шаг выполнения
 * @param {Function} props.onStop - Обработчик остановки выполнения
 * @param {Function} props.onStep - Обработчик шага выполнения
 * @param {Function} props.onRunFull - Обработчик запуска полного выполнения алгоритма
 * @param {Array} props.consoleOutput - Массив сообщений консоли
 */
const ExecutionPanel = ({
    isExecuting,
    executionStep,
    onStop,
    onStep,
    onRunFull,
    consoleOutput = []
}) => {
    const [isConsoleExpanded, setIsConsoleExpanded] = useState(true);
    const [localConsole, setLocalConsole] = useState([]);

    // Обновляем локальную консоль при изменении входных данных
    useEffect(() => {
        if (consoleOutput && consoleOutput.length > 0) {
            setLocalConsole(consoleOutput);
        }
    }, [consoleOutput]);

    /**
     * Переключает видимость консоли
     */
    const toggleConsole = () => {
        setIsConsoleExpanded(!isConsoleExpanded);
    };

    /**
     * Очищает консоль
     */
    const clearConsole = () => {
        setLocalConsole([]);
    };

    /**
     * Форматирует значение для вывода в консоль
     */
    const formatConsoleValue = (value) => {
        if (value === null) return 'null';
        if (value === undefined) return 'undefined';
        if (typeof value === 'object') {
            try {
                return JSON.stringify(value);
            } catch (e) {
                return '[Объект]';
            }
        }
        return String(value);
    };

    /**
     * Получает иконку для типа сообщения консоли
     */
    const getIconForMessageType = (type) => {
        switch (type) {
            case 'error':
                return <ExclamationCircleIcon className="w-4 h-4 mr-1 text-red-500" />;
            case 'output':
                return <CheckCircleIcon className="w-4 h-4 mr-1 text-green-500" />;
            case 'debug':
                return <InformationCircleIcon className="w-4 h-4 mr-1 text-gray-400" />;
            default:
                return null;
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg w-full nodrag nopan">
            {/* Панель управления */}
            <div className="flex flex-col mb-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        Шаг: {executionStep}
                    </div>
                </div>

                {/* Кнопки управления */}
                <div className="flex flex-wrap gap-2">
                    {!isExecuting ? (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onStep();
                                }}
                                className="flex-1 flex items-center justify-center py-2 px-4 bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
                            >
                                <ForwardIcon className="w-5 h-5 mr-1" />
                                Один шаг
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRunFull();
                                }}
                                className="flex-1 flex items-center justify-center py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                            >
                                <BoltIcon className="w-5 h-5 mr-1" />
                                Всё сразу
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onStep();
                                }}
                                className="flex-1 flex items-center justify-center py-2 px-4 bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
                            >
                                <ForwardIcon className="w-5 h-5 mr-1" />
                                Один шаг
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onStop();
                                }}
                                className="flex-1 flex items-center justify-center py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                            >
                                <StopIcon className="w-5 h-5 mr-1" />
                                Стоп
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Консоль вывода */}
            <div className="border rounded dark:border-gray-700">
                {/* Заголовок консоли */}
                <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700">
                    <div
                        className="flex items-center cursor-pointer flex-1 nodrag"
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleConsole();
                        }}
                    >
                        <h4 className="font-medium text-gray-800 dark:text-gray-200">
                            Консоль {localConsole.length > 0 && `(${localConsole.length})`}
                        </h4>
                        <button className="text-gray-500 dark:text-gray-400 ml-2">
                            {isConsoleExpanded ? (
                                <ChevronUpIcon className="w-4 h-4" />
                            ) : (
                                <ChevronDownIcon className="w-4 h-4" />
                            )}
                        </button>
                    </div>

                    {/* Кнопка очистки консоли */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            clearConsole();
                        }}
                        className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-2 py-1 nodrag"
                    >
                        Очистить
                    </button>
                </div>

                {/* Содержимое консоли */}
                {isConsoleExpanded && (
                    <div className="p-2 bg-gray-50 dark:bg-gray-900 h-48 overflow-y-auto font-mono text-sm nodrag">
                        {localConsole.length === 0 ? (
                            <div className="text-gray-500 dark:text-gray-400 italic">
                                Консоль пуста
                            </div>
                        ) : (
                            localConsole.map((item, index) => (
                                <div
                                    key={index}
                                    className={`mb-1 flex items-center ${item.type === 'error'
                                            ? 'text-red-600 dark:text-red-400'
                                            : item.type === 'debug'
                                                ? 'text-gray-500 dark:text-gray-500 text-xs'
                                                : 'text-gray-800 dark:text-gray-200'
                                        }`}
                                >
                                    {getIconForMessageType(item.type)}

                                    {item.type === 'debug' ? (
                                        <span className="opacity-60">{formatConsoleValue(item.value)}</span>
                                    ) : (
                                        <span>{formatConsoleValue(item.value)}</span>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExecutionPanel;