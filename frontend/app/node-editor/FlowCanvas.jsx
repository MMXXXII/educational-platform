import React, { useCallback, useRef, useMemo, useEffect } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useEditor } from '../contexts/EditorContext';
import useNodeExecution from '../hooks/useNodeExecution';
import CustomNode from '../nodes/CustomNode';
import AnimatedDataEdge from './AnimatedDataEdge';
import RightSidebar from './RightSidebar';
import useDragAndDrop from '../hooks/useDragAndDrop';
import useNodeOperations from '../hooks/useNodeOperations';
import useEdgeDataFlow from '../hooks/useEdgeDataFlow';
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
        setSelectedNodeId,
        selectedNodeId,
        needsFitView,
        setNeedsFitView
    } = useEditor();

    // Ссылки на экземпляры ReactFlow
    const reactFlowWrapper = useRef(null);
    const reactFlowInstance = useRef(null);

    // Хук для выполнения алгоритма
    const {
        isExecuting,
        executionStep,
        consoleOutput,
        dataFlows,
        stopExecution,
        executeStep,
        runFullAlgorithm
    } = useNodeExecution(nodes, edges, setNodes);

    // Хук для перетаскивания нодов
    const { onDragOver, onDrop } = useDragAndDrop(
        reactFlowWrapper,
        reactFlowInstance,
        setNodes,
        setIsModified
    );

    // Хук для операций с нодами
    const { onConnect, onSelectionChange, handleNodesChange } = useNodeOperations(
        setEdges,
        setNodes,
        onNodesChange,
        setIsModified,
        setSelectedNodeId
    );

    // Рёбра с информацией о потоках данных
    const edgesWithData = useEdgeDataFlow(edges, dataFlows);

    // Определяем типы нодов и рёбер
    const nodeTypes = useMemo(() => ({
        customNode: CustomNode
    }), []);

    const edgeTypes = useMemo(() => ({
        animatedEdge: AnimatedDataEdge
    }), []);

    /**
     * Сохраняем экземпляр ReactFlow при загрузке
     */
    const onInit = useCallback((instance) => {
        reactFlowInstance.current = instance;
    }, []);

    // Эффект для автоматического масштабирования после загрузки проекта
    useEffect(() => {
        // Если флаг установлен и экземпляр ReactFlow существует
        if (needsFitView && reactFlowInstance.current) {
            // Даем немного времени, чтобы DOM обновился после рендеринга загруженных нодов
            setTimeout(() => {
                reactFlowInstance.current.fitView({ 
                    padding: 0.2,
                    includeHiddenNodes: false,
                    minZoom: 0.5,
                    maxZoom: 1.5
                });
                setNeedsFitView(false); // Сбрасываем флаг
            }, 100);
        }
    }, [needsFitView, setNeedsFitView]);

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
                    <FlowControls />
                    <FlowMiniMap />
                    <FlowBackground />

                    <RightSidebar
                        isExecuting={isExecuting}
                        executionStep={executionStep}
                        onStop={stopExecution}
                        onStep={executeStep}
                        onRunFull={runFullAlgorithm}
                        consoleOutput={consoleOutput}
                        selectedNodeId={selectedNodeId}
                        nodes={nodes}
                    />
                </ReactFlow>
            </div>
        </div>
    );
};

/**
 * Компонент элементов управления
 */
const FlowControls = () => {
    return <Controls />;
};

/**
 * Компонент мини-карты
 */
const FlowMiniMap = () => {
    return (
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
    );
};

/**
 * Компонент фона
 */
const FlowBackground = () => {
    return <Background color="#aaa" gap={16} />;
};

export default FlowCanvas;