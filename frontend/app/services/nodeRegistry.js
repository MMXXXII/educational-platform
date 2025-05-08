/**
 * Реестр типов нодов
 * Централизованное хранилище метаданных о нодах для использования в UI
 */
import {
    VariableIcon,
    HashtagIcon,
    DocumentTextIcon,
    ArrowPathIcon,
    CalculatorIcon,
    ArrowsRightLeftIcon,
    CubeTransparentIcon,
    ServerIcon,
    ClipboardDocumentIcon
} from '@heroicons/react/24/outline';

/**
 * Определения категорий нодов
 */
export const NODE_CATEGORIES = {
    VARIABLES: 'variables',
    OPERATIONS: 'operations',
    CONTROL: 'control'
};

/**
 * Реестр нодов с метаданными
 */
const nodeRegistry = {
    // Ноды переменной
    variable: {
        type: 'variable',
        category: NODE_CATEGORIES.VARIABLES,
        name: 'Переменная',
        description: 'Создает или изменяет переменную',
        iconComponent: VariableIcon,
        color: {
            bg: 'bg-green-100 dark:bg-green-900',
            border: 'border-green-500',
            text: 'text-green-800 dark:text-green-200'
        },
        paletteColor: 'bg-green-500 hover:bg-green-600',
        hexColor: '#22c55e', // green-500
        getActiveValue: node => node.state?.currentValue,
        getPortColor: dataType => getPortColorForType(dataType),
        defaultData: { name: 'x', initialValue: '', variableType: 'any' }
    },
    
    // Нод присваивания
    assignment: {
        type: 'assignment',
        category: NODE_CATEGORIES.OPERATIONS,
        name: 'Присваивание',
        description: 'Присваивает значение переменной',
        iconComponent: ClipboardDocumentIcon,
        color: {
            bg: 'bg-teal-100 dark:bg-teal-900',
            border: 'border-teal-500',
            text: 'text-teal-800 dark:text-teal-200'
        },
        paletteColor: 'bg-teal-500 hover:bg-teal-600',
        hexColor: '#14b8a6', // teal-500
        getActiveValue: node => node.state?.result,
        getPortColor: dataType => getPortColorForType(dataType),
        defaultData: { leftValue: '', rightValue: '', leftType: 'any', rightType: 'any' }
    },
    
    // Ноды категории "Операции"
    math: {
        type: 'math',
        category: NODE_CATEGORIES.OPERATIONS,
        name: 'Мат. операция',
        description: 'Выполняет математическую операцию',
        iconComponent: CalculatorIcon,
        color: {
            bg: 'bg-purple-100 dark:bg-purple-900',
            border: 'border-purple-500',
            text: 'text-purple-800 dark:text-purple-200'
        },
        paletteColor: 'bg-purple-500 hover:bg-purple-600',
        hexColor: '#a855f7', // purple-500
        getActiveValue: node => node.state?.result,
        getPortColor: dataType => getPortColorForType(dataType),
        defaultData: { operation: 'add' }
    },
    
    logical: {
        type: 'logical',
        category: NODE_CATEGORIES.OPERATIONS,
        name: 'Лог. операция',
        description: 'Выполняет логическую операцию сравнения',
        iconComponent: ArrowsRightLeftIcon,
        color: {
            bg: 'bg-blue-100 dark:bg-blue-900',
            border: 'border-blue-500',
            text: 'text-blue-800 dark:text-blue-200'
        },
        paletteColor: 'bg-blue-500 hover:bg-blue-600',
        hexColor: '#3b82f6', // blue-500
        getActiveValue: node => node.state?.result !== undefined ? (node.state.result ? 'Истина' : 'Ложь') : null,
        getPortColor: dataType => getPortColorForType(dataType),
        defaultData: { operation: 'equal' }
    },
    
    print: {
        type: 'print',
        category: NODE_CATEGORIES.OPERATIONS,
        name: 'Вывод',
        description: 'Выводит значение в консоль',
        iconComponent: DocumentTextIcon,
        color: {
            bg: 'bg-yellow-100 dark:bg-yellow-900',
            border: 'border-yellow-500',
            text: 'text-yellow-800 dark:text-yellow-200'
        },
        paletteColor: 'bg-yellow-500 hover:bg-yellow-600',
        hexColor: '#eab308', // yellow-500
        getActiveValue: node => 'Выполнен',
        getPortColor: dataType => getPortColorForType(dataType)
    },
    
    // Ноды категории "Управление"
    if: {
        type: 'if',
        category: NODE_CATEGORIES.CONTROL,
        name: 'Условие',
        description: 'Условное ветвление',
        iconComponent: ArrowsRightLeftIcon,
        color: {
            bg: 'bg-indigo-100 dark:bg-indigo-900',
            border: 'border-indigo-500',
            text: 'text-indigo-800 dark:text-indigo-200'
        },
        paletteColor: 'bg-indigo-500 hover:bg-indigo-600',
        hexColor: '#6366f1', // indigo-500
        getActiveValue: node => node.state?.result !== undefined ? (node.state.result ? 'Истина' : 'Ложь') : null,
        getPortColor: dataType => getPortColorForType(dataType)
    },
    
    loop: {
        type: 'loop',
        category: NODE_CATEGORIES.CONTROL,
        name: 'Цикл',
        description: 'Выполняет блок кода несколько раз',
        iconComponent: ArrowPathIcon,
        color: {
            bg: 'bg-red-100 dark:bg-red-900',
            border: 'border-red-500',
            text: 'text-red-800 dark:text-red-200'
        },
        paletteColor: 'bg-red-500 hover:bg-red-600',
        hexColor: '#ef4444', // red-500
        getActiveValue: node => node.state?.currentIteration !== undefined ?
            `Итерация ${node.state.currentIteration + 1}/${node.state.count}` : null,
        getPortColor: dataType => getPortColorForType(dataType)
    },
};

