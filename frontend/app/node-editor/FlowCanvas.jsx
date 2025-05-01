import React, { useCallback, useRef, useEffect, useMemo } from 'react';
import ReactFlow, {
    addEdge,
    Background,
    Controls,
    MiniMap,
    Panel,
    useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useEditor } from '../contexts/EditorContext';
import { v4 as uuidv4 } from 'uuid';
import { createNode } from '../nodes/NodeTypes';
import ExecutionControls from './ExecutionControls';
import useNodeExecution from '../hooks/useNodeExecution';
import CustomNode from '../nodes/CustomNode';
import AnimatedDataEdge from './AnimatedDataEdge';
import './flowStyles.css';
import './reactFlowTheme.css';

/**
 * Компонент для отображения и работы с графом нодов
 */
const FlowCanvas = () => {
    // Получаем данные и методы из контекста редактора
    const {
        nodes,
        edges,
        setNodes,
        setEdges,
        onNodesChange,
        onEdgesChange,
        setIsModified,
        setSelectedNodeId
    } = useEditor();

    // Ссылка на экземпляр ReactFlow
    const reactFlowWrapper = useRef(null);
    const reactFlowInstance = useRef(null);

    // Хук для выполнения алгоритма
    const {
        isExecuting,
        isPaused,
        executionStep,
        consoleOutput,
        dataFlows,
        startExecution,
        stopExecution,
        executeStep,
        runFullAlgorithm
    } = useNodeExecution(nodes, edges, setNodes);

    // Определяем типы нодов и рёбер
    const nodeTypes = useMemo(() => ({
        customNode: CustomNode
    }), []);

    const edgeTypes = useMemo(() => ({
        animatedEdge: AnimatedDataEdge
    }), []);

    // Обновляем ребра с информацией о передаче данных
    const edgesWithData = useMemo(() => {
        if (!dataFlows || dataFlows.length === 0) return edges;

        return edges.map(edge => {
            // Ищем информацию о передаче данных для этого ребра
            const dataTransfer = dataFlows.find(flow => flow.edgeId === edge.id);

            if (dataTransfer) {
                return {
                    ...edge,
                    type: 'animatedEdge',
                    animated: dataTransfer.isFlow || false,
                    data: {
                        ...edge.data,
                        dataTransfer
                    }
                };
            }

            return edge;
        });
    }, [edges, dataFlows]);

    /**
     * Обработчик добавления новой связи
     */
    const onConnect = useCallback((params) => {
        setEdges((eds) => addEdge({
            ...params,
            id: `edge-${uuidv4()}`,
            type: 'animatedEdge',
            animated: params.sourceHandle?.includes('flow') || params.targetHandle?.includes('flow'),
            style: { stroke: '#555', strokeWidth: 2 }
        }, eds));
        setIsModified(true);
    }, [setEdges, setIsModified]);

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
        const position = reactFlowInstance.current.project({
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
            console.error('Error parsing node data:', error);
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
    }, [setNodes, setIsModified]);

    /**
     * Сохраняем экземпляр ReactFlow при загрузке
     */
    const onInit = useCallback((instance) => {
        reactFlowInstance.current = instance;
    }, []);

    /**
     * Обработчик выбора нода
     */
    const onSelectionChange = useCallback(({ nodes }) => {
        if (nodes.length === 1) {
            setSelectedNodeId(nodes[0].id);
        } else {
            setSelectedNodeId(null);
        }
    }, [setSelectedNodeId]);

    /**
     * Обработчик изменений в нодах для обновления UI после редактирования свойств
     */
    const handleNodesChange = useCallback((changes) => {
        onNodesChange(changes);

        // Проверяем, нужно ли обновить представление нода из-за изменения данных
        const nodeDataChanges = changes.filter(
            change => change.type === 'select' && change.selected
        );

        if (nodeDataChanges.length > 0) {
            setNodes(currentNodes => {
                return currentNodes.map(node => {
                    if (node.data.nodeRef) {
                        // Обновляем данные нода из его референса
                        return {
                            ...node,
                            data: {
                                ...node.data,
                                label: node.data.nodeRef.label,
                                inputs: node.data.nodeRef.inputs,
                                outputs: node.data.nodeRef.outputs,
                            }
                        };
                    }
                    return node;
                });
            });
        }
    }, [onNodesChange, setNodes]);

    /**
     * Эффект для обновления нодов при изменении их внутренних свойств
     */
    useEffect(() => {
        const interval = setInterval(() => {
            setNodes(currentNodes => {
                // Проверяем, есть ли изменения в нодах
                const hasChanges = currentNodes.some(node => {
                    if (!node.data.nodeRef) return false;

                    return (
                        node.data.label !== node.data.nodeRef.label ||
                        JSON.stringify(node.data.inputs) !== JSON.stringify(node.data.nodeRef.inputs) ||
                        JSON.stringify(node.data.outputs) !== JSON.stringify(node.data.nodeRef.outputs)
                    );
                });

                // Если изменений нет, возвращаем текущие ноды
                if (!hasChanges) return currentNodes;

                // Обновляем ноды с изменившимися свойствами
                return currentNodes.map(node => {
                    if (!node.data.nodeRef) return node;

                    if (
                        node.data.label !== node.data.nodeRef.label ||
                        JSON.stringify(node.data.inputs) !== JSON.stringify(node.data.nodeRef.inputs) ||
                        JSON.stringify(node.data.outputs) !== JSON.stringify(node.data.nodeRef.outputs)
                    ) {
                        return {
                            ...node,
                            data: {
                                ...node.data,
                                label: node.data.nodeRef.label,
                                inputs: node.data.nodeRef.inputs,
                                outputs: node.data.nodeRef.outputs,
                            }
                        };
                    }

                    return node;
                });
            });
        }, 500); // Проверяем каждые 500мс

        return () => clearInterval(interval);
    }, [setNodes]);

    return (
        <div className="flex flex-1 h-full">
            <div className="flex-1 h-full" ref={reactFlowWrapper}>
                <ReactFlow
                    nodes={nodes}
                    edges={edgesWithData}
                    onNodesChange={handleNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onInit={onInit}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onSelectionChange={onSelectionChange}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    deleteKeyCode="Delete"
                    multiSelectionKeyCode="Control"
                    snapToGrid={true}
                    snapGrid={[15, 15]}
                    defaultViewport={{ x: 0, y: 0, zoom: 1 }}
                    fitView
                    className="theme-flow"
                >
                    <Controls />
                    <MiniMap
                        nodeStrokeColor={(n) => {
                            if (n.selected) return '#ff0072';
                            return '#555';
                        }}
                        nodeColor={(n) => {
                            switch (n.data.type) {
                                case 'variable': return '#3b82f6';
                                case 'number':
                                case 'string': return '#10b981';
                                case 'math': return '#8b5cf6';
                                case 'print': return '#f59e0b';
                                case 'loop': return '#ef4444';
                                case 'if': return '#6366f1';
                                default: return '#9ca3af';
                            }
                        }}
                    />
                    <Background color="#aaa" gap={16} />

                    <Panel position="top-right">
                        <ExecutionControls
                            isExecuting={isExecuting}
                            executionStep={executionStep}
                            onStart={startExecution}
                            onStop={stopExecution}
                            onStep={executeStep}
                            onRunFull={runFullAlgorithm}
                            consoleOutput={consoleOutput}
                        />
                    </Panel>
                </ReactFlow>
            </div>
        </div>
    );
};

export default FlowCanvas;