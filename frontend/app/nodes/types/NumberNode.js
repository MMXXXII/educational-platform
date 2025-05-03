import BaseNode from '../BaseNode';
import { v4 as uuidv4 } from 'uuid';

/**
 * NumberNode - нод для числовых значений
 */
export class NumberNode extends BaseNode {
    /**
     * @param {string} id - Идентификатор нода
     * @param {Object} data - Данные нода
     * @param {number} data.value - Числовое значение
     */
    constructor(id = uuidv4(), data = {}) {
        super(id, 'number', 'Number', {
            value: data.value !== undefined ? data.value : 0,
            ...data
        });

        // Добавление выходного порта
        this.addOutput('value', 'Value', 'number');
    }

    /**
     * Выполняет логику нода
     * @param {Object} inputValues - Входные значения
     * @param {Object} context - Контекст выполнения
     * @returns {Object} - Выходные значения
     */
    execute(inputValues, context) {
        const numValue = Number(this.data.value);
        this.state = { value: numValue };
        return { value: numValue };
    }

    /**
     * Переопределение метода setProperty для специфичной логики
     * @param {string} key - Ключ свойства
     * @param {any} value - Значение свойства 
     */
    setProperty(key, value) {
        if (key === 'value') {
            // Преобразуем значение в число
            super.setProperty(key, Number(value));
        } else {
            super.setProperty(key, value);
        }

        return this;
    }
}