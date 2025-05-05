import BaseNode from '../BaseNode';
import { v4 as uuidv4 } from 'uuid';

/**
 * IfNode - нод для условного ветвления
 */
export class IfNode extends BaseNode {
    /**
     * @param {string} id - Идентификатор нода
     * @param {Object} data - Данные нода
     */
    constructor(id = uuidv4(), data = {}) {
        super(id, 'if', 'Condition', data);

        // Добавление портов
        this.addInput('flow', '', 'flow');  // Flow-вход для управления выполнением
        this.addInput('test', 'Test', 'boolean', true); // Вход для условия (test)
        
        this.addOutput('true', 'True', 'flow');
        this.addOutput('false', 'False', 'flow');
        this.addOutput('result', 'Result', 'boolean'); // Добавляем выход для результата условия
    }

    /**
     * Выполняет логику нода
     * @param {Object} inputValues - Входные значения
     * @param {Object} context - Контекст выполнения
     * @returns {Object} - Выходные значения
     */
    execute(inputValues, context) {
        const test = inputValues.test;
        // Преобразуем входное значение в логический тип
        const result = Boolean(test);

        // Обновляем состояние нода
        this.state = { test, result };

        // Возвращаем сигнал для перехода по соответствующей ветке
        // и результат условия как значение для выходного порта 'result'
        return {
            ...(result ? { true: true } : { false: true }),
            result: result
        };
    }
}