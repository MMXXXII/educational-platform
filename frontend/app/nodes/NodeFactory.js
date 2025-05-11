import { v4 as uuidv4 } from 'uuid';
import BaseNode from './BaseNode';

// Импорт всех типов узлов
import { VariableNode } from './types/VariableNode';
import { PrintNode } from './types/PrintNode';
import { LoopNode } from './types/LoopNode';
import { MathNode } from './types/MathNode';
import { LogicalNode } from './types/LogicalNode';
import { IfNode } from './types/IfNode';
import { AssignmentNode } from './types/AssignmentNode';
import { BooleanLogicNode } from './types/BooleanLogicNode';

// Импорт 3D Scene нодов
import { PlayerNode } from './types/PlayerNode';
import { MoveNode } from './types/MoveNode';
import { TurnNode } from './types/TurnNode';
import { WallAheadNode } from './types/WallAheadNode';
import { ExitReachedNode } from './types/ExitReachedNode';
import { JumpNode } from './types/JumpNode';

// Создаем реестр типов узлов
const registry = {
    variable: VariableNode,
    print: PrintNode,
    loop: LoopNode,
    math: MathNode,
    logical: LogicalNode,
    if: IfNode,
    assignment: AssignmentNode,
    booleanLogic: BooleanLogicNode,

    // 3D Scene ноды
    player: PlayerNode,
    move: MoveNode,
    turn: TurnNode,
    wallAhead: WallAheadNode,
    exitReached: ExitReachedNode,
    jump: JumpNode,
};

/**
 * Создает узел указанного типа
 * @param {string} type - Тип узла
 * @param {Object} data - Данные для инициализации узла
 * @returns {BaseNode} - Экземпляр созданного узла
 */
export function createNode(type, data = {}) {
    // Если требуется создать number или string, перенаправляем на variable
    // с соответствующим типом данных для обеспечения совместимости
    if (type === 'number') {
        return createNode('variable', {
            ...data,
            variableType: 'number',
            initialValue: data.value || 0
        });
    }

    if (type === 'string') {
        return createNode('variable', {
            ...data,
            variableType: 'string',
            initialValue: data.value || ''
        });
    }

    const NodeClass = registry[type];
    if (!NodeClass) {
        throw new Error(`Неизвестный тип узла: ${type}`);
    }
    return new NodeClass(data.id || uuidv4(), data);
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

// Экспорт по умолчанию
export default {
    BaseNode,
    createNode,
    registerNodeType,
    nodeTypes: registry
};