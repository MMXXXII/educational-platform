import BaseNode from '../BaseNode';
import { v4 as uuidv4 } from 'uuid';

/**
 * PrintNode - нод для вывода значений
 */
export class PrintNode extends BaseNode {
    /**
     * @param {string} id - Идентификатор нода
     * @param {Object} data - Данные нода
     * @param {string} data.message - Сообщение по умолчанию для вывода
     */
    constructor(id = uuidv4(), data = {}) {
        super(id, 'print', 'Вывод', {
            message: data.message || '',
            ...data
        });

        // Добавление портов
        this.addInput('flow', '', 'flow');  // Flow-вход для управления выполнением
        this.addInput('value', 'Value', 'any');
        
        this.addOutput('flow', '', 'flow');  // Flow-выход для продолжения выполнения
    }

    /**
     * Выполняет логику нода
     * @param {Object} inputValues - Входные значения
     * @param {Object} context - Контекст выполнения
     * @returns {Object} - Выходные значения
     */
    execute(inputValues, context) {
        // Используем входное значение, если оно есть, иначе используем сообщение по умолчанию
        const value = inputValues.value !== undefined ? inputValues.value : this.data.message;

        // Явно преобразуем значение в строку для вывода
        let displayValue;

        if (value === null) {
            displayValue = 'null';
        } else if (value === undefined) {
            displayValue = 'undefined';
        } else if (typeof value === 'object') {
            try {
                displayValue = JSON.stringify(value);
            } catch (e) {
                displayValue = '[Object]';
            }
        } else {
            displayValue = String(value);
        }

        // Обновляем состояние нода
        this.state = { value: displayValue };

        // Добавляем вывод в консоль контекста
        if (context.console) {
            context.console.push({
                type: 'output',
                value: displayValue
            });
        } else {
            console.warn("[PrintNode] Context doesn't have console array");
        }

        // Возвращаем сигнал для перехода к следующему ноду
        return { flow: true };
    }
}