import BaseNode from '../BaseNode';
import { v4 as uuidv4 } from 'uuid';

/**
 * IfNode - нод для условного ветвления
 */
export class IfNode extends BaseNode {
    /**
     * @param {string} id - Идентификатор нода
     * @param {Object} data - Данные нода
     * @param {string} data.condition - Тип условия (equal, notEqual, greater, less, etc.)
     */
    constructor(id = uuidv4(), data = {}) {
        super(id, 'if', 'Condition', {
            condition: data.condition || 'equal',
            ...data
        });

        // Добавление портов
        this.addInput('a', 'A', 'any', true);
        this.addInput('b', 'B', 'any', true);
        this.addOutput('true', 'True', 'flow');
        this.addOutput('false', 'False', 'flow');
    }

    /**
     * Выполняет логику нода
     * @param {Object} inputValues - Входные значения
     * @param {Object} context - Контекст выполнения
     * @returns {Object} - Выходные значения
     */
    execute(inputValues, context) {
        const a = inputValues.a;
        const b = inputValues.b;
        let result = false;

        switch (this.data.condition) {
            case 'equal':
                result = a == b;
                break;
            case 'notEqual':
                result = a != b;
                break;
            case 'greater':
                result = a > b;
                break;
            case 'less':
                result = a < b;
                break;
            case 'greaterOrEqual':
                result = a >= b;
                break;
            case 'lessOrEqual':
                result = a <= b;
                break;
            default:
                result = false;
        }

        // Обновляем состояние нода
        this.state = { a, b, result };

        // Возвращаем сигнал для перехода по соответствующей ветке
        return result ? { true: true } : { false: true };
    }
}