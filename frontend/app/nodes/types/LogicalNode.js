import BaseNode from '../BaseNode';
import { v4 as uuidv4 } from 'uuid';

/**
 * LogicalNode - нод для логических операций сравнения
 */
export class LogicalNode extends BaseNode {
    /**
     * @param {string} id - Идентификатор нода
     * @param {Object} data - Данные нода
     * @param {string} data.operation - Тип операции (equal, notEqual, strictEqual, strictNotEqual, greater, greaterEqual, less, lessEqual)
     * @param {any} data.leftValue - Значение по умолчанию для левого операнда
     * @param {any} data.rightValue - Значение по умолчанию для правого операнда
     * @param {string} data.leftType - Тип левого операнда (number, string, boolean)
     * @param {string} data.rightType - Тип правого операнда (number, string, boolean)
     */
    constructor(id = uuidv4(), data = {}) {
        const operation = data.operation || 'equal';
        let label;

        switch (operation) {
            case 'equal': label = 'Равно (==)'; break;
            case 'notEqual': label = 'Не равно (!=)'; break;
            case 'strictEqual': label = 'Строго равно (===)'; break;
            case 'strictNotEqual': label = 'Строго не равно (!==)'; break;
            case 'greater': label = 'Больше (>)'; break;
            case 'greaterEqual': label = 'Больше или равно (>=)'; break;
            case 'less': label = 'Меньше (<)'; break;
            case 'lessEqual': label = 'Меньше или равно (<=)'; break;
            default: label = 'Лог. Операция';
        }

        super(id, 'logical', label, {
            operation,
            leftValue: data.leftValue !== undefined ? data.leftValue : 0,
            rightValue: data.rightValue !== undefined ? data.rightValue : 0,
            leftType: data.leftType || 'number',
            rightType: data.rightType || 'number',
            ...data
        });

        // Добавление портов
        this.addInput('flow', 'Flow', 'flow');  // Flow-вход для управления выполнением
        this.addInput('left', 'Left', 'any', true);
        this.addInput('right', 'Right', 'any', true);
        
        this.addOutput('flow', 'Flow', 'flow');  // Flow-выход для продолжения выполнения
        this.addOutput('result', 'Result', 'boolean');
    }

    /**
     * Преобразует значение к нужному типу
     * @param {any} value - Значение для преобразования
     * @param {string} type - Целевой тип (number, string, boolean)
     * @returns {any} - Преобразованное значение
     */
    convertValue(value, type) {
        if (value === undefined || value === null) {
            return null;
        }

        switch (type) {
            case 'number':
                return Number(value) || 0;
            case 'string':
                return String(value);
            case 'boolean':
                return Boolean(value);
            default:
                return value;
        }
    }

    /**
     * Выполняет логику нода
     * @param {Object} inputValues - Входные значения
     * @param {Object} context - Контекст выполнения
     * @returns {Object} - Выходные значения
     */
    execute(inputValues, context) {
        // Используем значения из входов или значения по умолчанию
        const left = inputValues.left !== undefined ? inputValues.left : this.convertValue(this.data.leftValue, this.data.leftType);
        const right = inputValues.right !== undefined ? inputValues.right : this.convertValue(this.data.rightValue, this.data.rightType);
        
        let result;

        switch (this.data.operation) {
            case 'equal':
                result = left == right;
                break;
            case 'notEqual':
                result = left != right;
                break;
            case 'strictEqual':
                result = left === right;
                break;
            case 'strictNotEqual':
                result = left !== right;
                break;
            case 'greater':
                result = left > right;
                break;
            case 'greaterEqual':
                result = left >= right;
                break;
            case 'less':
                result = left < right;
                break;
            case 'lessEqual':
                result = left <= right;
                break;
            default:
                result = false;
        }

        // Обновляем состояние нода
        this.state = { left, right, result };

        return { 
            flow: true,  // Сигнал для продолжения выполнения
            result 
        };
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
                case 'equal': this.label = 'Равно (==)'; break;
                case 'notEqual': this.label = 'Не равно (!=)'; break;
                case 'strictEqual': this.label = 'Строго равно (===)'; break;
                case 'strictNotEqual': this.label = 'Строго не равно (!==)'; break;
                case 'greater': this.label = 'Больше (>)'; break;
                case 'greaterEqual': this.label = 'Больше или равно (>=)'; break;
                case 'less': this.label = 'Меньше (<)'; break;
                case 'lessEqual': this.label = 'Меньше или равно (<=)'; break;
                default: this.label = 'Лог. Операция';
            }
        }

        return this;
    }
}