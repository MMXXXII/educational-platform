/**
 * Утилиты для работы с нодами и графом
 */

/**
 * Находит все входные ноды для указанного нода
 * @param {string} nodeId - Идентификатор нода
 * @param {Array} edges - Массив связей
 * @returns {Array} - Массив идентификаторов входных нодов
 */
export const getInputNodes = (nodeId, edges) => {
    return edges
        .filter(edge => edge.target === nodeId)
        .map(edge => edge.source);
};

/**
 * Находит все выходные ноды для указанного нода
 * @param {string} nodeId - Идентификатор нода
 * @param {Array} edges - Массив связей
 * @returns {Array} - Массив идентификаторов выходных нодов
 */
export const getOutputNodes = (nodeId, edges) => {
    return edges
        .filter(edge => edge.source === nodeId)
        .map(edge => edge.target);
};

/**
 * Находит все связи для указанного входного порта
 * @param {string} nodeId - Идентификатор нода
 * @param {string} handleId - Идентификатор порта
 * @param {Array} edges - Массив связей
 * @returns {Array} - Массив связей
 */
export const getInputEdges = (nodeId, handleId, edges) => {
    return edges.filter(edge =>
        edge.target === nodeId &&
        edge.targetHandle === handleId
    );
};

/**
 * Находит все связи для указанного выходного порта
 * @param {string} nodeId - Идентификатор нода
 * @param {string} handleId - Идентификатор порта
 * @param {Array} edges - Массив связей
 * @returns {Array} - Массив связей
 */
export const getOutputEdges = (nodeId, handleId, edges) => {
    return edges.filter(edge =>
        edge.source === nodeId &&
        edge.sourceHandle === handleId
    );
};

/**
 * Проверяет, может ли быть создана связь между двумя портами
 * @param {Object} connection - Объект связи
 * @param {Array} nodes - Массив нодов
 * @param {Array} edges - Массив существующих связей
 * @returns {boolean} - Может ли быть создана связь
 */
export const isValidConnection = (connection, nodes, edges) => {
    // Находим ноды источника и назначения
    const sourceNode = nodes.find(node => node.id === connection.source);
    const targetNode = nodes.find(node => node.id === connection.target);

    if (!sourceNode || !targetNode) {
        return false;
    }

    // Находим порты источника и назначения
    const sourceOutput = sourceNode.data.outputs?.find(
        output => output.id === connection.sourceHandle
    );

    const targetInput = targetNode.data.inputs?.find(
        input => input.id === connection.targetHandle
    );

    if (!sourceOutput || !targetInput) {
        return false;
    }

    // Проверяем совместимость типов данных
    if (sourceOutput.dataType !== targetInput.dataType &&
        sourceOutput.dataType !== 'any' &&
        targetInput.dataType !== 'any') {
        return false;
    }

    // Проверяем, что входной порт не имеет уже существующей связи
    // (кроме flow-типов, которые могут иметь несколько входящих связей)
    if (targetInput.dataType !== 'flow') {
        const existingConnection = edges.find(edge =>
            edge.target === connection.target &&
            edge.targetHandle === connection.targetHandle
        );

        if (existingConnection) {
            return false;
        }
    }

    return true;
};

/**
 * Находит все нодовые циклы в графе
 * @param {Array} nodes - Массив нодов
 * @param {Array} edges - Массив связей
 * @returns {Array} - Массив массивов идентификаторов нодов, образующих циклы
 */
export const findCycles = (nodes, edges) => {
    const cycles = [];
    const visited = new Set();
    const path = new Set();

    // Строим карту смежности
    const adjacencyMap = {};

    nodes.forEach(node => {
        adjacencyMap[node.id] = getOutputNodes(node.id, edges);
    });

    // Функция для обхода графа в глубину
    const dfs = (nodeId, startId, currentPath = []) => {
        // Если нод уже в текущем пути, значит нашли цикл
        if (path.has(nodeId)) {
            // Находим начало цикла
            const cycleStart = currentPath.indexOf(nodeId);
            if (cycleStart !== -1) {
                cycles.push(currentPath.slice(cycleStart));
            }
            return;
        }

        // Если нод уже посещен, пропускаем
        if (visited.has(nodeId)) {
            return;
        }

        // Добавляем нод в текущий путь
        visited.add(nodeId);
        path.add(nodeId);
        currentPath.push(nodeId);

        // Обходим все выходные ноды
        const nextNodes = adjacencyMap[nodeId] || [];
        nextNodes.forEach(nextNodeId => {
            dfs(nextNodeId, startId, [...currentPath]);
        });

        // Удаляем нод из текущего пути
        path.delete(nodeId);
    };

    // Запускаем обход для каждого нода
    nodes.forEach(node => {
        dfs(node.id, node.id);
    });

    return cycles;
};

/**
 * Создает уникальный идентификатор для нового нода
 * @param {string} prefix - Префикс идентификатора
 * @param {Array} existingIds - Массив существующих идентификаторов
 * @returns {string} - Уникальный идентификатор
 */
export const generateUniqueNodeId = (prefix, existingIds) => {
    let id;
    let counter = 1;

    do {
        id = `${prefix}-${counter}`;
        counter++;
    } while (existingIds.includes(id));

    return id;
};

/**
 * Возвращает примерный центр выделенных нодов
 * @param {Array} selectedNodes - Массив выделенных нодов
 * @returns {Object} - Координаты центра {x, y}
 */
