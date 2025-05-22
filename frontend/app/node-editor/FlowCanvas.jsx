import React, { useCallback, useRef, useMemo, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
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
import { createNode } from '../nodes/NodeFactory';

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
const FlowCanvas = forwardRef(({
    sidebarComponent: SidebarComponent = RightSidebar,
    sidebarProps = {},
    hideSidebar = false,
    hideControls = false,
    hideMiniMap = false,
    hideBackground = false,
    onNodeSelect,
}, ref) => {
    // Состояние для определения мобильной версии
    const [isMobile, setIsMobile] = useState(false);
    
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

    // Проверка размера экрана для мобильной версии
    useEffect(() => {
        const checkMobileView = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobileView();
        window.addEventListener('resize', checkMobileView);
        
        return () => {
            window.removeEventListener('resize', checkMobileView);
        };
    }, []);

    // Функция для добавления нода на холст через прямое нажатие (для мобильной версии)
    const addNodeDirectly = useCallback((nodeType, nodeData = {}) => {
        console.log("addNodeDirectly called with:", nodeType, nodeData);
        
        // Проверка аргументов и инициализации
        if (!nodeType) {
            console.error("addNodeDirectly: Missing nodeType");
            return;
        }
        
        try {
            // Вычисляем примерный центр экрана
            let centerX = 100;
            let centerY = 100;
            
            // Если reactFlowInstance инициализирован, используем его для вычисления центра
            if (reactFlowInstance.current) {
                const { x, y, zoom } = reactFlowInstance.current.getViewport();
                console.log("Current viewport:", { x, y, zoom });
                
                // Получаем размеры viewport
                const viewportWidth = reactFlowWrapper.current?.offsetWidth || window.innerWidth;
                const viewportHeight = reactFlowWrapper.current?.offsetHeight || window.innerHeight;
                console.log("Viewport dimensions:", { width: viewportWidth, height: viewportHeight });
                
                // Вычисляем центр текущего viewport
                centerX = ((viewportWidth / 2) - x) / zoom;
                centerY = ((viewportHeight / 2) - y) / zoom;
            }
            
            // Генерируем уникальный ID для нового нода
            const nodeId = `node_${Date.now()}`;
            
            // Создаем экземпляр нода используя NodeFactory
            const nodeInstance = createNode(nodeType, {
                id: nodeId,
                ...nodeData
            });

            // Преобразуем экземпляр нода в формат ReactFlow, как в onDrop
            const newNode = {
                id: nodeId,
                type: 'customNode',
                position: {
                    x: Math.round(centerX / 20) * 20, // Привязка к сетке 20px
                    y: Math.round(centerY / 20) * 20, // Привязка к сетке 20px
                },
                dragHandle: '.node-drag-handle',
                data: {
                    nodeRef: nodeInstance,
                    id: nodeInstance.id,
                    type: nodeInstance.type,
                    label: nodeInstance.label,
                    inputs: nodeInstance.inputs,
                    outputs: nodeInstance.outputs,
                }
            };
            
            console.log("Created new node:", newNode);
            
            // Используем функциональную форму обновления состояния
            setNodes(prevNodes => {
                const newNodes = [...prevNodes, newNode];
                console.log(`Adding node ${nodeId} to ${prevNodes.length} existing nodes. New count: ${newNodes.length}`);
                
                // Покажем новый список нодов
                console.log("Updated nodes list:", newNodes.map(n => ({ id: n.id, type: n.data?.type, position: n.position })));
                
                return newNodes;
            });
            
            setIsModified(true);
            setSelectedNodeId(nodeId);
            
            console.log(`Node ${nodeId} added successfully`);
            return true;
        } catch (error) {
            console.error("Error in addNodeDirectly:", error);
            return false;
        }
    }, [setNodes, setIsModified, setSelectedNodeId]);

    // Кастомный обработчик выбора нода
    const onSelectionChange = useCallback((selection) => {
        // Вызываем базовый обработчик
        baseOnSelectionChange(selection);
        
        // Если предоставлен внешний обработчик, вызываем его с выбранными нодами
        if (onNodeSelect && selection.nodes.length > 0) {
            onNodeSelect(selection.nodes[0]);
        }
    }, [baseOnSelectionChange, onNodeSelect]);

    // Переопределяем обработчик onNodeSelect для поддержки мобильного режима
    const handleNodeSelect = useCallback((nodeType, nodeData) => {
        console.log("FlowCanvas: handleNodeSelect", nodeType, nodeData, isMobile);
        if (isMobile) {
            // Для мобильных устройств добавляем нод напрямую в центр
            setTimeout(() => {
                addNodeDirectly(nodeType, nodeData);
            }, 100);
        } else if (onNodeSelect) {
            // Для десктопа используем обычное поведение
            onNodeSelect(nodeType, nodeData);
        }
    }, [isMobile, addNodeDirectly, onNodeSelect]);

    // Экспортируем handleNodeSelect через useState для доступа из других компонентов
    const [handleNodeSelectFn] = useState(() => (nodeType, nodeData) => {
        console.log("FlowCanvas export handleNodeSelect called", nodeType, nodeData);
        handleNodeSelect(nodeType, nodeData);
    });

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
        console.log("ReactFlow initialized");
        reactFlowInstance.current = instance;
        
        // Если нужно изменить масштаб для мобильных устройств
        if (isMobile) {
            instance.setViewport({ zoom: 0.7 });
        }
        
        // Запускаем валидацию соединений после инициализации
        setTimeout(() => {
            validateExistingEdges();
        }, 500);
    }, [validateExistingEdges, isMobile]);

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

    // Соединяем мобильные свойства с пользовательскими
    const sidebarPropsWithMobile = useMemo(() => ({
        ...sidebarProps,
        isMobile
    }), [sidebarProps, isMobile]);

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
        onNodeSelect: handleNodeSelectFn,
        isMobile,
        ...sidebarProps
    };

    // Экспортируем публичный метод для добавления нода извне
    useImperativeHandle(ref, () => {
        console.log("FlowCanvas: Setting up imperative handle");
        
        // Создаем объект с методом addNode
        const api = {
            addNode: (nodeType, nodeData) => {
                console.log("FlowCanvas imperative addNode called:", nodeType, nodeData);
                const result = addNodeDirectly(nodeType, nodeData);
                return result;
            }
        };
        
        console.log("FlowCanvas: Imperative handle created:", api);
        return api;
    }, [addNodeDirectly]);

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
                    snapGrid={[20, 20]}
                    defaultViewport={{ x: 0, y: 0, zoom: 1 }}
                    fitView
                    className="theme-flow"
                >
                    {!hideControls && <Controls />}
                    {!hideMiniMap && <FlowMiniMap isMobile={isMobile} />}
                    {!hideBackground && <FlowBackground />}

                    {/* Рендерим сайдбар только если он не скрыт */}
                    {!hideSidebar && <SidebarComponent {...mergedSidebarProps} />}
                </ReactFlow>
            </div>
        </div>
    );
});

/**
 * Компонент мини-карты с учетом мобильного отображения
 */
const FlowMiniMap = ({ isMobile }) => {
    if (isMobile) {
        return null; // Не показываем мини-карту на мобильных устройствах
    }
    
    return (
        <MiniMap
            nodeStrokeColor={(n) => {
                const color = getNodeHexColor(n.data?.type);
                return color || '#6366F1';
            }}
            nodeColor={(n) => {
                const color = getNodeHexColor(n.data?.type);
                return color || '#6366F1';
            }}
            nodeBorderRadius={2}
            style={{
                backgroundColor: 'rgba(240, 240, 240, 0.3)',
                border: '1px solid rgba(200, 200, 200, 0.8)',
            }}
        />
    );
};

const FlowBackground = () => {
    return (
        <Background
            variant="dots"
            gap={16}
            size={1.5}
            color="#aaa"
        />
    );
};

export default FlowCanvas;