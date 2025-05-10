import React, { useState, useEffect } from 'react';
import {
    ChevronDownIcon,
    ChevronUpIcon,
    InformationCircleIcon,
    ExclamationCircleIcon,
    CheckCircleIcon,
} from '@heroicons/react/24/solid';

/**
 * Компонент для отображения консоли с логами выполнения
 * 
 * @param {Object} props - Свойства компонента
 * @param {Array} props.consoleOutput - Массив сообщений консоли
 * @param {Function} props.onClear - Функция очистки консоли
 * @param {string} props.title - Заголовок консоли
 * @param {string} props.className - Дополнительные CSS классы
 * @param {boolean} props.initiallyExpanded - Развернута ли консоль изначально
 */
const Console = ({
    consoleOutput = [],
    onClear,
    title = 'Консоль',
    className = '',
    initiallyExpanded = true
}) => {
    const [isConsoleExpanded, setIsConsoleExpanded] = useState(initiallyExpanded);
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
    const toggleConsole = (e) => {
        if (e) e.stopPropagation();
        setIsConsoleExpanded(!isConsoleExpanded);
    };

    /**
     * Очищает консоль
     */
    const clearConsole = (e) => {
        if (e) e.stopPropagation();
        setLocalConsole([]);
        if (onClear) onClear();
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
        <div className={`border rounded dark:border-gray-700 ${className}`}>
            {/* Заголовок консоли */}
            <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700">
                <div
                    className="flex items-center cursor-pointer flex-1 nodrag"
                    onClick={toggleConsole}
                >
                    <h4 className="font-medium text-gray-800 dark:text-gray-200">
                        {title} {localConsole.length > 0 && `(${localConsole.length})`}
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
                    onClick={clearConsole}
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
    );
};

export default Console;