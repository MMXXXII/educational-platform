import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { createNode } from '../nodes/NodeFactory';

/**
 * Хук для управления функциональностью перетаскивания элементов в ReactFlow
 * 
 * @param {React.RefObject} reactFlowWrapper - Ссылка на DOM-элемент ReactFlow
 * @param {React.RefObject} reactFlowInstance - Ссылка на экземпляр ReactFlow
 * @param {Function} setNodes - Функция для обновления состояния узлов
 * @param {Function} setIsModified - Функция для отметки состояния проекта как измененного
 * @returns {Object} - Объект с обработчиками перетаскивания
 */
const useDragAndDrop = (reactFlowWrapper, reactFlowInstance, setNodes, setIsModified) => {
    /**
     * Обработчик перетаскивания над областью ReactFlow
     */
    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    /**
     * Обработчик сброса элемента в область ReactFlow
     */
    const onDrop = useCallback((event) => {
        event.preventDefault();

        // Получаем позицию указателя относительно ReactFlow
        const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
        
        const position = reactFlowInstance.current.screenToFlowPosition({
            x: event.clientX - reactFlowBounds.left,
            y: event.clientY - reactFlowBounds.top,
        });

        // Получаем тип нода из объекта перетаскивания
        const nodeType = event.dataTransfer.getData('application/reactflow');
        // Получаем дополнительные данные нода, если они есть
        let nodeData = {};
        try {
            const dataStr = event.dataTransfer.getData('application/json');
            if (dataStr) {
                nodeData = JSON.parse(dataStr);
            }
        } catch (error) {
            console.error('Ошибка парсинга данных нода:', error);
        }

        if (!nodeType) return;

        // Создаем экземпляр нода
        const nodeId = uuidv4();
        const nodeInstance = createNode(nodeType, {
            id: nodeId,
            ...nodeData
        });

        // Преобразуем экземпляр нода в формат ReactFlow
        const newNode = {
            id: nodeId,
            type: 'customNode',
            position,
            data: {
                nodeRef: nodeInstance,
                id: nodeInstance.id,
                type: nodeInstance.type,
                label: nodeInstance.label,
                inputs: nodeInstance.inputs,
                outputs: nodeInstance.outputs,
            },
        };

        // Добавляем новый нод в массив нодов
        setNodes((nds) => [...nds, newNode]);
        setIsModified(true);
    }, [setNodes, setIsModified, reactFlowWrapper, reactFlowInstance]);

    return { onDragOver, onDrop };
};

export default useDragAndDrop;