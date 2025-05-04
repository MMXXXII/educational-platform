import { useMemo } from 'react';

/**
 * Хук для обработки данных по ребрам графа
 * 
 * @param {Array} edges - Массив ребер
 * @param {Array} dataFlows - Массив данных о потоках данных
 * @returns {Array} - Массив ребер с обновленными данными о потоках
 */
const useEdgeDataFlow = (edges, dataFlows) => {
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

    return edgesWithData;
};

export default useEdgeDataFlow;