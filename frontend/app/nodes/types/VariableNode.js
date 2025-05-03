import BaseNode from '../BaseNode';
import { v4 as uuidv4 } from 'uuid';

/**
 * VariableNode - нод для хранения переменной
 */
export class VariableNode extends BaseNode {
    /**
     * @param {string} id - Идентификатор нода
     * @param {Object} data - Данные нода
     * @param {string} data.name - Имя переменной
     * @param {any} data.initialValue - Начальное значение переменной
     */
    constructor(id = uuidv4(), data = {}) {
        const name = data.name || 'x';
        super(id, 'variable', `Variable: ${name}`, {
            name,
            initialValue: data.initialValue !== undefined ? data.initialValue : '',
            ...data
        });

        // Добавление портов
        this.addInput('value', 'Value', 'any');
        this.addOutput('value', 'Value', 'any');
    }

    /**
     * Выполняет логику нода
     * @param {Object} inputValues - Входные значения
     * @param {Object} context - Контекст выполнения
     * @returns {Object} - Выходные значения
     */
    execute(inputValues, context) {
        // Если есть входное значение, используем его
        let value = inputValues.value;

        // Если входного значения нет, используем значение из данных нода
        if (value === undefined) {
            value = this.data.initialValue;
        }

        // Сохраняем значение в контексте выполнения
        if (context.variables) {
            context.variables[this.data.name] = value;
        }

        // Обновляем состояние нода
        this.state = { currentValue: value };

        // Возвращаем значение на выходной порт
        return { value };
    }

    /**
     * Переопределение метода setProperty для специфичной логики
     * @param {string} key - Ключ свойства
     * @param {any} value - Значение свойства 
     */
    setProperty(key, value) {
        super.setProperty(key, value);

        // Если обновилось имя переменной, обновим метку нода
        if (key === 'name') {
            this.label = `Variable: ${value}`;
        }

        return this;
    }
}