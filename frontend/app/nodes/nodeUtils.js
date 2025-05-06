/**
 * Утилиты для работы с нодами в ReactFlow
 */

/**
 * Получает цвет для порта в зависимости от типа данных
 * @param {string} dataType - Тип данных
 * @returns {string} - CSS-класс цвета
 */
export const getPortColor = (dataType) => {
    switch (dataType) {
        case 'number': return 'bg-green-500';
        case 'string': return 'bg-blue-500';
        case 'boolean': return 'bg-yellow-500';
        case 'flow': return 'bg-red-500';
        default: return 'bg-gray-500';
    }
};

/**
 * Форматирует значение для отображения
 * @param {any} value - Значение для форматирования
 * @returns {string} - Отформатированное значение
 */
export const formatDisplayValue = (value) => {
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
};

/**
 * Рассчитывает позицию для выходного порта
 * @param {Object} output - Информация о выходном порте
 * @param {number} index - Индекс порта
 * @param {number} totalOutputs - Общее количество портов
 * @param {string} nodeType - Тип нода
 * @returns {number} - Позиция порта в процентах
 */
export const getOutputPortPosition = (output, index, totalOutputs, nodeType) => {
    const isOperationNode = nodeType === 'math' || nodeType === 'logical';

    // Для нода If, имеющего выходы true и false, позиционируем их раздельно
    if (nodeType === 'if') {
        // Если это выход 'true', помещаем его в верхнюю часть
        if (output.name === 'true') {
            return 30;
        }
        // Если это выход 'false', помещаем его в нижнюю часть
        if (output.name === 'false') {
            return 90;
        }
    }

    // Для остальных нодов стандартное позиционирование
    if (output.dataType === 'flow') {
        return 24; // Фиксированная позиция для flow-выходов
    } else if (isOperationNode) {
        // Позиции для операционных нодов
        return (output.name === 'result') ? 60 : 85;
    } else {
        // Позиции для обычных нодов - распределяем равномерно
        return 60 + (index * 25);
    }
};

/**
 * Рассчитывает позицию для входного порта
 * @param {Object} input - Информация о входном порте
 * @param {number} index - Индекс порта
 * @param {string} nodeType - Тип нода
 * @returns {number} - Позиция порта в процентах
 */
export const getInputPortPosition = (input, index, nodeType) => {
    const isOperationNode = nodeType === 'math' || nodeType === 'logical';

    if (input.dataType === 'flow') {
        return 24; // Фиксированная позиция для flow-входов
    } else if (isOperationNode) {
        // Для операционных нодов (math, logical)
        return (input.name === 'left') ? 60 : 85;
    } else {
        // Для обычных нодов - распределяем равномерно
        return 60 + (index * 25);
    }
};

/**
 * Проверяет соединения нода с другими нодами
 * @param {string} nodeId - ID нода
 * @param {Array} edges - Массив соединений
 * @returns {Object} - Объект с информацией о соединениях
 */
export const checkNodeConnections = (nodeId, edges) => {
    const connections = {
        left: false,
        right: false,
        value: false,
        inputs: {},
        outputs: {}
    };

    // Проверяем входящие соединения
    edges.forEach(edge => {
        if (edge.target === nodeId) {
            const inputName = edge.targetHandle.replace('input-', '');
            connections.inputs[inputName] = true;

            // Для совместимости с предыдущей версией
            if (inputName === 'left') connections.left = true;
            if (inputName === 'right') connections.right = true;
            if (inputName === 'value') connections.value = true;
        }

        if (edge.source === nodeId) {
            const outputName = edge.sourceHandle.replace('output-', '');
            connections.outputs[outputName] = true;
        }
    });

    return connections;
};

/**
 * Возвращает стандартный класс для стилизации нода
 * @param {Object} nodeColors - Объект с цветами для нода
 * @param {boolean} selected - Выбран ли нод
 * @param {string} nodeType - Тип нода
 * @returns {string} - CSS-класс для стилизации нода
 */
export const getNodeClassName = (nodeColors, selected, nodeType) => {
    const isOperationNode = nodeType === 'math' || nodeType === 'logical';

    return `
        ${nodeColors.bg} ${nodeColors.border} ${nodeColors.text}
        p-3 rounded-md border-2 w-48
        ${nodeType === 'logical' || nodeType === 'math' ? 'min-h-[160px]' : isOperationNode ? 'h-[120px]' : 'min-h-[140px]'}
        ${selected ? 'shadow-lg ring-2 ring-blue-400' : 'shadow'}
        flex flex-col relative
    `;
};