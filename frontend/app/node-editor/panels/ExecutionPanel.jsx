import React from 'react';
import {
    StopIcon,
    ForwardIcon,
    BoltIcon
} from '@heroicons/react/24/solid';
import Console from '../components/Console';

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
 * @param {boolean} props.isMobile - Флаг мобильного отображения
 */
const ExecutionPanel = ({
    isExecuting,
    executionStep,
    onStop,
    onStep,
    onRunFull,
    consoleOutput = [],
    isMobile = false
}) => {
    return (
        <div className={`bg-white dark:bg-gray-800 rounded-lg ${isMobile ? 'max-w-[200px] mx-auto px-2 py-1.5' : 'w-full'} nodrag nopan`}>
            {/* Панель управления */}
            <div className={`flex flex-col ${isMobile ? 'mb-2' : 'mb-4'}`}>
                <div className="flex items-center justify-between mb-1">
                    <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600 dark:text-gray-400`}>
                        Шаг: {executionStep}
                    </div>
                </div>

                {/* Кнопки управления */}
                <div className="flex flex-col gap-1.5">
                    {!isExecuting ? (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onStep();
                                }}
                                className={`w-full flex items-center justify-center ${isMobile ? 'py-1 px-2 text-xs' : 'py-2 px-4 text-sm'} bg-green-500 hover:bg-green-600 text-white rounded transition-colors`}
                            >
                                <ForwardIcon className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
                                Один шаг
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRunFull();
                                }}
                                className={`w-full flex items-center justify-center ${isMobile ? 'py-1 px-2 text-xs' : 'py-2 px-4 text-sm'} bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors`}
                            >
                                <BoltIcon className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
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
                                className={`w-full flex items-center justify-center ${isMobile ? 'py-1 px-2 text-xs' : 'py-2 px-4 text-sm'} bg-green-500 hover:bg-green-600 text-white rounded transition-colors`}
                            >
                                <ForwardIcon className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
                                Один шаг
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onStop();
                                }}
                                className={`w-full flex items-center justify-center ${isMobile ? 'py-1 px-2 text-xs' : 'py-2 px-4 text-sm'} bg-red-500 hover:bg-red-600 text-white rounded transition-colors`}
                            >
                                <StopIcon className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
                                Стоп
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Консоль вывода */}
            <Console 
                consoleOutput={consoleOutput} 
                isMobile={isMobile} 
                compactMode={isMobile}
                maxWidth={isMobile ? 180 : undefined}
            />
        </div>
    );
};

export default ExecutionPanel;