import { useMemo, useEffect } from 'react';

/**
 * Хук для обработки данных по ребрам графа
 * 
 * @param {Array} edges - Массив ребер
 * @param {Array} dataFlows - Массив данных о потоках данных
 * @param {Array} nodes - Массив узлов графа
 * @returns {Array} - Массив ребер с обновленными данными о потоках
 */
const useEdgeDataFlow = (edges, dataFlows, nodes) => {
    // Валидируем ребра при изменении узлов или ребер
    const validatedEdges = useMemo(() => {
        if (!edges || !nodes || nodes.length === 0) return edges;
        
        // Проверяем каждое ребро на валидность портов
        return edges.filter(edge => {
            const sourceNode = nodes.find(node => node.id === edge.source);
            const targetNode = nodes.find(node => node.id === edge.target);
            
            if (!sourceNode || !targetNode) {
                console.warn(`Невалидное ребро ${edge.id}: узел источника или цели не существует`);
                return false;
            }
            
            const hasSourceHandle = !edge.sourceHandle || 
                sourceNode.data.outputs?.some(output => output.id === edge.sourceHandle);
            
            const hasTargetHandle = !edge.targetHandle || 
                targetNode.data.inputs?.some(input => input.id === edge.targetHandle);
            
            if (!hasSourceHandle || !hasTargetHandle) {
                console.warn(`Невалидное ребро ${edge.id}: порты не найдены`);
                return false;
            }
            
            return true;
        });
    }, [edges, nodes]);

    // Обновляем ребра с информацией о передаче данных
    const edgesWithData = useMemo(() => {
        if (!dataFlows || dataFlows.length === 0) return validatedEdges;

        return validatedEdges.map(edge => {
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
    }, [validatedEdges, dataFlows]);

    return edgesWithData;
};

export default useEdgeDataFlow;