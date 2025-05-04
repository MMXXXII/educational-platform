import React, { useState } from 'react';
import {
    VariableIcon,
    HashtagIcon,
    DocumentTextIcon,
    ArrowPathIcon,
    CalculatorIcon,
    ArrowsRightLeftIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    CubeTransparentIcon,
    ServerIcon
} from '@heroicons/react/24/outline';

/**
 * Компонент для отображения палитры доступных типов нодов
 */
const ConstructorPanel = () => {
    const [expandedCategories, setExpandedCategories] = useState({
        operations: true,
        control: true
    });

    // Определение категорий нодов
    const nodeCategories = [
        {
            id: 'operations',
            name: 'Операции',
            nodes: [
                { type: 'math', name: 'Мат. операция', data: { operation: 'add' }, icon: <CalculatorIcon className="w-5 h-5" /> },
                { type: 'print', name: 'Вывод', icon: <DocumentTextIcon className="w-5 h-5" /> }
            ]
        },
        {
            id: 'control',
            name: 'Управление',
            nodes: [
                { type: 'if', name: 'Условие', icon: <ArrowsRightLeftIcon className="w-5 h-5" /> },
                { type: 'loop', name: 'Цикл', icon: <ArrowPathIcon className="w-5 h-5" /> }
            ]
        }
    ];

    /**
     * Обработчик начала перетаскивания нода
     * @param {Event} event - Событие перетаскивания
     * @param {string} nodeType - Тип перетаскиваемого нода
     * @param {Object} nodeData - Дополнительные данные нода
     */
    const onDragStart = (event, nodeType, nodeData = {}) => {
        // Сохраняем тип и данные нода в объекте перетаскивания
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.setData('application/json', JSON.stringify(nodeData));
        event.dataTransfer.effectAllowed = 'move';
    };

    /**
     * Обработчик переключения состояния категории (свернута/развернута)
     * @param {string} categoryId - Идентификатор категории
     */
    const toggleCategory = (categoryId) => {
        setExpandedCategories(prev => ({
            ...prev,
            [categoryId]: !prev[categoryId]
        }));
    };

    // Получение цвета для нода по его типу
    const getNodeColor = (type) => {
        switch (type) {
            case 'get_variable':
            case 'set_variable': return 'bg-teal-500 hover:bg-teal-600';
            case 'math': return 'bg-purple-500 hover:bg-purple-600';
            case 'print': return 'bg-yellow-500 hover:bg-yellow-600';
            case 'loop': return 'bg-red-500 hover:bg-red-600';
            case 'if': return 'bg-indigo-500 hover:bg-indigo-600';
            default: return 'bg-gray-500 hover:bg-gray-600';
        }
    };

    return (
        <div className="w-64 border-r border-gray-200 dark:border-gray-700 h-full overflow-y-auto bg-white dark:bg-gray-900">
            <div className="p-4">
                <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-200">Палитра нодов</h3>

                {nodeCategories.map(category => (
                    <div key={category.id} className="mb-4">
                        {/* Заголовок категории */}
                        <button
                            className="w-full flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 rounded text-left text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            onClick={() => toggleCategory(category.id)}
                        >
                            <span className="font-medium">{category.name}</span>
                            {expandedCategories[category.id] ? (
                                <ChevronDownIcon className="w-4 h-4" />
                            ) : (
                                <ChevronRightIcon className="w-4 h-4" />
                            )}
                        </button>

                        {/* Список нодов в категории */}
                        {expandedCategories[category.id] && (
                            <div className="mt-2 pl-2 space-y-2">
                                {category.nodes.map(node => (
                                    <div
                                        key={`${node.type}-${JSON.stringify(node.data || {})}`}
                                        className={`
                      ${getNodeColor(node.type)}
                      text-white p-2 rounded cursor-move
                      flex items-center transition-all
                      hover:shadow-md transform hover:-translate-y-0.5
                    `}
                                        draggable
                                        onDragStart={(e) => onDragStart(e, node.type, node.data)}
                                    >
                                        <span className="mr-2">{node.icon}</span>
                                        <span>{node.name}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ConstructorPanel;