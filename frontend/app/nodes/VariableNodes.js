import BaseNode from './BaseNode';
import { v4 as uuidv4 } from 'uuid';

/**
 * SetVariableNode - нод для установки значения глобальной переменной
 */
export class SetVariableNode extends BaseNode {
    /**
     * @param {string} id - Идентификатор нода
     * @param {Object} data - Данные нода
     * @param {string} data.variableName - Имя глобальной переменной
     */
    constructor(id = uuidv4(), data = {}) {
        const variableName = data.variableName || '';
        super(id, 'set_variable', `Установить: ${variableName || '[выберите]'}`, {
            variableName,
            ...data
        });

        // Добавление портов
        this.addInput('flow', 'Вход', 'flow');
        this.addInput('value', 'Значение', 'any');
        this.addOutput('flow', 'Выход', 'flow');
    }

    /**
     * Выполняет логику нода
     * @param {Object} inputValues - Входные значения
     * @param {Object} context - Контекст выполнения
     * @returns {Object} - Выходные значения
     */
    execute(inputValues, context) {
        const value = inputValues.value;
        const variableName = this.data.variableName;

        // Проверяем, что имя переменной задано
        if (!variableName) {
            this.state = { error: 'Имя переменной не задано' };
            context.console.push({
                type: 'error',
                value: `Ошибка в ноде "${this.label}": Имя переменной не задано`
            });
            return { flow: true };
        }

        // Устанавливаем значение переменной в контексте
        if (context.globalVariables !== undefined && typeof context.setGlobalVariable === 'function') {
            context.setGlobalVariable(variableName, value);

            // Обновляем состояние нода
            this.state = {
                variableName,
                value,
                success: true
            };

            // Добавляем сообщение в консоль
            context.console.push({
                type: 'output',
                value: `Установлено значение переменной "${variableName}": ${JSON.stringify(value)}`
            });
        } else {
            // Если контекст не поддерживает глобальные переменные
            this.state = { error: 'Глобальные переменные не поддерживаются' };
            context.console.push({
                type: 'error',
                value: `Ошибка в ноде "${this.label}": Глобальные переменные не поддерживаются`
            });
        }

        // Продолжаем выполнение
        return { flow: true };
    }

    /**
     * Переопределение метода setProperty для специфичной логики
     * @param {string} key - Ключ свойства
     * @param {any} value - Значение свойства 
     */
    setProperty(key, value) {
        super.setProperty(key, value);

        // Если обновилось имя переменной, обновим метку нода
        if (key === 'variableName') {
            this.label = `Установить: ${value || '[выберите]'}`;
        }

        return this;
    }
}

/**
 * GetVariableNode - нод для получения значения глобальной переменной
 */
export class GetVariableNode extends BaseNode {
    /**
     * @param {string} id - Идентификатор нода
     * @param {Object} data - Данные нода
     * @param {string} data.variableName - Имя глобальной переменной
     */
    constructor(id = uuidv4(), data = {}) {
        const variableName = data.variableName || '';
        super(id, 'get_variable', `Получить: ${variableName || '[выберите]'}`, {
            variableName,
            ...data
        });

        // Добавление портов
        this.addOutput('value', 'Значение', 'any');
    }

    /**
     * Выполняет логику нода
     * @param {Object} inputValues - Входные значения
     * @param {Object} context - Контекст выполнения
     * @returns {Object} - Выходные значения
     */
    execute(inputValues, context) {
        const variableName = this.data.variableName;

        // Проверяем, что имя переменной задано
        if (!variableName) {
            this.state = { error: 'Имя переменной не задано' };
            context.console.push({
                type: 'error',
                value: `Ошибка в ноде "${this.label}": Имя переменной не задано`
            });
            return { value: undefined };
        }

        // Получаем значение переменной из контекста
        if (context.globalVariables) {
            const value = context.globalVariables[variableName];

            // Обновляем состояние нода
            this.state = {
                variableName,
                value,
                success: true
            };

            // Добавляем сообщение в консоль
            if (context.debug) {
                context.console.push({
                    type: 'debug',
                    value: `Получено значение переменной "${variableName}": ${JSON.stringify(value)}`
                });
            }

            // Возвращаем значение
            return { value };
        } else {
            // Если контекст не поддерживает глобальные переменные
            this.state = { error: 'Глобальные переменные не поддерживаются' };
            context.console.push({
                type: 'error',
                value: `Ошибка в ноде "${this.label}": Глобальные переменные не поддерживаются`
            });
            return { value: undefined };
        }
    }

    /**
     * Переопределение метода setProperty для специфичной логики
     * @param {string} key - Ключ свойства
     * @param {any} value - Значение свойства 
     */
    setProperty(key, value) {
        super.setProperty(key, value);

        // Если обновилось имя переменной, обновим метку нода
        if (key === 'variableName') {
            this.label = `Получить: ${value || '[выберите]'}`;
        }

        return this;
    }
}

export default {
    SetVariableNode,
    GetVariableNode
};