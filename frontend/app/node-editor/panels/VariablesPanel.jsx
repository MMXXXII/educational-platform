import React from 'react';
import { BeakerIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

/**
 * Панель для просмотра и редактирования глобальных переменных
 */
const VariablesPanel = () => {
    // Заглушка для переменных
    const mockVariables = [
        { name: 'count', value: 10, type: 'number' },
        { name: 'message', value: 'Hello world', type: 'string' },
        { name: 'isActive', value: true, type: 'boolean' }
    ];

    return (
        <div className="h-full nodrag nopan">
            <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    Всего: {mockVariables.length}
                </div>
                <button
                    className="p-1.5 bg-purple-100 dark:bg-purple-900 rounded hover:bg-purple-200 dark:hover:bg-purple-800 flex items-center text-purple-600 dark:text-purple-300 text-sm font-medium"
                    title="Добавить переменную"
                >
                    <PlusIcon className="w-4 h-4 mr-1" />
                    Добавить
                </button>
            </div>

            <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 p-3 rounded-md mb-4 text-sm">
                Здесь отображаются все глобальные переменные, доступные во время выполнения.
                Вы можете добавлять, изменять и удалять переменные.
            </div>

            {/* Список переменных */}
            <div className="space-y-2 mt-4">
                {mockVariables.map((variable, index) => (
                    <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600"
                    >
                        <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-2 ${variable.type === 'number' ? 'bg-green-500' :
                                variable.type === 'string' ? 'bg-blue-500' :
                                    variable.type === 'boolean' ? 'bg-yellow-500' : 'bg-gray-500'
                                }`} />
                            <span className="font-medium">{variable.name}</span>
                        </div>
                        <div className="flex items-center">
                            <span className="text-gray-600 dark:text-gray-300 mr-2">
                                {typeof variable.value === 'string' ? `"${variable.value}"` : String(variable.value)}
                            </span>
                            <button className="text-red-500 hover:text-red-600 p-1">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                Пока не работает. заглушка
            </div>
        </div>
    );
};

export default VariablesPanel;