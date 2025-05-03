import { nodeTypes, createNode } from '../nodes/NodeFactory';

/**
 * Вспомогательная функция для проверки доступности localStorage
 * @returns {boolean} - Доступен ли localStorage
 */
const isLocalStorageAvailable = () => {
    return typeof window !== 'undefined' && window.localStorage;
};

/**
 * Сервис для сериализации и десериализации графа нодов
 */
const SerializationService = {
    /**
     * Сериализует граф нодов в формат JSON
     * @param {Array} nodes - Массив нодов ReactFlow
     * @param {Array} edges - Массив связей ReactFlow
     * @returns {Object} - Сериализованный граф
     */
    serializeGraph(nodes, edges) {
        // Сериализуем ноды вместе с их данными
        const serializedNodes = nodes.map(node => {
            // Если у нода есть ссылка на экземпляр нода, используем его метод сериализации
            if (node.data.nodeRef) {
                return {
                    id: node.id,
                    type: node.data.type,
                    position: node.position,
                    data: node.data.nodeRef.serialize()
                };
            } else {
                // Иначе просто сохраняем данные
                return {
                    id: node.id,
                    type: node.data.type,
                    position: node.position,
                    data: {
                        ...node.data,
                        // Очищаем ссылки на React-компоненты
                        content: undefined,
                        nodeRef: undefined
                    }
                };
            }
        });

        // Сериализуем связи
        const serializedEdges = edges.map(edge => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            sourceHandle: edge.sourceHandle,
            targetHandle: edge.targetHandle
        }));

        return {
            nodes: serializedNodes,
            edges: serializedEdges,
            metadata: {
                version: '1.0.0',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        };
    },

    /**
     * Десериализует граф из формата JSON
     * @param {Object} graph - Сериализованный граф
     * @returns {Object} - Объект с массивами нодов и связей для ReactFlow
     */
    deserializeGraph(graph) {
        // Проверяем версию формата
        if (!graph || !graph.metadata || !graph.metadata.version) {
            throw new Error('Неизвестный формат файла');
        }

        // Десериализуем ноды
        const deserializedNodes = graph.nodes.map(serializedNode => {
            // Создаем экземпляр нода нужного типа
            let nodeInstance;

            try {
                // Если у нас есть фабричный метод для этого типа нода
                nodeInstance = createNode(serializedNode.type, {
                    id: serializedNode.id,
                    ...serializedNode.data
                });
            } catch (error) {
                console.warn(`Не удалось создать нод типа ${serializedNode.type}:`, error);

                // Возвращаем базовую версию нода
                return {
                    id: serializedNode.id,
                    type: 'customNode',
                    position: serializedNode.position,
                    data: {
                        id: serializedNode.id,
                        type: serializedNode.type,
                        label: serializedNode.data.label || serializedNode.type,
                        inputs: serializedNode.data.inputs || [],
                        outputs: serializedNode.data.outputs || []
                    }
                };
            }

            // Преобразуем экземпляр нода в формат ReactFlow
            return {
                id: serializedNode.id,
                type: 'customNode',
                position: serializedNode.position,
                data: {
                    nodeRef: nodeInstance,
                    id: nodeInstance.id,
                    type: nodeInstance.type,
                    label: nodeInstance.label,
                    inputs: nodeInstance.inputs,
                    outputs: nodeInstance.outputs,
                    content: nodeInstance.content
                }
            };
        });

        // Десериализуем связи
        const deserializedEdges = graph.edges.map(edge => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            sourceHandle: edge.sourceHandle,
            targetHandle: edge.targetHandle,
            // Добавляем анимацию для связей с потоками
            animated: edge.sourceHandle?.includes('flow') || edge.targetHandle?.includes('flow'),
            style: { stroke: '#555', strokeWidth: 2 }
        }));

        return {
            nodes: deserializedNodes,
            edges: deserializedEdges
        };
    },

    /**
     * Сохраняет граф в локальное хранилище
     * @param {string} name - Имя проекта
     * @param {Object} graph - Сериализованный граф
     */
    saveToLocalStorage(name, graph) {
        if (!isLocalStorageAvailable()) {
            console.warn('localStorage недоступен');
            return false;
        }

        try {
            // Сохраняем список проектов
            const projectsList = JSON.parse(localStorage.getItem('nodeEditor_projects') || '[]');
            if (!projectsList.includes(name)) {
                projectsList.push(name);
                localStorage.setItem('nodeEditor_projects', JSON.stringify(projectsList));
            }

            // Сохраняем сам проект
            localStorage.setItem(`nodeEditor_project_${name}`, JSON.stringify(graph));

            return true;
        } catch (error) {
            console.error('Ошибка при сохранении проекта:', error);
            return false;
        }
    },

    /**
     * Загружает граф из локального хранилища
     * @param {string} name - Имя проекта
     * @returns {Object|null} - Сериализованный граф или null, если проект не найден
     */
    loadFromLocalStorage(name) {
        if (!isLocalStorageAvailable()) {
            console.warn('localStorage недоступен');
            return null;
        }

        try {
            const projectData = localStorage.getItem(`nodeEditor_project_${name}`);
            if (!projectData) {
                return null;
            }

            return JSON.parse(projectData);
        } catch (error) {
            console.error('Ошибка при загрузке проекта:', error);
            return null;
        }
    },

    /**
     * Получает список сохраненных проектов
     * @returns {Array} - Массив имен проектов
     */
    getProjectsList() {
        if (!isLocalStorageAvailable()) {
            return [];
        }

        try {
            return JSON.parse(localStorage.getItem('nodeEditor_projects') || '[]');
        } catch (error) {
            console.error('Ошибка при получении списка проектов:', error);
            return [];
        }
    },

    /**
     * Удаляет проект из локального хранилища
     * @param {string} name - Имя проекта
     * @returns {boolean} - Успешно ли удален проект
     */
    deleteProject(name) {
        if (!isLocalStorageAvailable()) {
            console.warn('localStorage недоступен');
            return false;
        }

        try {
            // Удаляем проект из списка
            const projectsList = JSON.parse(localStorage.getItem('nodeEditor_projects') || '[]');
            const updatedList = projectsList.filter(project => project !== name);
            localStorage.setItem('nodeEditor_projects', JSON.stringify(updatedList));

            // Удаляем данные проекта
            localStorage.removeItem(`nodeEditor_project_${name}`);

            return true;
        } catch (error) {
            console.error('Ошибка при удалении проекта:', error);
            return false;
        }
    },

    /**
     * Экспортирует проект в файл
     * @param {string} name - Имя проекта
     * @param {Object} graph - Сериализованный граф
     */
    exportToFile(name, graph) {
        if (typeof document === 'undefined') {
            console.warn('document недоступен');
            return false;
        }

        try {
            const dataStr = JSON.stringify(graph, null, 2);
            const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;

            const exportFileDefaultName = `${name || 'project'}_${new Date().toISOString().slice(0, 10)}.json`;

            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();

            return true;
        } catch (error) {
            console.error('Ошибка при экспорте проекта:', error);
            return false;
        }
    },

    /**
     * Загружает проект из файла
     * @param {File} file - Файл проекта
     * @returns {Promise<Object>} - Промис с десериализованным графом
     */
    importFromFile(file) {
        return new Promise((resolve, reject) => {
            if (typeof FileReader === 'undefined') {
                reject(new Error('FileReader недоступен'));
                return;
            }

            const reader = new FileReader();

            reader.onload = (event) => {
                try {
                    const graph = JSON.parse(event.target.result);
                    resolve(graph);
                } catch (error) {
                    reject(new Error('Не удалось прочитать файл проекта'));
                }
            };

            reader.onerror = () => {
                reject(new Error('Ошибка чтения файла'));
            };

            reader.readAsText(file);
        });
    }
};

export default SerializationService;