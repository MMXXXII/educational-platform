import BaseNode from '../BaseNode';
import { v4 as uuidv4 } from 'uuid';

/**
 * StringNode - нод для строковых значений
 */
export class StringNode extends BaseNode {
    /**
     * @param {string} id - Идентификатор нода
     * @param {Object} data - Данные нода
     * @param {string} data.value - Строковое значение
     */
    constructor(id = uuidv4(), data = {}) {
        super(id, 'string', 'String', {
            value: data.value || '',
            ...data
        });

        // Добавление выходного порта
        this.addOutput('value', 'Value', 'string');
    }

    /**
     * Выполняет логику нода
     * @param {Object} inputValues - Входные значения
     * @param {Object} context - Контекст выполнения
     * @returns {Object} - Выходные значения
     */
    execute(inputValues, context) {
        const strValue = String(this.data.value);
        this.state = { value: strValue };
        return { value: strValue };
    }
}