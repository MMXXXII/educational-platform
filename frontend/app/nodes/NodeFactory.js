// NodeRegistry.js - управление типами узлов
import { v4 as uuidv4 } from 'uuid';
import BaseNode from './BaseNode';

// Импорт всех типов узлов
import * as nodeTypes from './types';

// Создаем реестр типов узлов
const registry = {
    variable: nodeTypes.VariableNode,
    number: nodeTypes.NumberNode,
    string: nodeTypes.StringNode,
    print: nodeTypes.PrintNode,
    loop: nodeTypes.LoopNode,
    math: nodeTypes.MathNode,
    if: nodeTypes.IfNode,
    get_variable: nodeTypes.GetVariableNode,
    set_variable: nodeTypes.SetVariableNode
};

/**
 * Создает узел указанного типа
 * @param {string} type - Тип узла
 * @param {Object} data - Данные для инициализации узла
 * @returns {BaseNode} - Экземпляр созданного узла
 */
export function createNode(type, data = {}) {
    const NodeClass = registry[type];
    if (!NodeClass) {
        throw new Error(`Unknown node type: ${type}`);
    }
    return new NodeClass(data.id, data);
}

/**
 * Регистрирует новый тип узла
 * @param {string} type - Тип узла
 * @param {class} NodeClass - Класс узла
 */
export function registerNodeType(type, NodeClass) {
    registry[type] = NodeClass;
}

// Экспорт базового класса и функций
export { BaseNode };
export { registry as nodeTypes };

// Реэкспорт всех типов узлов
export * from './types';

// Экспорт по умолчанию
export default {
    BaseNode,
    createNode,
    registerNodeType,
    nodeTypes: registry,
    ...nodeTypes
};