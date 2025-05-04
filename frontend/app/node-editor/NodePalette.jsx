import React, { useState } from 'react';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { getNodeCategories } from '../services/nodeRegistry';

/**
 * Компонент для отображения палитры доступных типов нодов
 */
const NodePalette = () => {
    // Получаем категории и ноды из реестра
    const nodeCategories = getNodeCategories();
    
    // Состояние развёрнутых категорий
    const [expandedCategories, setExpandedCategories] = useState(() => {
        // По умолчанию разворачиваем все категории
        const initialState = {};
        nodeCategories.forEach(category => {
            initialState[category.id] = true;
        });
        return initialState;
    });

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
                                        key={`${node.type}-${JSON.stringify(node.defaultData || {})}`}
                                        className={`
                                            ${node.paletteColor}
                                            text-white p-2 rounded cursor-move
                                            flex items-center transition-all
                                            hover:shadow-md transform hover:-translate-y-0.5
                                        `}
                                        draggable
                                        onDragStart={(e) => onDragStart(e, node.type, node.defaultData)}
                                    >
                                        <span className="mr-2">{node.icon({ className: "w-5 h-5" })}</span>
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

export default NodePalette;