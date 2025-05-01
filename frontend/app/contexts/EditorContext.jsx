import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
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
    const [isModified, setIsModified] = useState(false);
    const [selectedNodeId, setSelectedNodeId] = useState(null);
    const [isBrowser, setIsBrowser] = useState(false);

    // Эффект для инициализации списка проектов после маунтинга компонента
    useEffect(() => {
        setIsBrowser(true);
        setProjectsList(SerializationService.getProjectsList());
    }, []);

    /**
     * Создает новый проект
     * @param {string} name - Имя проекта
     */
    const createNewProject = useCallback((name) => {
        setProjectName(name);
        setNodes([]);
        setEdges([]);
        setIsModified(false);
        setSelectedNodeId(null);
    }, [setNodes, setEdges]);

    /**
     * Сохраняет текущий проект
     * @param {string} name - Имя проекта (если не указано, используется текущее)
     * @returns {boolean} - Успешно ли сохранен проект
     */
    const saveProject = useCallback((name = null) => {
        if (!isBrowser) {
            console.warn('Невозможно сохранить проект на сервере');
            return false;
        }

        const projectToSave = name || projectName;

        if (!projectToSave) {
            return false;
        }

        const serializedGraph = SerializationService.serializeGraph(nodes, edges);
        const result = SerializationService.saveToLocalStorage(projectToSave, serializedGraph);

        if (result) {
            setProjectName(projectToSave);
            setIsModified(false);

            // Обновляем список проектов
            setProjectsList(SerializationService.getProjectsList());
        }

        return result;
    }, [nodes, edges, projectName, isBrowser]);

    /**
     * Загружает проект
     * @param {string} name - Имя проекта
     * @returns {boolean} - Успешно ли загружен проект
     */
    const loadProject = useCallback((name) => {
        if (!isBrowser) {
            console.warn('Невозможно загрузить проект на сервере');
            return false;
        }

        const serializedGraph = SerializationService.loadFromLocalStorage(name);

        if (!serializedGraph) {
            return false;
        }

        try {
            const { nodes: deserializedNodes, edges: deserializedEdges } =
                SerializationService.deserializeGraph(serializedGraph);

            setNodes(deserializedNodes);
            setEdges(deserializedEdges);
            setProjectName(name);
            setIsModified(false);
            setSelectedNodeId(null);

            return true;
        } catch (error) {
            console.error('Ошибка при загрузке проекта:', error);
            return false;
        }
    }, [setNodes, setEdges, isBrowser]);

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

        const result = SerializationService.deleteProject(name);

        if (result) {
            // Обновляем список проектов
            setProjectsList(SerializationService.getProjectsList());

            // Если удален текущий проект, создаем новый
            if (name === projectName) {
                createNewProject('');
            }
        }

        return result;
    }, [projectName, createNewProject, isBrowser]);

    /**
     * Экспортирует проект в файл
     * @returns {boolean} - Успешно ли экспортирован проект
     */
    const exportProject = useCallback(() => {
        if (!isBrowser) {
            console.warn('Невозможно экспортировать проект на сервере');
            return false;
        }

        const serializedGraph = SerializationService.serializeGraph(nodes, edges);
        return SerializationService.exportToFile(projectName, serializedGraph);
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
            const serializedGraph = await SerializationService.importFromFile(file);
            const { nodes: deserializedNodes, edges: deserializedEdges } =
                SerializationService.deserializeGraph(serializedGraph);

            setNodes(deserializedNodes);
            setEdges(deserializedEdges);
            setProjectName(file.name.replace(/\.json$/, ''));
            setIsModified(true);
            setSelectedNodeId(null);

            return true;
        } catch (error) {
            console.error('Ошибка при импорте проекта:', error);
            return false;
        }
    }, [setNodes, setEdges, isBrowser]);

    /**
     * Обновляет список проектов
     */
    const refreshProjectsList = useCallback(() => {
        if (isBrowser) {
            setProjectsList(SerializationService.getProjectsList());
        }
    }, [isBrowser]);

    // Значение контекста
    const value = {
        // Состояние
        nodes,
        edges,
        projectName,
        projectsList,
        isModified,
        selectedNodeId,
        isBrowser,

        // Методы обновления состояния
        setNodes,
        setEdges,
        onNodesChange,
        onEdgesChange,
        setProjectName,
        setIsModified,
        setSelectedNodeId,

        // Методы работы с проектами
        createNewProject,
        saveProject,
        loadProject,
        deleteProject,
        exportProject,
        importProject,
        refreshProjectsList
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