import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

// Создаем контекст
const GlobalVariablesContext = createContext();

// Перечисление типов переменных
export const VariableTypes = {
    NUMBER: 'number',
    STRING: 'string',
    BOOLEAN: 'boolean'
};

/**
 * Провайдер для контекста глобальных переменных
 * @param {Object} props - Свойства компонента
 * @param {React.ReactNode} props.children - Дочерние компоненты
 */
export const GlobalVariablesProvider = ({ children }) => {
    // Состояние для переменных
    const [variables, setVariables] = useState({});
    const [variableValues, setVariableValues] = useState({});
    const [isBrowser, setIsBrowser] = useState(false);

    // Инициализация из localStorage при монтировании
    useEffect(() => {
        setIsBrowser(true);
        try {
            const savedVariables = localStorage.getItem('nodeEditor_globalVariables');
            if (savedVariables) {
                const parsed = JSON.parse(savedVariables);
                setVariables(parsed);
                
                // Инициализация значений
                const initialValues = {};
                Object.entries(parsed).forEach(([name, variable]) => {
                    initialValues[name] = variable.initialValue;
                });
                setVariableValues(initialValues);
            }
        } catch (error) {
            console.error('Ошибка загрузки глобальных переменных из localStorage:', error);
        }
    }, []);

    // Сохранение в localStorage при изменении переменных
    useEffect(() => {
        if (isBrowser && Object.keys(variables).length > 0) {
            try {
                localStorage.setItem('nodeEditor_globalVariables', JSON.stringify(variables));
            } catch (error) {
                console.error('Ошибка сохранения глобальных переменных в localStorage:', error);
            }
        }
    }, [variables, isBrowser]);

    /**
     * Добавить новую переменную
     * @param {string} name - Имя переменной
     * @param {string} type - Тип переменной
     * @param {any} initialValue - Начальное значение
     * @returns {boolean} - Статус успешности
     */
    const addVariable = useCallback((name, type, initialValue) => {
        if (!name || name.trim() === '') {
            return false;
        }

        // Проверка, существует ли переменная уже
        if (variables[name]) {
            return false;
        }

        // Валидация начального значения в зависимости от типа
        let validatedValue;
        switch (type) {
            case VariableTypes.NUMBER:
                validatedValue = Number(initialValue) || 0;
                break;
            case VariableTypes.STRING:
                validatedValue = String(initialValue || '');
                break;
            case VariableTypes.BOOLEAN:
                validatedValue = Boolean(initialValue);
                break;
            default:
                validatedValue = initialValue;
        }

        // Добавление переменной
        setVariables(prev => ({
            ...prev,
            [name]: {
                type,
                initialValue: validatedValue
            }
        }));

        // Инициализация значения
        setVariableValues(prev => ({
            ...prev,
            [name]: validatedValue
        }));

        return true;
    }, [variables]);

    /**
     * Обновить переменную
     * @param {string} name - Имя переменной
     * @param {string} type - Новый тип переменной
     * @param {any} initialValue - Новое начальное значение
     * @returns {boolean} - Статус успешности
     */
    const updateVariable = useCallback((name, type, initialValue) => {
        if (!variables[name]) {
            return false;
        }

        // Валидация начального значения в зависимости от типа
        let validatedValue;
        switch (type) {
            case VariableTypes.NUMBER:
                validatedValue = Number(initialValue) || 0;
                break;
            case VariableTypes.STRING:
                validatedValue = String(initialValue || '');
                break;
            case VariableTypes.BOOLEAN:
                validatedValue = Boolean(initialValue);
                break;
            default:
                validatedValue = initialValue;
        }

        // Обновление переменной
        setVariables(prev => ({
            ...prev,
            [name]: {
                type,
                initialValue: validatedValue
            }
        }));

        // Обновление значения
        setVariableValues(prev => ({
            ...prev,
            [name]: validatedValue
        }));

        return true;
    }, [variables]);

    /**
     * Удалить переменную
     * @param {string} name - Имя переменной
     * @returns {boolean} - Статус успешности
     */
    const deleteVariable = useCallback((name) => {
        if (!variables[name]) {
            return false;
        }

        setVariables(prev => {
            const newVariables = { ...prev };
            delete newVariables[name];
            return newVariables;
        });

        setVariableValues(prev => {
            const newValues = { ...prev };
            delete newValues[name];
            return newValues;
        });

        return true;
    }, [variables]);

    /**
     * Получить значение переменной
     * @param {string} name - Имя переменной
     * @returns {any} - Значение переменной
     */
    const getVariableValue = useCallback((name) => {
        return variableValues[name];
    }, [variableValues]);

    /**
     * Установить значение переменной
     * @param {string} name - Имя переменной
     * @param {any} value - Новое значение
     * @returns {boolean} - Статус успешности
     */
    const setVariableValue = useCallback((name, value) => {
        if (!variables[name]) {
            return false;
        }

        // Валидация значения в зависимости от типа
        let validatedValue;
        const type = variables[name].type;
        switch (type) {
            case VariableTypes.NUMBER:
                validatedValue = Number(value) || 0;
                break;
            case VariableTypes.STRING:
                validatedValue = String(value || '');
                break;
            case VariableTypes.BOOLEAN:
                validatedValue = Boolean(value);
                break;
            default:
                validatedValue = value;
        }

        setVariableValues(prev => ({
            ...prev,
            [name]: validatedValue
        }));

        return true;
    }, [variables]);

    /**
     * Сбросить все значения переменных к их начальным значениям
     */
    const resetVariableValues = useCallback(() => {
        const initialValues = {};
        Object.entries(variables).forEach(([name, variable]) => {
            initialValues[name] = variable.initialValue;
        });
        setVariableValues(initialValues);
    }, [variables]);

    // Значение контекста
    const value = {
        variables,
        variableValues,
        addVariable,
        updateVariable,
        deleteVariable,
        getVariableValue,
        setVariableValue,
        resetVariableValues
    };

    return (
        <GlobalVariablesContext.Provider value={value}>
            {children}
        </GlobalVariablesContext.Provider>
    );
};

/**
 * Хук для использования контекста глобальных переменных
 * @returns {Object} - Контекст глобальных переменных
 */
export const useGlobalVariables = () => {
    const context = useContext(GlobalVariablesContext);
    if (!context) {
        throw new Error('useGlobalVariables должен использоваться внутри GlobalVariablesProvider');
    }
    return context;
};

export default GlobalVariablesContext;