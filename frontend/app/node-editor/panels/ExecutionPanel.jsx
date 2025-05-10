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
 */
const ExecutionPanel = ({
    isExecuting,
    executionStep,
    onStop,
    onStep,
    onRunFull,
    consoleOutput = []
}) => {
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
            <Console consoleOutput={consoleOutput} />
        </div>
    );
};

export default ExecutionPanel;