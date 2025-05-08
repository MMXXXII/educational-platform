import React, { memo } from 'react';
import { getNodeDefinition } from '../services/nodeRegistry';

// Импорт компонентов разных типов нодов
import VariableNode from './components/VariableNode';
import OperationNode from './components/OperationNode';
import ControlNode from './components/ControlNode';
import PrintNode from './components/PrintNode';
import AssignmentNode from './components/AssignmentNode';
import BooleanLogicNode from './components/BooleanLogicNode';

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
    
    // Получаем определение типа нода из реестра
    const nodeDefinition = getNodeDefinition(nodeType);
    
    // Выбираем компонент в зависимости от типа нода
    switch (nodeType) {
        case 'variable':
            return (
                <VariableNode
                    id={id}
                    data={data}
                    selected={selected}
                    nodeDefinition={nodeDefinition}
                />
            );
            
        case 'assignment':
            return (
                <AssignmentNode
                    id={id}
                    data={data}
                    selected={selected}
                    nodeDefinition={nodeDefinition}
                />
            );
            
        case 'math':
        case 'logical':
            return (
                <OperationNode
                    id={id}
                    data={data}
                    selected={selected}
                    nodeDefinition={nodeDefinition}
                />
            );
            
        case 'booleanLogic':
            return (
                <BooleanLogicNode
                    id={id}
                    data={data}
                    selected={selected}
                    nodeDefinition={nodeDefinition}
                />
            );
            
        case 'if':
        case 'loop':
            return (
                <ControlNode
                    id={id}
                    data={data}
                    selected={selected}
                    nodeDefinition={nodeDefinition}
                />
            );
            
        case 'print':
            return (
                <PrintNode
                    id={id}
                    data={data}
                    selected={selected}
                    nodeDefinition={nodeDefinition}
                />
            );
            
        default:
            // Возвращаем стандартный компонент для неизвестных типов нодов
            return (
                <div className="bg-gray-100 dark:bg-gray-800 border-2 border-gray-500 p-3 rounded-md shadow w-48 min-h-[100px]">
                    <div className="font-bold text-center mb-2 border-b border-gray-300 dark:border-gray-700">
                        {data?.label || 'Неизвестный нод'}
                    </div>
                    <div className="text-center text-sm">
                        Тип: {nodeType || 'не определен'}
                    </div>
                </div>
            );
    }
};

export default memo(NodeRenderer);