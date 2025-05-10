import React, { useCallback, useRef, useMemo, useEffect } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useEditor } from '../contexts/EditorContext';
import useNodeExecution from '../hooks/useNodeExecution';
import NodeRenderer from '../nodes/NodeRenderer';
import AnimatedDataEdge from './AnimatedDataEdge';
import RightSidebar from './RightSidebar';
import useDragAndDrop from '../hooks/useDragAndDrop';
import useNodeOperations from '../hooks/useNodeOperations';
import useEdgeDataFlow from '../hooks/useEdgeDataFlow';
import { getNodeHexColor } from '../services/nodeRegistry';
import './flowStyles.css';
import './reactFlowTheme.css';

/**
 * Обновленный компонент для отображения и работы с графом нодов
 * Позволяет настраивать сайдбар и другие элементы управления
 * 
 * @param {Object} props - Свойства компонента
 * @param {React.Component} props.sidebarComponent - Кастомный компонент сайдбара (опционально)
 * @param {Object} props.sidebarProps - Пропсы для компонента сайдбара (опционально)
 * @param {boolean} props.hideSidebar - Флаг скрытия сайдбара (опционально)
 * @param {boolean} props.hideControls - Флаг скрытия элементов управления (опционально)
 * @param {boolean} props.hideMiniMap - Флаг скрытия мини-карты (опционально)
 * @param {boolean} props.hideBackground - Флаг скрытия фона (опционально)
 * @param {Function} props.onNodeSelect - Обработчик выбора нода (опционально)
 */
const FlowCanvas = ({
    sidebarComponent: SidebarComponent = RightSidebar,
    sidebarProps = {},
    hideSidebar = false,
    hideControls = false,
    hideMiniMap = false,
    hideBackground = false,
    onNodeSelect,
}) => {
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
    const { onConnect, onSelectionChange: baseOnSelectionChange, handleNodesChange, validateExistingEdges } = useNodeOperations(
        setEdges,
        setNodes,
        onNodesChange,
        setIsModified,
        setSelectedNodeId
    );

    // Кастомный обработчик выбора нода
    const onSelectionChange = useCallback((selection) => {
        // Вызываем базовый обработчик
        baseOnSelectionChange(selection);
        
        // Если предоставлен внешний обработчик, вызываем его с выбранными нодами
        if (onNodeSelect && selection.nodes.length > 0) {
            onNodeSelect(selection.nodes[0]);
        }
    }, [baseOnSelectionChange, onNodeSelect]);

    // Рёбра с информацией о потоках данных
    const edgesWithData = useEdgeDataFlow(edges, dataFlows, nodes);

    // Определяем типы нодов и рёбер
    const nodeTypes = useMemo(() => ({
        customNode: NodeRenderer
    }), []);

    const edgeTypes = useMemo(() => ({
        animatedEdge: AnimatedDataEdge
    }), []);

    /**
     * Сохраняем экземпляр ReactFlow при загрузке
     */
    const onInit = useCallback((instance) => {
        reactFlowInstance.current = instance;
        
        // Запускаем валидацию соединений после инициализации
        setTimeout(() => {
            validateExistingEdges();
        }, 500);
    }, [validateExistingEdges]);

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
                
                // Запускаем валидацию соединений после масштабирования
                validateExistingEdges();
            }, 100);
        }
    }, [needsFitView, setNeedsFitView, validateExistingEdges]);

    // Подготовка свойств для сайдбара
    const completeNodeData = useMemo(() => {
        return selectedNodeId 
            ? nodes.find(node => node.id === selectedNodeId) 
            : null;
    }, [selectedNodeId, nodes]);

    // Соединяем стандартные свойства сайдбара с пользовательскими
    const mergedSidebarProps = {
        isExecuting,
        executionStep,
        onStop: stopExecution,
        onStep: executeStep, 
        onRunFull: runFullAlgorithm,
        consoleOutput,
        selectedNodeId,
        selectedNode: completeNodeData,
        nodes,
        ...sidebarProps
    };

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
                    {!hideControls && <Controls />}
                    {!hideMiniMap && <FlowMiniMap />}
                    {!hideBackground && <FlowBackground />}

                    {/* Рендерим сайдбар только если он не скрыт */}
                    {!hideSidebar && <SidebarComponent {...mergedSidebarProps} />}
                </ReactFlow>
            </div>
        </div>
    );
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
                // Используем функцию getNodeHexColor для получения цвета из реестра нодов
                return getNodeHexColor(n.data.type);
            }}
            pannable 
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