export const getSelectionCenter = (selectedNodes) => {
    if (!selectedNodes.length) {
        return { x: 0, y: 0 };
    }

    const sum = selectedNodes.reduce((acc, node) => {
        return {
            x: acc.x + node.position.x,
            y: acc.y + node.position.y
        };
    }, { x: 0, y: 0 });

    return {
        x: sum.x / selectedNodes.length,
        y: sum.y / selectedNodes.length
    };
};

/**
 * Находит оптимальное расположение для нового нода
 * @param {Object} parentNode - Родительский нод
 * @param {Array} existingNodes - Массив существующих нодов
 * @param {Array} existingEdges - Массив существующих связей
 * @param {string} direction - Направление размещения ('right', 'below')
 * @returns {Object} - Координаты для нового нода {x, y}
 */
export const findOptimalNodePosition = (parentNode, existingNodes, existingEdges, direction = 'right') => {
    if (!parentNode) {
        // Если нет родительского нода, размещаем в центре
        return { x: 300, y: 200 };
    }

    // Базовое смещение от родительского нода
    const baseOffset = {
        right: { x: 250, y: 0 },
        below: { x: 0, y: 150 }
    }[direction] || { x: 250, y: 0 };

    // Находим дочерние ноды
    const childNodeIds = getOutputNodes(parentNode.id, existingEdges);
    const childNodes = existingNodes.filter(node => childNodeIds.includes(node.id));

    if (childNodes.length === 0) {
        // Если нет дочерних нодов, используем базовое смещение
        return {
            x: parentNode.position.x + baseOffset.x,
            y: parentNode.position.y + baseOffset.y
        };
    }

    // Находим самую правую/нижнюю позицию среди дочерних нодов
    let maxPos = direction === 'right'
        ? Math.max(...childNodes.map(node => node.position.x))
        : Math.max(...childNodes.map(node => node.position.y));

    return {
        x: direction === 'right' ? maxPos + 150 : parentNode.position.x + baseOffset.x,
        y: direction === 'below' ? maxPos + 100 : parentNode.position.y + baseOffset.y
    };
};

/**
 * Автоматически выравнивает ноды для лучшей читаемости
 * @param {Array} nodes - Массив нодов
 * @param {Array} edges - Массив связей
 * @returns {Array} - Массив нодов с обновленными позициями
 */
export const autoArrangeNodes = (nodes, edges) => {
    if (nodes.length === 0) return nodes;

    // Находим начальные ноды (те, у которых нет входящих связей)
    const nodeIdsWithInputs = new Set(edges.map(edge => edge.target));
    const startNodes = nodes.filter(node => !nodeIdsWithInputs.has(node.id));

    if (startNodes.length === 0) {
        // Если нет начальных нодов (возможно, есть циклы), берем первый нод
        startNodes.push(nodes[0]);
    }

    // Создаем карту смежности для быстрого поиска связанных нодов
    const adjacencyMap = {};
    nodes.forEach(node => {
        adjacencyMap[node.id] = {
            inputs: edges.filter(edge => edge.target === node.id).map(edge => edge.source),
            outputs: edges.filter(edge => edge.source === node.id).map(edge => edge.target)
        };
    });

    // Определяем уровни нодов (глубина от начальных нодов)
    const nodeLevels = {};
    const visited = new Set();

    // Обход графа в ширину для определения уровней
    const queue = startNodes.map(node => ({ id: node.id, level: 0 }));

    while (queue.length > 0) {
        const { id, level } = queue.shift();

        if (visited.has(id)) {
            // Обновляем уровень, если нашли более короткий путь
            nodeLevels[id] = Math.min(nodeLevels[id], level);
            continue;
        }

        visited.add(id);
        nodeLevels[id] = level;

        // Добавляем соседей в очередь
        const outputNodes = adjacencyMap[id].outputs;
        outputNodes.forEach(outputId => {
            if (!visited.has(outputId)) {
                queue.push({ id: outputId, level: level + 1 });
            }
        });
    }

    // Группируем ноды по уровням
    const levelGroups = {};
    Object.entries(nodeLevels).forEach(([id, level]) => {
        if (!levelGroups[level]) {
            levelGroups[level] = [];
        }
        levelGroups[level].push(id);
    });

    // Определяем порядок нодов на каждом уровне
    const nodeOrder = {};
    Object.entries(levelGroups).forEach(([level, nodeIds]) => {
        // Сортируем ноды по количеству связей
        nodeIds.sort((a, b) => {
            const aLinks = adjacencyMap[a].inputs.length + adjacencyMap[a].outputs.length;
            const bLinks = adjacencyMap[b].inputs.length + adjacencyMap[b].outputs.length;
            return bLinks - aLinks;
        });

        // Присваиваем порядок
        nodeIds.forEach((id, index) => {
            nodeOrder[id] = index;
        });
    });

    // Определяем новые позиции нодов
    const horizontalSpacing = 300;
    const verticalSpacing = 150;
    const updatedNodes = nodes.map(node => {
        const level = nodeLevels[node.id] || 0;
        const order = nodeOrder[node.id] || 0;

        return {
            ...node,
            position: {
                x: level * horizontalSpacing,
                y: order * verticalSpacing
            }
        };
    });

    return updatedNodes;
};


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

export default {
    getInputNodes,
    getOutputNodes,
    getInputEdges,
    getOutputEdges,
    isValidConnection,
    findCycles,
    generateUniqueNodeId,
    getSelectionCenter,
    findOptimalNodePosition,
    autoArrangeNodes,
    getPortColor,
    formatDisplayValue,
    getOutputPortPosition,
    getInputPortPosition,
    checkNodeConnections,
    getNodeClassName,
};