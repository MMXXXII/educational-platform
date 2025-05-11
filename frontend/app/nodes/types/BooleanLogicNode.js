import BaseNode from '../BaseNode';
import { v4 as uuidv4 } from 'uuid';

/**
 * BooleanLogicNode - нод для логических операций над булевыми значениями
 */
export class BooleanLogicNode extends BaseNode {
    /**
     * @param {string} id - Идентификатор нода
     * @param {Object} data - Данные нода
     * @param {string} data.operation - Тип операции (and, or)
     */
    constructor(id = uuidv4(), data = {}) {
        const operation = data.operation || 'and';
        let label;

        switch (operation) {
            case 'and': label = 'Булевое И'; break;
            case 'or': label = 'Булевое ИЛИ'; break;
            default: label = 'Булевый оператор';
        }

        super(id, 'booleanLogic', label, {
            operation, // Только операция, никаких других параметров
            ...data
        });

        // Добавление портов
        this.addInput('flow', 'Flow', 'flow');  // Flow-вход для управления выполнением
        this.addInput('left', 'Left', 'boolean', true);  // Левый операнд (обязательный)
        this.addInput('right', 'Right', 'boolean', true); // Правый операнд (обязательный)
        
        this.addOutput('flow', 'Flow', 'flow');  // Flow-выход для продолжения выполнения
        this.addOutput('result', 'Result', 'boolean'); // Результат операции
    }

    /**
     * Выполняет логику нода
     * @param {Object} inputValues - Входные значения
     * @param {Object} context - Контекст выполнения
     * @returns {Object} - Выходные значения
     */
    execute(inputValues, context) {
        // Проверяем наличие обязательных входных значений
        if (inputValues.left === undefined || inputValues.right === undefined) {
            throw new Error('Для операции требуются оба входных значения');
        }
        
        // Преобразуем входные значения в логический тип
        const left = Boolean(inputValues.left);
        const right = Boolean(inputValues.right);
        
        let result;

        switch (this.data.operation) {
            case 'and':
                result = left && right;
                break;
            case 'or':
                result = left || right;
                break;
            default:
                result = false;
        }

        // Добавляем сообщение в лог контекста в компактном формате
        const opSymbol = this.data.operation === 'and' ? '&&' : '||';
        const opName = this.data.operation === 'and' ? 'И' : 'ИЛИ';
        context.log('output', `Булевое ${opName}: ${left} ${opSymbol} ${right} = ${result}`);

        // Обновляем состояние нода
        this.state = { left, right, result };

        return { 
            flow: true,  // Сигнал для продолжения выполнения
            result 
        };
    }

    /**
     * Переопределение метода setProperty для обновления метки нода
     * @param {string} key - Ключ свойства
     * @param {any} value - Значение свойства 
     */
    setProperty(key, value) {
        super.setProperty(key, value);

        if (key === 'operation') {
            switch (value) {
                case 'and': this.label = 'Булевое И'; break;
                case 'or': this.label = 'Булевое ИЛИ'; break;
                default: this.label = 'Булевый оператор';
            }
        }

        return this;
    }
}