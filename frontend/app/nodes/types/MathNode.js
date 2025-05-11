import BaseNode from '../BaseNode';
import { v4 as uuidv4 } from 'uuid';

/**
 * MathNode - нод для математических операций
 */
export class MathNode extends BaseNode {
    /**
     * @param {string} id - Идентификатор нода
     * @param {Object} data - Данные нода
     * @param {string} data.operation - Тип операции (add, subtract, multiply, divide, modulo)
     * @param {any} data.leftValue - Значение по умолчанию для левого операнда
     * @param {any} data.rightValue - Значение по умолчанию для правого операнда
     * @param {string} data.leftType - Тип левого операнда (number, string, boolean)
     * @param {string} data.rightType - Тип правого операнда (number, string, boolean)
     */
    constructor(id = uuidv4(), data = {}) {
        const operation = data.operation || 'add';
        let label;

        switch (operation) {
            case 'add': label = 'Сложение'; break;
            case 'subtract': label = 'Вычитание'; break;
            case 'multiply': label = 'Умножение'; break;
            case 'divide': label = 'Деление'; break;
            case 'modulo': label = 'Остаток'; break;
            default: label = 'Мат. Операция';
        }

        super(id, 'math', label, {
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
        this.addOutput('result', 'Result', 'any'); // Результат всегда выдаётся как прямое значение
    }

    /**
     * Выполняет логику нода
     * @param {Object} inputValues - Входные значения (уже с разрешенными reference-типами)
     * @param {Object} context - Контекст выполнения
     * @returns {Object} - Выходные значения
     */
    execute(inputValues, context) {
        // Получаем значения из входов
        const leftValue = inputValues.left !== undefined ? inputValues.left : this.data.leftValue;
        const rightValue = inputValues.right !== undefined ? inputValues.right : this.data.rightValue;
        
        // Преобразуем значения в соответствии с типом
        let left = leftValue;
        let right = rightValue;
        
        // Преобразуем типы по необходимости
        if (this.data.leftType === 'number' && typeof left !== 'number') {
            left = Number(left) || 0;
        }
        
        if (this.data.rightType === 'number' && typeof right !== 'number') {
            right = Number(right) || 0;
        }
        
        let result;

        switch (this.data.operation) {
            case 'add':
                result = left + right;
                break;
            case 'subtract':
                result = left - right;
                break;
            case 'multiply':
                result = left * right;
                break;
            case 'divide':
                result = right !== 0 ? left / right : NaN;
                break;
            case 'modulo':
                result = right !== 0 ? left % right : NaN;
                break;
            default:
                result = 0;
        }

        // Обновляем состояние нода
        this.state = { left, right, result };

        // Получаем символ операции для вывода в лог
        let opSymbol = '';
        switch (this.data.operation) {
            case 'add': opSymbol = '+'; break;
            case 'subtract': opSymbol = '-'; break;
            case 'multiply': opSymbol = '*'; break;
            case 'divide': opSymbol = '/'; break;
            case 'modulo': opSymbol = '%'; break;
        }

        // Логирование с уже извлеченными значениями
        context.log('output', `Вычисление: ${left} ${opSymbol} ${right} = ${result}`);

        return { 
            flow: true,  // Сигнал для продолжения выполнения
            result       // Результат операции
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
                case 'add': this.label = 'Сложение'; break;
                case 'subtract': this.label = 'Вычитание'; break;
                case 'multiply': this.label = 'Умножение'; break;
                case 'divide': this.label = 'Деление'; break;
                case 'modulo': this.label = 'Остаток'; break;
                default: this.label = 'Мат. Операция';
            }
        }

        return this;
    }
}