/**
 * Получает цвет для порта в зависимости от типа данных
 * @param {string} dataType - Тип данных
 * @returns {string} - CSS-класс цвета
 */
export function getPortColorForType(dataType) {
    switch (dataType) {
        case 'number':
            return 'bg-green-500';
        case 'string':
            return 'bg-blue-500';
        case 'boolean':
            return 'bg-yellow-500';
        case 'flow':
            return 'bg-red-500';
        default:
            return 'bg-gray-500';
    }
}

/**
 * Получает HEX-цвет нода по его типу
 * @param {string} nodeType - Тип нода
 * @returns {string} - HEX-цвет для мини-карты
 */
export function getNodeHexColor(nodeType) {
    return nodeRegistry[nodeType]?.hexColor || '#9ca3af';
}

/**
 * Форматирует значение для отображения
 * @param {any} value - Значение для форматирования
 * @returns {string} - Отформатированное значение
 */
export function formatDisplayValue(value) {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    
    if (typeof value === 'object') {
        try {
            return JSON.stringify(value);
        } catch (e) {
            return '[Объект]';
        }
    }
    
    const stringValue = String(value);
    
    // Ограничиваем длину строки для отображения
    if (stringValue.length > 10) {
        return stringValue.substring(0, 8) + '...';
    }
    
    return stringValue;
}

/**
 * Получает категорию нода по его типу
 * @param {string} nodeType - Тип нода
 * @returns {string} - Категория нода
 */
export function getNodeDefinition(nodeType) {
    return nodeRegistry[nodeType] || null;
}

/**
 * Получает категорию нода по его типу
 * @param {string} nodeType - Тип нода
 * @returns {string} - Категория нода
 */
export function getNodeCategory(nodeType) {
    const nodeDef = getNodeDefinition(nodeType);
    return nodeDef ? nodeDef.category : null;
}

/**
 * Получает все типы нодов
 * @returns {Object} - Реестр нодов
 */
export function getAllNodeTypes() {
    return nodeRegistry;
}

/**
 * Получает список нодов по категории
 * @param {string} category - Категория нодов
 * @returns {Array} - Массив определений нодов в категории
 */
export function getNodesByCategory(category) {
    return Object.values(nodeRegistry).filter(nodeDef => nodeDef.category === category);
}

/**
 * Получает список всех категорий с их нодами
 * @returns {Array} - Массив категорий с нодами
 */
export function getNodeCategories() {
    const categories = {};
    
    // Инициализируем категории
    Object.values(NODE_CATEGORIES).forEach(category => {
        categories[category] = {
            id: category,
            name: getCategoryName(category),
            nodes: []
        };
    });
    
    // Заполняем категории нодами
    Object.values(nodeRegistry).forEach(nodeDef => {        
        const category = nodeDef.category;
        if (categories[category]) {
            categories[category].nodes.push({
                ...nodeDef,
                icon: nodeDef.iconComponent
            });
        }
    });
    
    return Object.values(categories);
}

/**
 * Получает имя категории по ее идентификатору
 * @param {string} categoryId - Идентификатор категории
 * @returns {string} - Имя категории
 */
function getCategoryName(categoryId) {
    switch (categoryId) {
        case NODE_CATEGORIES.VARIABLES:
            return 'Переменные';
        case NODE_CATEGORIES.OPERATIONS:
            return 'Операции';
        case NODE_CATEGORIES.CONTROL:
            return 'Управление';
        default:
            return 'Другое';
    }
}

export default nodeRegistry;