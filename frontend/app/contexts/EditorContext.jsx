import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useNodesState, useEdgesState } from 'reactflow';
import SerializationService from '../services/serializationService';

// Создаем контекст
const EditorContext = createContext();

/**
 * Провайдер контекста редактора
 * @param {Object} props - Свойства компонента
 * @param {React.ReactNode} props.children - Дочерние компоненты
 */
export const EditorProvider = ({ children }) => {
    // Состояние нодов и связей
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    // Состояние проекта
    const [projectName, setProjectName] = useState('');
    const [projectsList, setProjectsList] = useState([]);
    const [projectVersions, setProjectVersions] = useState([]);
    const [isModified, setIsModified] = useState(false);
    const [selectedNodeId, setSelectedNodeId] = useState(null);
    const [isBrowser, setIsBrowser] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [loadError, setLoadError] = useState(null);
    const [needsFitView, setNeedsFitView] = useState(false);

    // Вычисляемое свойство
    const hasActiveProject = Boolean(projectName && projectName.trim() !== '');

    // Реф для хранения функций, чтобы избежать циклических зависимостей
    const functionRef = useRef({});

    /**
     * Обновляет список проектов
     */
    const refreshProjectsList = useCallback(() => {
        if (isBrowser) {
            try {
                const list = SerializationService.getProjectsList();
                setProjectsList(list);
                console.log('Обновлен список проектов:', list);
            } catch (error) {
                console.error('Ошибка при обновлении списка проектов:', error);
            }
        }
    }, [isBrowser]);

    // Сохраняем функцию в реф
    functionRef.current.refreshProjectsList = refreshProjectsList;

    /**
     * Обновляет список версий текущего проекта
     */
    const refreshVersionsList = useCallback(() => {
        if (isBrowser && projectName) {
            try {
                console.log(`Получение версий для проекта "${projectName}"...`);
                const versions = SerializationService.getProjectVersions(projectName);
                console.log(`Найдено ${versions.length} версий:`, versions);
                setProjectVersions(versions);
            } catch (error) {
                console.error('Ошибка при обновлении списка версий:', error);
            }
        }
    }, [isBrowser, projectName]);

    // Сохраняем функцию в реф
    functionRef.current.refreshVersionsList = refreshVersionsList;

    /**
     * Создает новую версию проекта
     * @param {string} versionName - Название версии
     * @param {string} comment - Комментарий к версии
     * @returns {boolean} - Успешно ли создана версия
     */
    const createProjectVersion = useCallback((versionName, comment = '') => {
        setSaveError(null);

        if (!isBrowser) {
            const error = 'Невозможно создать версию: localStorage недоступен';
            console.warn(error);
            setSaveError(error);
            return false;
        }

        if (!projectName) {
            const error = 'Необходимо сначала сохранить проект';
            console.warn(error);
            setSaveError(error);
            return false;
        }

        if (!versionName) {
            const error = 'Необходимо указать название версии';
            console.warn(error);
            setSaveError(error);
            return false;
        }

        try {
            // Сериализуем текущее состояние графа
            const serializedGraph = SerializationService.serializeGraph(nodes, edges);

            // Сохраняем проект
            const saveResult = SerializationService.saveToLocalStorage(projectName, serializedGraph);

            if (!saveResult) {
                const error = 'Не удалось сохранить проект перед созданием версии';
                console.error(error);
                setSaveError(error);
                return false;
            }

            // Создаем новую версию
            const result = SerializationService.createProjectVersion(projectName, versionName, comment);

            if (result) {
                console.log(`Версия "${versionName}" проекта "${projectName}" успешно создана`);
                // Обновляем список версий
                refreshVersionsList();
                return true;
            } else {
                const error = `Не удалось создать версию "${versionName}" проекта "${projectName}"`;
                console.error(error);
                setSaveError(error);
                return false;
            }
        } catch (error) {
            console.error('Ошибка при создании версии проекта:', error);
            setSaveError(`Ошибка при создании версии: ${error.message}`);
            return false;
        }
    }, [projectName, nodes, edges, isBrowser, refreshVersionsList]);

    // Сохраняем функцию в реф
    functionRef.current.createProjectVersion = createProjectVersion;

    /**
     * Загружает определенную версию проекта
     * @param {string} versionName - Название версии
     * @returns {boolean} - Успешно ли загружена версия
     */
    const loadProjectVersion = useCallback((versionName) => {
        setLoadError(null);

        if (!isBrowser) {
            const error = 'Невозможно загрузить версию: localStorage недоступен';
            console.warn(error);
            setLoadError(error);
            return false;
        }

        if (!projectName) {
            const error = 'Необходимо сначала загрузить проект';
            console.warn(error);
            setLoadError(error);
            return false;
        }

        if (!versionName) {
            const error = 'Необходимо указать название версии';
            console.warn(error);
            setLoadError(error);
            return false;
        }

        try {
            // Загружаем версию
            const versionData = SerializationService.loadProjectVersion(projectName, versionName);

            if (!versionData) {
                const error = `Версия "${versionName}" проекта "${projectName}" не найдена`;
                console.error(error);
                setLoadError(error);
                return false;
            }

            // Помечаем эту версию как последнюю загруженную в метаданных проекта
            try {
                const projectKey = `nodeEditor_project_${projectName.trim()}`;
                const projectData = localStorage.getItem(projectKey);
                if (projectData) {
                    const project = JSON.parse(projectData);
                    if (!project.metadata) {
                        project.metadata = {};
                    }
                    project.metadata.lastLoadedVersion = versionName;
                    project.metadata.updatedAt = new Date().toISOString();
                    localStorage.setItem(projectKey, JSON.stringify(project));
                }
            } catch (err) {
                console.warn('Не удалось обновить метаданные о текущей версии:', err);
                // Продолжаем выполнение даже при ошибке
            }

            // Десериализуем граф
            const { nodes: deserializedNodes, edges: deserializedEdges } =
                SerializationService.deserializeGraph(versionData);

            // Очищаем текущее состояние перед загрузкой нового
            setNodes([]);
            setEdges([]);

            // Устанавливаем таймаут для обеспечения корректной очистки состояния
            setTimeout(() => {
                // Обновляем состояние графа
                setNodes(deserializedNodes);
                setEdges(deserializedEdges);
                setIsModified(false);
                setSelectedNodeId(null);

                // Устанавливаем флаг для автоматического масштабирования
                setNeedsFitView(true);

                console.log(`Версия "${versionName}" проекта "${projectName}" успешно загружена`);
            }, 100);

            return true;
        } catch (error) {
            console.error(`Ошибка при загрузке версии "${versionName}" проекта "${projectName}":`, error);
            setLoadError(`Ошибка при загрузке версии: ${error.message}`);
            return false;
        }
    }, [projectName, isBrowser, setNodes, setEdges, setIsModified, setSelectedNodeId, setNeedsFitView, setLoadError]);

    // Сохраняем функцию в реф
    functionRef.current.loadProjectVersion = loadProjectVersion;

    /**
     * Удаляет версию проекта
     * @param {string} versionName - Название версии
     * @returns {boolean} - Успешно ли удалена версия
     */
    const deleteProjectVersion = useCallback((versionName) => {
        if (!isBrowser) {
            console.warn('Невозможно удалить версию: localStorage недоступен');
            return false;
        }

        if (!projectName) {
            console.warn('Необходимо сначала загрузить проект');
            return false;
        }

        if (!versionName) {
            console.warn('Необходимо указать название версии');
            return false;
        }

        try {
            const success = SerializationService.deleteProjectVersion(projectName, versionName);

            if (success) {
                console.log(`Версия "${versionName}" проекта "${projectName}" успешно удалена`);
                // Обновляем список версий
                refreshVersionsList();
                return true;
            } else {
                console.error(`Не удалось удалить версию "${versionName}" проекта "${projectName}"`);
                return false;
            }
        } catch (error) {
            console.error(`Ошибка при удалении версии "${versionName}" проекта "${projectName}":`, error);
            return false;
        }
    }, [projectName, isBrowser, refreshVersionsList]);

    // Сохраняем функцию в реф
    functionRef.current.deleteProjectVersion = deleteProjectVersion;

    /**
     * Сохраняет текущий проект
     * @param {string} name - Имя проекта (если не указано, используется текущее)
     * @returns {boolean} - Успешно ли сохранен проект
     */
    /**
 * Сохраняет текущий проект
 * @param {string} name - Имя проекта (если не указано, используется текущее)
 * @returns {boolean} - Успешно ли сохранен проект
 */
    const saveProject = useCallback((name = null) => {
        setSaveError(null);

        // Правильная проверка доступности localStorage
        let storageAvailable = false;
        try {
            // Пробуем обратиться к localStorage
            const testKey = '__test__';
            localStorage.setItem(testKey, testKey);
            localStorage.removeItem(testKey);
            storageAvailable = true;
        } catch (e) {
            storageAvailable = false;
        }

        if (!storageAvailable) {
            const error = 'Невозможно сохранить проект: localStorage недоступен. Убедитесь, что вы работаете в браузере и не используете режим инкогнито.';
            console.warn(error);
            setSaveError(error);
            return false;
        }

        const projectToSave = name || projectName;

        if (!projectToSave || projectToSave.trim() === '') {
            const error = 'Имя проекта не может быть пустым';
            console.warn(error);
            setSaveError(error);
            return false;
        }

        try {
            // Сериализуем текущее состояние графа
            const serializedGraph = SerializationService.serializeGraph(nodes, edges);
            console.log('Сериализованный граф:', serializedGraph);

            // Сохраняем в localStorage
            const result = SerializationService.saveToLocalStorage(projectToSave, serializedGraph);

            if (result) {
                console.log(`Проект "${projectToSave}" успешно сохранен`);
                setProjectName(projectToSave);
                setIsModified(false);

                // Обновляем список проектов
                refreshProjectsList();
                return true;
            } else {
                const error = `Не удалось сохранить проект "${projectToSave}"`;
                console.error(error);
                setSaveError(error);
                return false;
            }
        } catch (error) {
            console.error('Ошибка при сохранении проекта:', error);
            setSaveError(`Ошибка при сохранении: ${error.message}`);
            return false;
        }
    }, [nodes, edges, projectName, refreshProjectsList]);

    // Сохраняем функцию в реф
    functionRef.current.saveProject = saveProject;

    /**
     * Создает новый проект
     * @param {string} name - Имя проекта
     * @param {boolean} keepCurrentNodes - Сохранять ли текущие ноды вместо создания пустого проекта
     * @returns {boolean} - Успешно ли создан проект
     */
    const createNewProject = useCallback((name, keepCurrentNodes = false) => {
        setSaveError(null);

        // Проверка на пустое имя проекта
        if (!name || name.trim() === '') {
            const error = 'Имя проекта не может быть пустым';
            console.warn(error);
            setSaveError(error);
            return false;
        }

        // Сохраняем текущий проект, если он был изменен
        if (isModified && projectName && projectName !== name) {
            const shouldSave = window.confirm(
                `Проект "${projectName}" был изменен. Сохранить изменения перед созданием нового проекта?`
            );

            if (shouldSave) {
                // Используем функцию из рефа для избежания циклической зависимости
                functionRef.current.saveProject(projectName);
            }
        }

        try {
            // Создаем проект в памяти
            setProjectName(name);

            // Если keepCurrentNodes=true, сохраняем текущие ноды и рёбра, иначе очищаем
            if (!keepCurrentNodes) {
                setNodes([]);
                setEdges([]);
            }

            setIsModified(false);
            setSelectedNodeId(null);
            setSaveError(null);
            setLoadError(null);

            // Сериализуем текущее состояние графа (пустое или существующее)
            const serializedGraph = SerializationService.serializeGraph(
                keepCurrentNodes ? nodes : [],
                keepCurrentNodes ? edges : []
            );

            // Сохраняем проект в localStorage
            SerializationService.saveToLocalStorage(name, serializedGraph);

            // Обновляем список проектов после создания нового
            refreshProjectsList();

            console.log(`Создан новый проект: ${name}${keepCurrentNodes ? ' с существующими нодами' : ''}`);
            return true;
        } catch (error) {
            const errorMsg = `Ошибка при создании проекта: ${error.message}`;
            console.error(errorMsg);
            setSaveError(errorMsg);
            return false;
        }
    }, [nodes, edges, setNodes, setEdges, isModified, projectName, refreshProjectsList]);

    // Сохраняем функцию в реф
    functionRef.current.createNewProject = createNewProject;

    /**
     * Загружает проект
     * @param {string} name - Имя проекта
     * @returns {boolean} - Успешно ли загружен проект
     */
    const loadProject = useCallback((name) => {
        setLoadError(null);

        if (!isBrowser) {
            const error = 'Невозможно загрузить проект: localStorage недоступен';
            console.warn(error);
            setLoadError(error);
            return false;
        }

        if (!name || name.trim() === '') {
            const error = 'Имя проекта не может быть пустым';
            console.warn(error);
            setLoadError(error);
            return false;
        }

        // Сохраняем текущий проект, если он был изменен
        if (isModified && projectName && projectName !== name) {
            const shouldSave = window.confirm(
                `Проект "${projectName}" был изменен. Сохранить изменения перед загрузкой другого проекта?`
            );

            if (shouldSave) {
                functionRef.current.saveProject(projectName);
            }
        }

        try {
            // Загружаем сериализованный граф из localStorage
            const serializedGraph = SerializationService.loadFromLocalStorage(name);

            if (!serializedGraph) {
                const error = `Проект "${name}" не найден`;
                console.error(error);
                setLoadError(error);
                return false;
            }

            console.log(`Загружаем проект "${name}"`, serializedGraph);

            try {
                // Десериализуем граф
                const { nodes: deserializedNodes, edges: deserializedEdges } =
                    SerializationService.deserializeGraph(serializedGraph);

                // Очищаем текущее состояние перед загрузкой нового
                setNodes([]);
                setEdges([]);

                // Устанавливаем таймаут для обеспечения корректной очистки состояния
                setTimeout(() => {
                    // Обновляем состояние графа
                    setNodes(deserializedNodes);
                    setEdges(deserializedEdges);
                    setProjectName(name);
                    setIsModified(false);
                    setSelectedNodeId(null);

                    // Загружаем список версий
                    refreshVersionsList();

                    // Устанавливаем флаг для автоматического масштабирования
                    setNeedsFitView(true);

                    console.log(`Проект "${name}" успешно загружен`, {
                        nodes: deserializedNodes,
                        edges: deserializedEdges
                    });
                }, 100);

                return true;
            } catch (error) {
                console.error('Ошибка при десериализации проекта:', error);
                setLoadError(`Ошибка при загрузке: ${error.message}`);
                return false;
            }
        } catch (error) {
            console.error('Ошибка при загрузке проекта:', error);
            setLoadError(`Ошибка при загрузке: ${error.message}`);
            return false;
        }
    }, [setNodes, setEdges, isBrowser, isModified, projectName, setNeedsFitView, setProjectName, setIsModified, setSelectedNodeId, setLoadError, refreshVersionsList]);

    // Сохраняем функцию в реф
    functionRef.current.loadProject = loadProject;

    /**
     * Удаляет проект
     * @param {string} name - Имя проекта
     * @returns {boolean} - Успешно ли удален проект
     */
    const deleteProject = useCallback((name) => {
        if (!isBrowser) {
            console.warn('Невозможно удалить проект на сервере');
            return false;
        }

        if (!name || name.trim() === '') {
            console.warn('Имя проекта не может быть пустым');
            return false;
        }

        try {
            const result = SerializationService.deleteProject(name);

            if (result) {
                console.log(`Проект "${name}" успешно удален`);

                // Обновляем список проектов
                refreshProjectsList();

                // Если удален текущий проект, создаем новый
                if (name === projectName) {
                    // Вместо создания нового проекта с пустым именем, просто сбрасываем состояние редактора
                    setProjectName("Новый проект");
                    setNodes([]);
                    setEdges([]);
                    setIsModified(false);
                    setSelectedNodeId(null);
                    setSaveError(null);
                    setLoadError(null);
                }

                return true;
            } else {
                console.error(`Не удалось удалить проект "${name}"`);
                return false;
            }
        } catch (error) {
            console.error('Ошибка при удалении проекта:', error);
            return false;
        }
    }, [projectName, isBrowser, refreshProjectsList]);

    // Сохраняем функцию в реф
    functionRef.current.deleteProject = deleteProject;

    /**
     * Экспортирует проект в файл
     * @returns {boolean} - Успешно ли экспортирован проект
     */
    const exportProject = useCallback(() => {
        if (!isBrowser) {
            console.warn('Невозможно экспортировать проект на сервере');
            return false;
        }

        try {
            // Сериализуем текущее состояние графа
            const serializedGraph = SerializationService.serializeGraph(nodes, edges);

            // Экспортируем в JSON формате
            return SerializationService.exportToFile(projectName, serializedGraph);
        } catch (error) {
            console.error('Ошибка при экспорте проекта:', error);
            return false;
        }
    }, [nodes, edges, projectName, isBrowser]);

    /**
     * Импортирует проект из файла
     * @param {File} file - Файл проекта
     * @returns {Promise<boolean>} - Промис с результатом импорта
     */
    const importProject = useCallback(async (file) => {
        if (!isBrowser) {
            console.warn('Невозможно импортировать проект на сервере');
            return false;
        }

        try {
            // Сохраняем текущий проект, если он был изменен
            if (isModified && projectName) {
                const shouldSave = window.confirm(
                    `Проект "${projectName}" был изменен. Сохранить изменения перед импортом?`
                );

                if (shouldSave) {
                    functionRef.current.saveProject(projectName);
                }
            }

            const serializedGraph = await SerializationService.importFromFile(file);
            const { nodes: deserializedNodes, edges: deserializedEdges } =
                SerializationService.deserializeGraph(serializedGraph);

            setNodes(deserializedNodes);
            setEdges(deserializedEdges);

            // Устанавливаем имя проекта из имени файла без расширения
            const newProjectName = file.name.replace(/\.json$/i, '');
            setProjectName(newProjectName);
            setIsModified(true);
            setSelectedNodeId(null);

            // Устанавливаем флаг для автоматического масштабирования
            setNeedsFitView(true);

            return true;
        } catch (error) {
            console.error('Ошибка при импорте проекта:', error);
            return false;
        }
    }, [setNodes, setEdges, isBrowser, isModified, projectName]);

    // Значение контекста
    const value = {
        // Состояние
        nodes,
        edges,
        projectName,
        hasActiveProject,
        projectsList,
        projectVersions,
        isModified,
        selectedNodeId,
        isBrowser,
        saveError,
        loadError,
        needsFitView,

        // Методы обновления состояния
        setNodes,
        setEdges,
        onNodesChange,
        onEdgesChange,
        setProjectName,
        setIsModified,
        setSelectedNodeId,
        setNeedsFitView,

        // Методы работы с проектами
        createNewProject,
        saveProject,
        loadProject,
        deleteProject,
        exportProject,
        importProject,
        refreshProjectsList,

        // Методы работы с версиями
        createProjectVersion,
        loadProjectVersion,
        refreshVersionsList,
        deleteProjectVersion
    };

    return (
        <EditorContext.Provider value={value}>
            {children}
        </EditorContext.Provider>
    );
};

/**
 * Хук для использования контекста редактора
 * @returns {Object} - Значение контекста редактора
 */
export const useEditor = () => {
    const context = useContext(EditorContext);

    if (!context) {
        throw new Error('useEditor должен использоваться внутри EditorProvider');
    }

    return context;
};

export default EditorContext;