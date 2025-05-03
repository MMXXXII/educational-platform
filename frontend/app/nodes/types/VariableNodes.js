import BaseNode from '../BaseNode';
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
        super(id, 'set_variable', `Set: ${variableName || '[select]'}`, {
            variableName,
            ...data
        });

        // Добавление портов
        this.addInput('flow', 'Input', 'flow');
        this.addInput('value', 'Value', 'any');
        this.addOutput('flow', 'Output', 'flow');
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
            this.state = { error: 'Variable name not set' };
            context.console.push({
                type: 'error',
                value: `Error in node "${this.label}": Variable name not set`
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
                value: `Set variable "${variableName}" value: ${JSON.stringify(value)}`
            });
        } else {
            // Если контекст не поддерживает глобальные переменные
            this.state = { error: 'Global variables not supported' };
            context.console.push({
                type: 'error',
                value: `Error in node "${this.label}": Global variables not supported`
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
            this.label = `Set: ${value || '[select]'}`;
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
        super(id, 'get_variable', `Get: ${variableName || '[select]'}`, {
            variableName,
            ...data
        });

        // Add ports
        this.addOutput('value', 'Value', 'any');
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
            this.state = { error: 'Variable name not set' };
            context.console.push({
                type: 'error',
                value: `Error in node "${this.label}": Variable name not set`
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
                    value: `Got variable "${variableName}" value: ${JSON.stringify(value)}`
                });
            }

            // Возвращаем значение
            return { value };
        } else {
            // Если контекст не поддерживает глобальные переменные
            this.state = { error: 'Global variables not supported' };
            context.console.push({
                type: 'error',
                value: `Error in node "${this.label}": Global variables not supported`
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
            this.label = `Get: ${value || '[select]'}`;
        }

        return this;
    }
}

export default {
    SetVariableNode,
    GetVariableNode
};