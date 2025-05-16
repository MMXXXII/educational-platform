/**
 * Сервис для сериализации и десериализации графа нодов
 */
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
     * @param {Object} metadata - Дополнительные метаданные проекта (опционально)
     * @returns {Object} - Сериализованный граф
     */
    serializeGraph(nodes, edges, metadata = {}) {
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

            // Объединяем базовые метаданные с переданными пользователем
            const combinedMetadata = {
                version: metadata.version || '1.0.0',
                createdAt: metadata.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                versionHistory: metadata.versionHistory || [],
                ...metadata
            };

            return {
                nodes: serializedNodes,
                edges: serializedEdges,
                metadata: combinedMetadata
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
        if (!graph || !graph.nodes || !graph.edges) {
            console.error('Некорректный формат графа:', graph);
            throw new Error('Некорректный формат графа');
        }

        // Убедимся, что nodes и edges - массивы
        if (!Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) {
            console.warn('Формат данных не соответствует ожидаемому, пытаемся преобразовать');
            
            // Попытка преобразовать в массив, если данные пришли в другом формате
            let nodesArray = Array.isArray(graph.nodes) ? graph.nodes : [];
            let edgesArray = Array.isArray(graph.edges) ? graph.edges : [];
            
            // Если nodes - объект, попробуем преобразовать его в массив
            if (graph.nodes && typeof graph.nodes === 'object' && !Array.isArray(graph.nodes)) {
                if (graph.nodes.node && Array.isArray(graph.nodes.node)) {
                    nodesArray = graph.nodes.node;
                } else if (graph.nodes.item && Array.isArray(graph.nodes.item)) {
                    nodesArray = graph.nodes.item;
                } else {
                    // Попытаемся извлечь что-то похожее на узлы
                    const possibleArrays = Object.values(graph.nodes).filter(v => Array.isArray(v));
                    if (possibleArrays.length > 0) {
                        nodesArray = possibleArrays[0];
                    }
                }
            }
            
            // Если edges - объект, попробуем преобразовать его в массив
            if (graph.edges && typeof graph.edges === 'object' && !Array.isArray(graph.edges)) {
                if (graph.edges.edge && Array.isArray(graph.edges.edge)) {
                    edgesArray = graph.edges.edge;
                } else if (graph.edges.item && Array.isArray(graph.edges.item)) {
                    edgesArray = graph.edges.item;
                } else {
                    // Попытаемся извлечь что-то похожее на ребра
                    const possibleArrays = Object.values(graph.edges).filter(v => Array.isArray(v));
                    if (possibleArrays.length > 0) {
                        edgesArray = possibleArrays[0];
                    }
                }
            }
            
            // Заменяем исходные данные преобразованными массивами
            graph.nodes = nodesArray;
            graph.edges = edgesArray;
            
            // Если после преобразования массивы пустые, выдаем ошибку
            if (graph.nodes.length === 0 && graph.edges.length === 0) {
                throw new Error('Не удалось преобразовать данные в правильный формат');
            }
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
                        if (serializedNode.data && serializedNode.data.data) {
                            Object.assign(nodeData, serializedNode.data.data);
                        }
                        
                        // Если у нас есть фабричный метод для этого типа нода
                        nodeInstance = createNode(serializedNode.type, nodeData);
                        
                        // Дополнительно проверяем и восстанавливаем состояние нода
                        if (serializedNode.data && serializedNode.data.data) {
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

            // Десериализуем связи с проверкой валидности портов
            const nodeById = {};
            deserializedNodes.forEach(node => {
                nodeById[node.id] = node;
            });

            // Фильтруем ребра, проверяя наличие портов
            const deserializedEdges = graph.edges
                .filter(edge => {
                    // Проверяем наличие узлов
                    const sourceNode = nodeById[edge.source];
                    const targetNode = nodeById[edge.target];
                    
                    if (!sourceNode || !targetNode) {
                        console.warn(`Пропуск ребра: узел источника или цели не существует: ${edge.id}`);
                        return false;
                    }
                    
                    // Проверяем наличие портов
                    const hasSourceHandle = !edge.sourceHandle || 
                        sourceNode.data.outputs?.some(output => output.id === edge.sourceHandle);
                    
                    const hasTargetHandle = !edge.targetHandle || 
                        targetNode.data.inputs?.some(input => input.id === edge.targetHandle);
                    
                    if (!hasSourceHandle || !hasTargetHandle) {
                        console.warn(`Пропуск ребра: порты не найдены: ${edge.id}, источник: ${edge.sourceHandle}, цель: ${edge.targetHandle}`);
                        return false;
                    }
                    
                    return true;
                })
                .map(edge => {
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
                        return null;
                    }
                })
                .filter(Boolean); // Отфильтровываем null

            return {
                nodes: deserializedNodes,
                edges: deserializedEdges,
                metadata: graph.metadata || {}
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
     * @param {Object} metadata - Дополнительные метаданные (опционально)
     */
    saveToLocalStorage(name, graph, metadata = {}) {
        if (!isLocalStorageAvailable()) {
            console.error('localStorage недоступен');
            return false;
        }

        if (!name || name.trim() === '') {
            console.error('Имя проекта не может быть пустым');
            return false;
        }

        try {
            // Объединяем существующие метаданные с новыми
            const existingProject = this.loadFromLocalStorage(name);
            if (existingProject && existingProject.metadata) {
                graph.metadata = {
                    ...existingProject.metadata,
                    ...graph.metadata,
                    ...metadata,
                    updatedAt: new Date().toISOString()
                };
            }
            
            // Убеждаемся, что имя проекта не пустое
            const projectName = name.trim();
            if (projectName === '') {
                console.error('Имя проекта не может быть пустым (после обрезки пробелов)');
                return false;
            }
            
            // Сохраняем сам проект
            const projectKey = `nodeEditor_project_${projectName}`;
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
            if (!projectsList.includes(projectName)) {
                projectsList.push(projectName);
                localStorage.setItem('nodeEditor_projects', JSON.stringify(projectsList));
            }

            console.log(`Проект "${projectName}" успешно сохранен, размер: ${projectData.length} байт`);
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
            
            // Удаляем все версии проекта
            const versions = this.getProjectVersions(name);
            versions.forEach(version => {
                localStorage.removeItem(`nodeEditor_version_${name.trim()}_${version.name}`);
            });

            console.log(`Проект "${name}" успешно удален`);
            return true;
        } catch (error) {
            console.error(`Ошибка при удалении проекта "${name}":`, error);
            return false;
        }
    },

    /**
     * Создает новую версию проекта
     * @param {string} name - Имя проекта
     * @param {string} versionName - Название версии
     * @param {string} comment - Комментарий к версии
     * @returns {boolean} - Успешно ли создана версия
     */
    createProjectVersion(name, versionName, comment = '') {
        if (!isLocalStorageAvailable() || !name) {
            return false;
        }

        try {
            const trimmedName = name.trim();
            const projectKey = `nodeEditor_project_${trimmedName}`;
            const projectData = localStorage.getItem(projectKey);
            
            if (!projectData) {
                console.error(`Не найден проект "${name}" для создания версии`);
                return false;
            }
            
            const project = JSON.parse(projectData);
            
            // Проверяем, существует ли уже версия с таким именем
            const versionPrefix = `nodeEditor_version_${trimmedName}_`;
            const versionKey = `${versionPrefix}${versionName}`;
            
            if (localStorage.getItem(versionKey)) {
                console.warn(`Версия с именем "${versionName}" уже существует`);
                // Можно вернуть false или перезаписать существующую версию
                // В данном случае перезаписываем
            }
            
            // Создаем новую запись о версии
            const newVersion = {
                name: versionName,
                date: new Date().toISOString(),
                comment: comment,
                snapshot: project // Сохраняем полную копию проекта
            };
            
            // Сохраняем версию в localStorage
            localStorage.setItem(versionKey, JSON.stringify(newVersion));
            console.log(`Версия "${versionName}" для проекта "${name}" сохранена в localStorage`);
            
            // Также обновляем метаданные в самом проекте для обратной совместимости
            if (!project.metadata) {
                project.metadata = {};
            }
            
            if (!project.metadata.versionHistory) {
                project.metadata.versionHistory = [];
            }
            
            // Проверяем, нет ли уже такой версии в истории
            const existingVersionIndex = project.metadata.versionHistory.findIndex(v => v.name === versionName);
            if (existingVersionIndex >= 0) {
                // Заменяем существующую запись
                project.metadata.versionHistory[existingVersionIndex] = {
                    name: versionName,
                    date: newVersion.date,
                    comment: comment
                };
            } else {
                // Добавляем новую запись
                project.metadata.versionHistory.push({
                    name: versionName,
                    date: newVersion.date,
                    comment: comment
                });
            }
            
            project.metadata.updatedAt = new Date().toISOString();
            localStorage.setItem(projectKey, JSON.stringify(project));
            
            return true;
        } catch (error) {
            console.error(`Ошибка при создании версии проекта "${name}":`, error);
            return false;
        }
    },

    /**
     * Получает список версий проекта
     * @param {string} name - Имя проекта
     * @returns {Array} - Массив версий проекта
     */
    getProjectVersions(name) {
        if (!isLocalStorageAvailable() || !name) {
            return [];
        }

        try {
            const trimmedName = name.trim();
            const versionPrefix = `nodeEditor_version_${trimmedName}_`;
            const versions = [];
            
            // Ищем все ключи в localStorage, которые соответствуют шаблону версий проекта
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(versionPrefix)) {
                    try {
                        const versionData = JSON.parse(localStorage.getItem(key));
                        if (versionData && versionData.name && versionData.date) {
                            versions.push({
                                name: versionData.name,
                                date: versionData.date,
                                comment: versionData.comment || ''
                            });
                        }
                    } catch (parseError) {
                        console.warn(`Не удалось разобрать данные версии в ключе ${key}:`, parseError);
                    }
                }
            }
            
            // Сортируем версии по дате создания (от новых к старым)
            versions.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            return versions;
        } catch (error) {
            console.error(`Ошибка при получении версий проекта "${name}":`, error);
            return [];
        }
    },

    /**
     * Загружает конкретную версию проекта
     * @param {string} name - Имя проекта
     * @param {string} versionName - Название версии
     * @returns {Object|null} - Проект в указанной версии или null
     */
    loadProjectVersion(name, versionName) {
        if (!isLocalStorageAvailable() || !name || !versionName) {
            return null;
        }

        try {
            const versionKey = `nodeEditor_version_${name.trim()}_${versionName}`;
            const versionData = localStorage.getItem(versionKey);
            
            if (!versionData) {
                return null;
            }
            
            const version = JSON.parse(versionData);
            return version.snapshot;
        } catch (error) {
            console.error(`Ошибка при загрузке версии "${versionName}" проекта "${name}":`, error);
            return null;
        }
    },

    /**
     * Удаляет версию проекта
     * @param {string} name - Имя проекта
     * @param {string} versionName - Название версии
     * @returns {boolean} - Успешно ли удалена версия
     */
    deleteProjectVersion(name, versionName) {
        if (!isLocalStorageAvailable() || !name || !versionName) {
            return false;
        }

        try {
            const trimmedName = name.trim();
            const projectKey = `nodeEditor_project_${trimmedName}`;
            const versionKey = `nodeEditor_version_${trimmedName}_${versionName}`;
            
            // Удаляем саму версию
            localStorage.removeItem(versionKey);
            
            // Обновляем метаданные проекта, если он существует
            const projectData = localStorage.getItem(projectKey);
            if (projectData) {
                try {
                    const project = JSON.parse(projectData);
                    if (project.metadata && project.metadata.versionHistory) {
                        // Удаляем версию из истории версий
                        project.metadata.versionHistory = project.metadata.versionHistory.filter(
                            version => version.name !== versionName
                        );
                        project.metadata.updatedAt = new Date().toISOString();
                        localStorage.setItem(projectKey, JSON.stringify(project));
                    }
                } catch (parseError) {
                    console.warn(`Ошибка при обновлении метаданных проекта после удаления версии:`, parseError);
                }
            }
            
            console.log(`Версия "${versionName}" проекта "${name}" успешно удалена`);
            return true;
        } catch (error) {
            console.error(`Ошибка при удалении версии "${versionName}" проекта "${name}":`, error);
            return false;
        }
    },

    /**
     * Экспортирует проект в файл JSON
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
            const dataStr = encodeURIComponent(JSON.stringify(graph, null, 2));
            const mimeType = 'application/json';
            const extension = 'json';

            const exportFileDefaultName = `${filename}_${new Date().toISOString().slice(0, 10)}.${extension}`;
            const dataUri = `data:${mimeType};charset=utf-8,${dataStr}`;

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
                    
                    const content = event.target.result;
                    let graph;
                    
                    // Определяем формат файла по расширению
                    const fileExtension = file.name.split('.').pop().toLowerCase();
                    
                    if (fileExtension === 'json') {
                        graph = JSON.parse(content);
                    } else {
                        throw new Error('Поддерживается только формат JSON');
                    }
                    
                    // Обеспечиваем правильную структуру графа для десериализации
                    if (!graph.nodes || !graph.edges) {
                        // Попытка найти нужные данные в структуре файла
                        if (graph.nodeEditorProject) {
                            graph = graph.nodeEditorProject;
                        }
                    }

                    // Проверяем, что graph содержит необходимые поля nodes и edges
                    if (!graph.nodes || !graph.edges) {
                        throw new Error('В импортируемом файле не найдена структура графа (узлы и связи)');
                    }
                    
                    console.log(`Файл ${file.name} успешно импортирован, структура:`, graph);
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