import { useCallback, useEffect } from 'react';
import { addEdge } from 'reactflow';
import { v4 as uuidv4 } from 'uuid';

/**
 * Хук для управления операциями с узлами в ReactFlow
 * 
 * @param {Function} setEdges - Функция для обновления состояния рёбер
 * @param {Function} setNodes - Функция для обновления состояния узлов
 * @param {Function} onNodesChange - Функция для обработки изменений узлов
 * @param {Function} setIsModified - Функция для отметки состояния проекта как измененного
 * @param {Function} setSelectedNodeId - Функция для установки ID выбранного узла
 * @returns {Object} - Объект с обработчиками операций с узлами
 */
const useNodeOperations = (
    setEdges,
    setNodes,
    onNodesChange,
    setIsModified,
    setSelectedNodeId
) => {
    /**
     * Проверяет валидность соединения
     * @param {Object} params - Параметры соединения
     * @param {Array} nodes - Массив узлов
     * @returns {boolean} - Валидно ли соединение
     */
    const validateConnection = useCallback((params, nodes) => {
        // Проверяем наличие узлов
        const sourceNode = nodes.find(node => node.id === params.source);
        const targetNode = nodes.find(node => node.id === params.target);
        
        if (!sourceNode || !targetNode) {
            console.warn('Соединение отклонено: узел источника или цели не существует');
            return false;
        }
        
        // Запрещаем соединения нода с самим собой
        if (params.source === params.target) {
            console.warn('Соединение отклонено: нельзя соединить порт с самим собой');
            return false;
        }
        
        // Проверяем наличие портов
        const hasSourceHandle = !params.sourceHandle || 
            sourceNode.data.outputs?.some(output => output.id === params.sourceHandle);
        
        const hasTargetHandle = !params.targetHandle || 
            targetNode.data.inputs?.some(input => input.id === params.targetHandle);
        
        if (!hasSourceHandle || !hasTargetHandle) {
            console.warn(`Соединение отклонено: порты не найдены - источник: ${params.sourceHandle}, цель: ${params.targetHandle}`);
            return false;
        }
        
        return true;
    }, []);

    /**
     * Обработчик добавления новой связи
     */
    const onConnect = useCallback((params) => {
        setNodes(nodes => {
            // Проверяем валидность соединения
            if (!validateConnection(params, nodes)) {
                return nodes;
            }
            
            // Если соединение валидно, добавляем его
            setEdges((eds) => addEdge({
                ...params,
                id: `edge-${uuidv4()}`,
                type: 'animatedEdge',
                animated: params.sourceHandle?.includes('flow') || params.targetHandle?.includes('flow'),
                style: { stroke: '#555', strokeWidth: 2 }
            }, eds));
            
            setIsModified(true);
            return nodes;
        });
    }, [setEdges, setIsModified, validateConnection, setNodes]);

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

    /**
     * Валидация существующих соединений для устранения ошибок после загрузки проекта
     */
    const validateExistingEdges = useCallback(() => {
        setNodes(nodes => {
            if (nodes.length === 0) return nodes;
            
            setEdges(edges => {
                // Фильтруем только валидные соединения
                return edges.filter(edge => {
                    const sourceNode = nodes.find(node => node.id === edge.source);
                    const targetNode = nodes.find(node => node.id === edge.target);
                    
                    if (!sourceNode || !targetNode) return false;
                    
                    const hasSourceHandle = !edge.sourceHandle || 
                        sourceNode.data.outputs?.some(output => output.id === edge.sourceHandle);
                    
                    const hasTargetHandle = !edge.targetHandle || 
                        targetNode.data.inputs?.some(input => input.id === edge.targetHandle);
                    
                    return hasSourceHandle && hasTargetHandle;
                });
            });
            
            return nodes;
        });
    }, [setEdges, setNodes]);

    // Запускаем валидацию соединений при инициализации хука
    useEffect(() => {
        // Даем время для инициализации узлов
        const timer = setTimeout(() => {
            validateExistingEdges();
        }, 500);
        
        return () => clearTimeout(timer);
    }, [validateExistingEdges]);

    return {
        onConnect,
        onSelectionChange,
        handleNodesChange,
        validateExistingEdges
    };
};

export default useNodeOperations;