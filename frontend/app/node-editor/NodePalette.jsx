import React, { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { getNodeCategories, NODE_CATEGORIES } from '../services/nodeRegistry';

/**
 * Компонент для отображения палитры нодов 
 * 
 * @param {Object} props - Свойства компонента
 * @param {Array<string>} props.allowedCategories - Массив разрешенных категорий (по умолчанию все)
 * @param {Array<string>} props.allowedNodeTypes - Массив разрешенных типов нодов (по умолчанию все)
 * @param {Array<string>} props.excludedNodeTypes - Массив исключенных типов нодов
 * @param {boolean} props.defaultExpanded - Развернуты ли категории по умолчанию (true)
 * @param {Object} props.customTitle - Объект для переопределения заголовков категорий {categoryId: 'Custom Title'}
 * @param {Function} props.onNodeSelect - Обработчик при выборе нода
 */
const NodePalette = ({
    allowedCategories = Object.values(NODE_CATEGORIES),
    allowedNodeTypes = [],
    excludedNodeTypes = [],
    defaultExpanded = true,
    customTitle = {},
    onNodeSelect,
}) => {
    // Получаем все категории и ноды из реестра
    const allNodeCategories = getNodeCategories();
    
    // Фильтруем категории на основе переданных параметров
    const filteredCategories = allNodeCategories.filter(category => 
        allowedCategories.includes(category.id)
    ).map(category => ({
        ...category,
        // Фильтруем ноды внутри категории
        nodes: category.nodes.filter(node => 
            // Если указаны разрешенные типы, проверяем вхождение
            (allowedNodeTypes.length === 0 || allowedNodeTypes.includes(node.type)) &&
            // Проверяем, что тип не в списке исключенных
            !excludedNodeTypes.includes(node.type)
        )
    })).filter(category => 
        // Оставляем только категории с нодами
        category.nodes.length > 0
    );
    
    // Состояние развёрнутых категорий
    const [expandedCategories, setExpandedCategories] = useState(() => {
        // Инициализируем состояние на основе defaultExpanded
        const initialState = {};
        filteredCategories.forEach(category => {
            initialState[category.id] = defaultExpanded;
        });
        return initialState;
    });

    // Обновляем состояние при изменении параметров фильтрации
    // Используем строковый ключ для отслеживания изменений категорий
    const categoriesKey = filteredCategories.map(c => c.id).join(',');
    
    useEffect(() => {
        // Только обновляем состояние, если категории изменились
        setExpandedCategories(prev => {
            const newState = {};
            let hasChanges = false;
            
            filteredCategories.forEach(category => {
                // Если категория уже существует, сохраняем её состояние
                // иначе используем defaultExpanded
                const expanded = prev[category.id] !== undefined 
                    ? prev[category.id] 
                    : defaultExpanded;
                
                newState[category.id] = expanded;
                
                // Проверяем, есть ли изменения
                if (prev[category.id] !== expanded) {
                    hasChanges = true;
                }
            });
            
            // Проверяем, есть ли категории, которые исчезли
            const prevKeys = Object.keys(prev);
            const currentKeys = filteredCategories.map(c => c.id);
            if (prevKeys.length !== currentKeys.length) {
                hasChanges = true;
            }
            
            // Возвращаем новое состояние только если есть изменения
            // иначе возвращаем предыдущее состояние, чтобы избежать ре-рендера
            return hasChanges ? newState : prev;
        });
    }, [categoriesKey, defaultExpanded]);

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
        
        // Если предоставлен обработчик выбора нода, вызываем его
        if (onNodeSelect) {
            onNodeSelect(nodeType, nodeData);
        }
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

    // Если нет категорий после фильтрации, показываем сообщение
    if (filteredCategories.length === 0) {
        return (
            <div className="w-64 border-r border-gray-200 dark:border-gray-700 h-full overflow-y-auto bg-white dark:bg-gray-900 flex items-center justify-center">
                <p className="text-center text-gray-500 dark:text-gray-400 p-4">
                    Нет доступных элементов для отображения
                </p>
            </div>
        );
    }

    return (
        <div className="w-64 border-r border-gray-200 dark:border-gray-700 h-full overflow-y-auto bg-white dark:bg-gray-900">
            <div className="p-4">
                <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-200">Палитра элементов</h3>

                {filteredCategories.map(category => (
                    <div key={category.id} className="mb-4">
                        {/* Заголовок категории */}
                        <button
                            className="w-full flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 rounded text-left text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            onClick={() => toggleCategory(category.id)}
                        >
                            <span className="font-medium">
                                {customTitle[category.id] || category.name}
                            </span>
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
                                        <span className="mr-2">
                                            {node.icon && React.createElement(node.icon, { className: "w-5 h-5" })}
                                        </span>
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