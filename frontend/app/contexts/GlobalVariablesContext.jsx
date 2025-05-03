import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

// Create context
const GlobalVariablesContext = createContext();

// Variable types enum
export const VariableTypes = {
    NUMBER: 'number',
    STRING: 'string',
    BOOLEAN: 'boolean'
};

/**
 * Provider for global variables context
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const GlobalVariablesProvider = ({ children }) => {
    // State for variables
    const [variables, setVariables] = useState({});
    const [variableValues, setVariableValues] = useState({});
    const [isBrowser, setIsBrowser] = useState(false);

    // Initialize from localStorage on mount
    useEffect(() => {
        setIsBrowser(true);
        try {
            const savedVariables = localStorage.getItem('nodeEditor_globalVariables');
            if (savedVariables) {
                const parsed = JSON.parse(savedVariables);
                setVariables(parsed);
                
                // Initialize values
                const initialValues = {};
                Object.entries(parsed).forEach(([name, variable]) => {
                    initialValues[name] = variable.initialValue;
                });
                setVariableValues(initialValues);
            }
        } catch (error) {
            console.error('Error loading global variables from localStorage:', error);
        }
    }, []);

    // Save to localStorage when variables change
    useEffect(() => {
        if (isBrowser && Object.keys(variables).length > 0) {
            try {
                localStorage.setItem('nodeEditor_globalVariables', JSON.stringify(variables));
            } catch (error) {
                console.error('Error saving global variables to localStorage:', error);
            }
        }
    }, [variables, isBrowser]);

    /**
     * Add a new variable
     * @param {string} name - Variable name
     * @param {string} type - Variable type
     * @param {any} initialValue - Initial value
     * @returns {boolean} - Success status
     */
    const addVariable = useCallback((name, type, initialValue) => {
        if (!name || name.trim() === '') {
            return false;
        }

        // Check if variable already exists
        if (variables[name]) {
            return false;
        }

        // Validate initial value based on type
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

        // Add variable
        setVariables(prev => ({
            ...prev,
            [name]: {
                type,
                initialValue: validatedValue
            }
        }));

        // Initialize value
        setVariableValues(prev => ({
            ...prev,
            [name]: validatedValue
        }));

        return true;
    }, [variables]);

    /**
     * Update a variable
     * @param {string} name - Variable name
     * @param {string} type - New variable type
     * @param {any} initialValue - New initial value
     * @returns {boolean} - Success status
     */
    const updateVariable = useCallback((name, type, initialValue) => {
        if (!variables[name]) {
            return false;
        }

        // Validate initial value based on type
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

        // Update variable
        setVariables(prev => ({
            ...prev,
            [name]: {
                type,
                initialValue: validatedValue
            }
        }));

        // Update value
        setVariableValues(prev => ({
            ...prev,
            [name]: validatedValue
        }));

        return true;
    }, [variables]);

    /**
     * Delete a variable
     * @param {string} name - Variable name
     * @returns {boolean} - Success status
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
     * Get value of a variable
     * @param {string} name - Variable name
     * @returns {any} - Variable value
     */
    const getVariableValue = useCallback((name) => {
        return variableValues[name];
    }, [variableValues]);

    /**
     * Set value of a variable
     * @param {string} name - Variable name
     * @param {any} value - New value
     * @returns {boolean} - Success status
     */
    const setVariableValue = useCallback((name, value) => {
        if (!variables[name]) {
            return false;
        }

        // Validate value based on type
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
     * Reset all variable values to their initial values
     */
    const resetVariableValues = useCallback(() => {
        const initialValues = {};
        Object.entries(variables).forEach(([name, variable]) => {
            initialValues[name] = variable.initialValue;
        });
        setVariableValues(initialValues);
    }, [variables]);

    // Context value
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
 * Hook to use global variables context
 * @returns {Object} - Global variables context
 */
export const useGlobalVariables = () => {
    const context = useContext(GlobalVariablesContext);
    if (!context) {
        throw new Error('useGlobalVariables must be used within a GlobalVariablesProvider');
    }
    return context;
};

export default GlobalVariablesContext;