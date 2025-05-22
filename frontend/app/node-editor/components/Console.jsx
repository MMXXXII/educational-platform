import React, { useState, useEffect, useRef } from 'react';
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
 * @param {boolean} props.isMobile - Флаг мобильного отображения
 * @param {boolean} props.compactMode - Флаг компактного режима (еще меньше размеры и отступы)
 * @param {number} props.maxWidth - Максимальная ширина консоли в пикселях
 */
const Console = ({
    consoleOutput = [],
    onClear,
    title = 'Консоль',
    className = '',
    initiallyExpanded = true,
    isMobile = false,
    compactMode = false,
    maxWidth
}) => {
    const [isConsoleExpanded, setIsConsoleExpanded] = useState(initiallyExpanded);
    const [localConsole, setLocalConsole] = useState([]);
    const consoleRef = useRef(null);

    // Обновляем локальную консоль при изменении входных данных
    useEffect(() => {
        if (consoleOutput && consoleOutput.length > 0) {
            setLocalConsole(consoleOutput);
            // Автоматическая прокрутка вниз при новых сообщениях
            setTimeout(() => {
                if (consoleRef.current && isConsoleExpanded) {
                    consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
                }
            }, 50);
        }
    }, [consoleOutput, isConsoleExpanded]);

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
        if (compactMode) return null; // В компактном режиме не показываем иконки

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

    // Определяем высоту консоли на основе мобильного отображения
    const consoleHeight = compactMode ? 'h-20' : (isMobile ? 'h-28' : 'h-48');
    
    // Стили для контейнера консоли
    const consoleStyle = maxWidth ? { maxWidth: `${maxWidth}px` } : {};

    return (
        <div className={`border rounded dark:border-gray-700 ${className}`} style={consoleStyle}>
            {/* Заголовок консоли */}
            <div className={`flex items-center justify-between ${compactMode ? 'p-1' : 'p-2'} bg-gray-100 dark:bg-gray-700`}>
                <div
                    className="flex items-center cursor-pointer flex-1 nodrag"
                    onClick={toggleConsole}
                >
                    <h4 className={`font-medium text-gray-800 dark:text-gray-200 ${compactMode ? 'text-xs' : (isMobile ? 'text-sm' : '')}`}>
                        {title} {localConsole.length > 0 && `(${localConsole.length})`}
                    </h4>
                    <button className="text-gray-500 dark:text-gray-400 ml-1">
                        {isConsoleExpanded ? (
                            <ChevronUpIcon className={`${compactMode ? 'w-3 h-3' : 'w-4 h-4'}`} />
                        ) : (
                            <ChevronDownIcon className={`${compactMode ? 'w-3 h-3' : 'w-4 h-4'}`} />
                        )}
                    </button>
                </div>

                {/* Кнопка очистки консоли */}
                <button
                    onClick={clearConsole}
                    className={`${compactMode ? 'text-[10px] px-1' : 'text-xs px-2'} text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 py-1 nodrag`}
                >
                    Очистить
                </button>
            </div>

            {/* Содержимое консоли */}
            {isConsoleExpanded && (
                <div 
                    ref={consoleRef}
                    className={`${compactMode ? 'p-1' : 'p-2'} bg-gray-50 dark:bg-gray-900 ${consoleHeight} overflow-y-auto font-mono ${compactMode ? 'text-[10px]' : (isMobile ? 'text-xs' : 'text-sm')} nodrag`}
                >
                    {localConsole.length === 0 ? (
                        <div className="text-gray-500 dark:text-gray-400 italic">
                            Консоль пуста
                        </div>
                    ) : (
                        localConsole.map((item, index) => (
                            <div
                                key={index}
                                className={`${compactMode ? 'mb-0.5' : 'mb-1'} flex items-center ${item.type === 'error'
                                    ? 'text-red-600 dark:text-red-400'
                                    : item.type === 'debug'
                                        ? 'text-gray-500 dark:text-gray-500 text-xs'
                                        : 'text-gray-800 dark:text-gray-200'
                                    }`}
                            >
                                {getIconForMessageType(item.type)}

                                {item.type === 'debug' ? (
                                    <span className="opacity-60 break-all">{formatConsoleValue(item.value)}</span>
                                ) : (
                                    <span className="break-all">{formatConsoleValue(item.value)}</span>
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