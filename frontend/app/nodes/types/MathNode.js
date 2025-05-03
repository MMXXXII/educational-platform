import BaseNode from '../BaseNode';
import { v4 as uuidv4 } from 'uuid';

/**
 * MathNode - нод для математических операций
 */
export class MathNode extends BaseNode {
    /**
     * @param {string} id - Идентификатор нода
     * @param {Object} data - Данные нода
     * @param {string} data.operation - Тип операции (add, subtract, multiply, divide)
     */
    constructor(id = uuidv4(), data = {}) {
        const operation = data.operation || 'add';
        let label;

        switch (operation) {
            case 'add': label = 'Addition'; break;
            case 'subtract': label = 'Subtraction'; break;
            case 'multiply': label = 'Multiplication'; break;
            case 'divide': label = 'Division'; break;
            default: label = 'Math Operation';
        }

        super(id, 'math', label, {
            operation,
            ...data
        });

        // Добавление портов
        this.addInput('a', 'A', 'number', true);
        this.addInput('b', 'B', 'number', true);
        this.addOutput('result', 'Result', 'number');
    }

    /**
     * Выполняет логику нода
     * @param {Object} inputValues - Входные значения
     * @param {Object} context - Контекст выполнения
     * @returns {Object} - Выходные значения
     */
    execute(inputValues, context) {
        const a = Number(inputValues.a) || 0;
        const b = Number(inputValues.b) || 0;
        let result;

        switch (this.data.operation) {
            case 'add':
                result = a + b;
                break;
            case 'subtract':
                result = a - b;
                break;
            case 'multiply':
                result = a * b;
                break;
            case 'divide':
                result = b !== 0 ? a / b : NaN;
                break;
            default:
                result = 0;
        }

        // Обновляем состояние нода
        this.state = { a, b, result };

        return { result };
    }

    /**
     * Переопределение метода setProperty для специфичной логики
     * @param {string} key - Ключ свойства
     * @param {any} value - Значение свойства 
     */
    setProperty(key, value) {
        super.setProperty(key, value);

        if (key === 'operation') {
            switch (value) {
                case 'add': this.label = 'Addition'; break;
                case 'subtract': this.label = 'Subtraction'; break;
                case 'multiply': this.label = 'Multiplication'; break;
                case 'divide': this.label = 'Division'; break;
                default: this.label = 'Math Operation';
            }
        }

        return this;
    }
}