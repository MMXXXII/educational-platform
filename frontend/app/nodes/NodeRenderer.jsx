import React, { memo, useCallback } from 'react';
import { getNodeDefinition } from '../services/nodeRegistry';
import { useStore, useReactFlow } from 'reactflow';

// Импорт компонентов разных типов нодов
import VariableNode from './components/VariableNode';
import OperationNode from './components/OperationNode';
import ControlNode from './components/ControlNode';
import PrintNode from './components/PrintNode';
import AssignmentNode from './components/AssignmentNode';
import BooleanLogicNode from './components/BooleanLogicNode';

// Импорт компонентов для 3D-сцены
import PlayerNode from './components/PlayerNode';
import MoveNode from './components/MoveNode';
import TurnNode from './components/TurnNode';
import WallAheadNode from './components/WallAheadNode';
import ExitReachedNode from './components/ExitReachedNode';
import JumpNode from './components/JumpNode';

// Импортируем общий компонент заголовка и тулбар
import NodeHeader from './components/NodeHeader';
import NodeToolbar from './components/NodeToolbar';

/**
 * Главный компонент NodeRenderer, маршрутизирующий рендеринг нодов разных типов
 * @param {Object} props - Свойства компонента
 * @param {Object} props.data - Данные нода
 * @param {boolean} props.selected - Выбран ли нод
 * @param {string} props.id - ID нода
 * @returns {JSX.Element} JSX элемент соответствующего типа нода
 */
const NodeRenderer = ({ data, selected, id }) => {
    const nodeType = data?.type;
    const reactFlowInstance = useReactFlow();

    // Обработчик удаления нода
    const handleDeleteNode = useCallback(() => {
        if (id) {
            reactFlowInstance.deleteElements({ nodes: [{ id }] });
        }
    }, [id, reactFlowInstance]);

    // Получаем определение типа нода из реестра
    const nodeDefinition = getNodeDefinition(nodeType);

    let nodeComponent;

    // Выбираем компонент в зависимости от типа нода
    switch (nodeType) {
        // Стандартные ноды
        case 'variable':
            nodeComponent = (
                <VariableNode
                    id={id}
                    data={data}
                    selected={selected}
                    nodeDefinition={nodeDefinition}
                />
            );
            break;

        case 'assignment':
            nodeComponent = (
                <AssignmentNode
                    id={id}
                    data={data}
                    selected={selected}
                    nodeDefinition={nodeDefinition}
                />
            );
            break;

        case 'math':    
        case 'logical':
            nodeComponent = (
                <OperationNode
                    id={id}
                    data={data}
                    selected={selected}
                    nodeDefinition={nodeDefinition}
                />
            );
            break;

        case 'booleanLogic':
            nodeComponent = (
                <BooleanLogicNode
                    id={id}
                    data={data}
                    selected={selected}
                    nodeDefinition={nodeDefinition}
                />
            );
            break;

        case 'if':
        case 'loop':
            nodeComponent = (
                <ControlNode
                    id={id}
                    data={data}
                    selected={selected}
                    nodeDefinition={nodeDefinition}
                />
            );
            break;

        case 'print':
            nodeComponent = (
                <PrintNode
                    id={id}
                    data={data}
                    selected={selected}
                    nodeDefinition={nodeDefinition}
                />
            );
            break;

        // 3D-сцена ноды
        case 'player':
            nodeComponent = (
                <PlayerNode
                    id={id}
                    data={data}
                    selected={selected}
                    nodeDefinition={nodeDefinition}
                />
            );
            break;

        case 'move':
            nodeComponent = (
                <MoveNode
                    id={id}
                    data={data}
                    selected={selected}
                    nodeDefinition={nodeDefinition}
                />
            );
            break;

        case 'turn':
            nodeComponent = (
                <TurnNode
                    id={id}
                    data={data}
                    selected={selected}
                    nodeDefinition={nodeDefinition}
                />
            );
            break;

        case 'wallAhead':
            nodeComponent = (
                <WallAheadNode
                    id={id}
                    data={data}
                    selected={selected}
                    nodeDefinition={nodeDefinition}
                />
            );
            break;

        case 'exitReached':
            nodeComponent = (
                <ExitReachedNode
                    id={id}
                    data={data}
                    selected={selected}
                    nodeDefinition={nodeDefinition}
                />
            );
            break;

        case 'jump':
            nodeComponent = (
                <JumpNode
                    id={id}
                    data={data}
                    selected={selected}
                    nodeDefinition={nodeDefinition}
                />
            );
            break;

        default:
            // Возвращаем стандартный компонент для неизвестных типов нодов
            nodeComponent = (
                <div className="bg-gray-100 dark:bg-gray-800 border-2 border-gray-500 p-3 rounded-md shadow w-48 min-h-[100px]">
                    <NodeHeader>
                        {data?.label || 'Неизвестный нод'}
                    </NodeHeader>
                    <div className="text-center text-sm">
                        Тип: {nodeType || 'не определен'}
                    </div>
                </div>
            );
    }

    return (
        <>
            <NodeToolbar
                selected={selected}
                nodeId={id}
                onDelete={handleDeleteNode}
            />
            {nodeComponent}
        </>
    );
};

export default memo(NodeRenderer);