import React, { useState, useEffect } from 'react';
import { CubeIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

/**
 * Панель для редактирования свойств выбранного нода
 */
const NodePropertiesPanel = ({ node }) => {
    // Локальное состояние свойств нода
    const [properties, setProperties] = useState({});

    // При изменении выбранного нода обновляем локальное состояние
    useEffect(() => {
        if (node && node.data && node.data.nodeRef) {
            // Извлекаем данные из ноды
            const nodeData = node.data.nodeRef.data;
            setProperties(nodeData);
        } else {
            setProperties({});
        }
    }, [node]);

    // Если нод не выбран, показываем соответствующее сообщение
    if (!node) {
        return (
            <div className="flex flex-col items-center justify-center h-48 text-gray-500 dark:text-gray-400">
                <CubeIcon className="w-12 h-12 mb-2 opacity-50" />
                <p className="text-center">Выберите нод для редактирования свойств</p>
            </div>
        );
    }

    /**
     * Получает поля для редактирования в зависимости от типа нода
     */
    const renderFieldsForNodeType = () => {
        const nodeType = node.data.type;

        switch (nodeType) {
            case 'variable':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Имя переменной</label>
                            <input
                                type="text"
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                                value={properties.name || ''}
                                readOnly
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Начальное значение</label>
                            <input
                                type="text"
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                                value={properties.initialValue !== undefined ? properties.initialValue : ''}
                                readOnly
                            />
                        </div>
                    </div>
                );

            case 'number':
                return (
                    <div>
                        <label className="block text-sm font-medium mb-1">Значение</label>
                        <input
                            type="number"
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                            value={properties.value !== undefined ? properties.value : 0}
                            readOnly
                        />
                    </div>
                );

            case 'string':
                return (
                    <div>
                        <label className="block text-sm font-medium mb-1">Текст</label>
                        <input
                            type="text"
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                            value={properties.value || ''}
                            readOnly
                        />
                    </div>
                );

            case 'math':
                return (
                    <div>
                        <label className="block text-sm font-medium mb-1">Операция</label>
                        <select
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                            value={properties.operation || 'add'}
                            disabled
                        >
                            <option value="add">Сложение</option>
                            <option value="subtract">Вычитание</option>
                            <option value="multiply">Умножение</option>
                            <option value="divide">Деление</option>
                        </select>
                    </div>
                );

            case 'if':
                return (
                    <div>
                        <label className="block text-sm font-medium mb-1">Условие</label>
                        <select
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                            value={properties.condition || 'equal'}
                            disabled
                        >
                            <option value="equal">Равно</option>
                            <option value="notEqual">Не равно</option>
                            <option value="greater">Больше</option>
                            <option value="less">Меньше</option>
                            <option value="greaterOrEqual">Больше или равно</option>
                            <option value="lessOrEqual">Меньше или равно</option>
                        </select>
                    </div>
                );

            case 'loop':
                return (
                    <div>
                        <label className="block text-sm font-medium mb-1">Количество итераций</label>
                        <input
                            type="number"
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                            value={properties.count !== undefined ? properties.count : 5}
                            readOnly
                        />
                    </div>
                );

            default:
                return (
                    <div className="text-gray-500 dark:text-gray-400 italic">
                        Нет редактируемых свойств для этого типа нода.
                    </div>
                );
        }
    };

    return (
        <div className="h-full">
            
            {/* Информация о типе нода */}
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md mb-4">
                <div className="text-lg font-medium">{node.data.label}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Тип: {node.data.type}</div>
            </div>

            {/* Редактируемые поля для нода */}
            <div className="space-y-4">
                {renderFieldsForNodeType()}
            </div>

            {/* Порты ввода/вывода */}
            <div className="mt-6">
                <h4 className="text-sm font-medium mb-2">Входные порты</h4>
                <div className="space-y-2">
                    {node.data.inputs && node.data.inputs.length > 0 ? (
                        node.data.inputs.map((input, index) => (
                            <div key={index} className="flex items-center text-sm">
                                <div className={`w-2 h-2 rounded-full mr-2 ${input.dataType === 'number' ? 'bg-green-500' :
                                        input.dataType === 'string' ? 'bg-blue-500' :
                                            input.dataType === 'boolean' ? 'bg-yellow-500' :
                                                input.dataType === 'flow' ? 'bg-red-500' : 'bg-gray-500'
                                    }`} />
                                <span>{input.label}</span>
                                <span className="text-gray-500 dark:text-gray-400 ml-2">({input.dataType})</span>
                                {input.required && (
                                    <span className="ml-2 text-red-500">*</span>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-gray-500 dark:text-gray-400 italic">Нет входных портов</div>
                    )}
                </div>
            </div>

            <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Выходные порты</h4>
                <div className="space-y-2">
                    {node.data.outputs && node.data.outputs.length > 0 ? (
                        node.data.outputs.map((output, index) => (
                            <div key={index} className="flex items-center text-sm">
                                <div className={`w-2 h-2 rounded-full mr-2 ${output.dataType === 'number' ? 'bg-green-500' :
                                        output.dataType === 'string' ? 'bg-blue-500' :
                                            output.dataType === 'boolean' ? 'bg-yellow-500' :
                                                output.dataType === 'flow' ? 'bg-red-500' : 'bg-gray-500'
                                    }`} />
                                <span>{output.label}</span>
                                <span className="text-gray-500 dark:text-gray-400 ml-2">({output.dataType})</span>
                            </div>
                        ))
                    ) : (
                        <div className="text-gray-500 dark:text-gray-400 italic">Нет выходных портов</div>
                    )}
                </div>
            </div>

            <div className="mt-6 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 p-3 rounded-md text-sm flex items-start">
                <InformationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                <span>
                    Пока не работает редактирование. заглушка
                </span>
            </div>
        </div>
    );
};

export default NodePropertiesPanel;