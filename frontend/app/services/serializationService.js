import { nodeTypes, createNode } from '../nodes/NodeFactory';

/**
 * Вспомогательная функция для проверки доступности localStorage
 * @returns {boolean} - Доступен ли localStorage
 */
const isLocalStorageAvailable = () => {
    if (typeof window === 'undefined' || !window.localStorage) {
        return false;
    }
    
    try {
        // Пробуем записать и прочитать тестовое значение
        const testKey = '_test_localStorage_';
        localStorage.setItem(testKey, '1');
        localStorage.removeItem(testKey);
        return true;
    } catch (error) {
        console.error('localStorage недоступен:', error);
        return false;
    }
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
        if (!nodes || !Array.isArray(nodes) || !edges || !Array.isArray(edges)) {
            console.error('Ошибка: некорректные данные для сериализации', { nodes, edges });
            throw new Error('Некорректные данные для сериализации');
        }

        try {
            // Сериализуем ноды вместе с их данными
            const serializedNodes = nodes.map(node => {
                try {
                    // Если у нода есть ссылка на экземпляр нода, используем его метод сериализации
                    if (node.data && node.data.nodeRef) {
                        const nodeObject = {
                            id: node.id,
                            type: node.data.type,
                            position: node.position || { x: 0, y: 0 },
                            data: node.data.nodeRef.serialize()
                        };
                        
                        // Сохраняем все редактируемые поля нода
                        if (node.data.nodeRef.data) {
                            nodeObject.data.data = JSON.parse(JSON.stringify(node.data.nodeRef.data));
                        }
                        
                        return nodeObject;
                    } else {
                        // Иначе просто сохраняем данные
                        return {
                            id: node.id,
                            type: node.data?.type || 'unknown',
                            position: node.position || { x: 0, y: 0 },
                            data: {
                                ...(node.data || {}),
                                // Очищаем ссылки на React-компоненты
                                content: undefined,
                                nodeRef: undefined
                            }
                        };
                    }
                } catch (error) {
                    console.error(`Ошибка при сериализации нода ${node.id}:`, error);
                    // Возвращаем базовую версию нода для обеспечения целостности
                    return {
                        id: node.id,
                        type: node.data?.type || 'unknown',
                        position: node.position || { x: 0, y: 0 },
                        data: {
                            id: node.id,
                            type: node.data?.type || 'unknown',
                            label: node.data?.label || 'Неизвестный нод'
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
                targetHandle: edge.targetHandle,
                // Сохраняем дополнительные свойства связей, если они есть
                animated: edge.animated,
                style: edge.style
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
        } catch (error) {
            console.error('Ошибка при сериализации графа:', error);
            throw new Error(`Ошибка при сериализации графа: ${error.message}`);
        }
    },

    /**
     * Десериализует граф из формата JSON
     * @param {Object} graph - Сериализованный граф
     * @returns {Object} - Объект с массивами нодов и связей для ReactFlow
     */
    deserializeGraph(graph) {
        // Проверяем валидность графа
        if (!graph || !graph.nodes || !graph.edges || !graph.metadata) {
            console.error('Некорректный формат графа:', graph);
            throw new Error('Некорректный формат графа');
        }

        // Проверяем версию формата
        if (!graph.metadata.version) {
            console.warn('Неизвестная версия формата файла, попытка импортировать как 1.0.0');
        }

        try {
            // Десериализуем ноды
            const deserializedNodes = graph.nodes.map(serializedNode => {
                try {
                    // Создаем экземпляр нода нужного типа
                    let nodeInstance;

                    try {
                        // Убедимся, что сохраненные данные полностью восстановлены
                        const nodeData = {
                            id: serializedNode.id,
                            ...serializedNode.data
                        };
                        
                        // Важно: явно восстанавливаем состояние, сохраненное в data
                        if (serializedNode.data.data) {
                            Object.assign(nodeData, serializedNode.data.data);
                        }
                        
                        // Если у нас есть фабричный метод для этого типа нода
                        nodeInstance = createNode(serializedNode.type, nodeData);
                        
                        // Дополнительно проверяем и восстанавливаем состояние нода
                        if (serializedNode.data.data) {
                            // Явно применяем каждое свойство к экземпляру нода
                            Object.entries(serializedNode.data.data).forEach(([key, value]) => {
                                if (value !== undefined) {
                                    nodeInstance.setProperty(key, value);
                                }
                            });
                        }
                    } catch (error) {
                        console.warn(`Не удалось создать нод типа ${serializedNode.type}:`, error);

                        // Возвращаем базовую версию нода
                        return {
                            id: serializedNode.id,
                            type: 'customNode',
                            position: serializedNode.position || { x: 0, y: 0 },
                            data: {
                                id: serializedNode.id,
                                type: serializedNode.type || 'unknown',
                                label: serializedNode.data?.label || serializedNode.type || 'Неизвестный нод',
                                inputs: serializedNode.data?.inputs || [],
                                outputs: serializedNode.data?.outputs || []
                            }
                        };
                    }

                    // Преобразуем экземпляр нода в формат ReactFlow
                    return {
                        id: serializedNode.id,
                        type: 'customNode',
                        position: serializedNode.position || { x: 0, y: 0 },
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
                } catch (error) {
                    console.error(`Ошибка при десериализации нода ${serializedNode.id}:`, error);
                    
                    // Возвращаем минимальную версию нода для обеспечения целостности
                    return {
                        id: serializedNode.id,
                        type: 'customNode',
                        position: serializedNode.position || { x: 0, y: 0 },
                        data: {
                            id: serializedNode.id,
                            type: serializedNode.type || 'unknown',
                            label: 'Ошибка: ' + (serializedNode.data?.label || serializedNode.type || 'Неизвестный нод'),
                            inputs: [],
                            outputs: []
                        }
                    };
                }
            });

            // Десериализуем связи
            const deserializedEdges = graph.edges.map(edge => {
                try {
                    return {
                        id: edge.id,
                        source: edge.source,
                        target: edge.target,
                        sourceHandle: edge.sourceHandle,
                        targetHandle: edge.targetHandle,
                        // Добавляем анимацию для связей с потоками
                        animated: edge.animated || edge.sourceHandle?.includes('flow') || edge.targetHandle?.includes('flow'),
                        style: edge.style || { stroke: '#555', strokeWidth: 2 },
                        type: 'animatedEdge'
                    };
                } catch (error) {
                    console.error(`Ошибка при десериализации связи ${edge.id}:`, error);
                    
                    // Возвращаем минимальную версию связи
                    return {
                        id: edge.id,
                        source: edge.source,
                        target: edge.target,
                        sourceHandle: edge.sourceHandle,
                        targetHandle: edge.targetHandle,
                        style: { stroke: '#555', strokeWidth: 2 },
                        type: 'animatedEdge'
                    };
                }
            });

            return {
                nodes: deserializedNodes,
                edges: deserializedEdges
            };
        } catch (error) {
            console.error('Ошибка при десериализации графа:', error);
            throw new Error(`Ошибка при десериализации графа: ${error.message}`);
        }
    },

    /**
     * Сохраняет граф в локальное хранилище
     * @param {string} name - Имя проекта
     * @param {Object} graph - Сериализованный граф
     */
    saveToLocalStorage(name, graph) {
        if (!isLocalStorageAvailable()) {
            console.error('localStorage недоступен');
            return false;
        }

        if (!name || name.trim() === '') {
            console.error('Имя проекта не может быть пустым');
            return false;
        }

        try {
            // Сохраняем сам проект
            const projectKey = `nodeEditor_project_${name.trim()}`;
            const projectData = JSON.stringify(graph);
            localStorage.setItem(projectKey, projectData);
            
            // Проверяем, успешно ли сохранены данные
            const savedData = localStorage.getItem(projectKey);
            if (!savedData) {
                console.error('Ошибка при сохранении проекта: данные не записаны');
                return false;
            }

            // Сохраняем список проектов
            const projectsList = this.getProjectsList();
            if (!projectsList.includes(name.trim())) {
                projectsList.push(name.trim());
                localStorage.setItem('nodeEditor_projects', JSON.stringify(projectsList));
            }

            console.log(`Проект "${name}" успешно сохранен, размер: ${projectData.length} байт`);
            return true;
        } catch (error) {
            console.error('Ошибка при сохранении проекта в localStorage:', error);
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
            console.error('localStorage недоступен');
            return null;
        }

        if (!name || name.trim() === '') {
            console.error('Имя проекта не может быть пустым');
            return null;
        }

        try {
            const projectKey = `nodeEditor_project_${name.trim()}`;
            const projectData = localStorage.getItem(projectKey);
            
            if (!projectData) {
                console.warn(`Проект "${name}" не найден в localStorage`);
                return null;
            }

            return JSON.parse(projectData);
        } catch (error) {
            console.error(`Ошибка при загрузке проекта "${name}" из localStorage:`, error);
            return null;
        }
    },

    /**
     * Получает список сохраненных проектов
     * @returns {Array} - Массив имен проектов
     */
    getProjectsList() {
        if (!isLocalStorageAvailable()) {
            console.warn('localStorage недоступен, возвращаем пустой список проектов');
            return [];
        }

        try {
            const projectsData = localStorage.getItem('nodeEditor_projects');
            if (!projectsData) {
                return [];
            }
            return JSON.parse(projectsData);
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
            console.error('localStorage недоступен');
            return false;
        }

        if (!name || name.trim() === '') {
            console.error('Имя проекта не может быть пустым');
            return false;
        }

        try {
            // Удаляем проект из списка
            const projectsList = this.getProjectsList();
            const updatedList = projectsList.filter(project => project !== name.trim());
            localStorage.setItem('nodeEditor_projects', JSON.stringify(updatedList));

            // Удаляем данные проекта
            localStorage.removeItem(`nodeEditor_project_${name.trim()}`);

            console.log(`Проект "${name}" успешно удален`);
            return true;
        } catch (error) {
            console.error(`Ошибка при удалении проекта "${name}":`, error);
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
            console.error('document недоступен, экспорт невозможен');
            return false;
        }

        try {
            const filename = name?.trim() || 'project';
            const dataStr = JSON.stringify(graph, null, 2);
            const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;

            const exportFileDefaultName = `${filename}_${new Date().toISOString().slice(0, 10)}.json`;

            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.style.display = 'none';
            document.body.appendChild(linkElement);
            linkElement.click();
            document.body.removeChild(linkElement);

            console.log(`Проект "${name}" успешно экспортирован в файл ${exportFileDefaultName}`);
            return true;
        } catch (error) {
            console.error('Ошибка при экспорте проекта в файл:', error);
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

            if (!file) {
                reject(new Error('Файл не предоставлен'));
                return;
            }

            const reader = new FileReader();

            reader.onload = (event) => {
                try {
                    if (!event.target?.result) {
                        throw new Error('Не удалось прочитать содержимое файла');
                    }
                    
                    const graph = JSON.parse(event.target.result);
                    console.log(`Файл ${file.name} успешно импортирован`);
                    resolve(graph);
                } catch (error) {
                    console.error(`Ошибка при парсинге файла проекта ${file.name}:`, error);
                    reject(new Error(`Не удалось прочитать файл проекта: ${error.message}`));
                }
            };

            reader.onerror = () => {
                console.error(`Ошибка чтения файла ${file.name}`);
                reject(new Error('Ошибка чтения файла'));
            };

            reader.readAsText(file);
        });
    }
};

export default SerializationService;