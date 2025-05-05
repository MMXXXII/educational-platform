import BaseNode from '../BaseNode';
import { v4 as uuidv4 } from 'uuid';

/**
 * LoopNode - нод для циклов
 */
export class LoopNode extends BaseNode {
    /**
     * @param {string} id - Идентификатор нода
     * @param {Object} data - Данные нода
     * @param {number} data.count - Количество итераций
     */
    constructor(id = uuidv4(), data = {}) {
        super(id, 'loop', 'Loop', {
            count: data.count || 5,
            currentIteration: 0,
            ...data
        });

        // Добавление портов
        this.addInput('flow', '', 'flow');  // Flow-вход для управления выполнением
        this.addInput('count', 'Count', 'number');
        
        this.addOutput('body', 'Loop Body', 'flow');
        this.addOutput('next', 'After Loop', 'flow');
        this.addOutput('index', 'Index', 'number');
    }

    /**
     * Выполняет логику нода
     * @param {Object} inputValues - Входные значения
     * @param {Object} context - Контекст выполнения
     * @returns {Object} - Выходные значения
     */
    execute(inputValues, context) {
        // Получаем количество итераций из входного значения или данных нода
        const count = inputValues.count !== undefined
            ? Math.max(0, parseInt(inputValues.count))
            : this.data.count;

        // Если это первая итерация или продолжение цикла
        if (this.state.currentIteration === undefined ||
            context.loopReturn === this.id) {

            // Если возвращаемся из тела цикла, увеличиваем счетчик
            if (context.loopReturn === this.id) {
                this.state.currentIteration++;
            } else {
                // Инициализируем счетчик для новой итерации
                this.state.currentIteration = 0;
            }

            // Очищаем метку возвращения из цикла
            context.loopReturn = undefined;

            // Если еще не достигли конца цикла
            if (this.state.currentIteration < count) {
                // Обновляем состояние нода
                this.state = {
                    count,
                    currentIteration: this.state.currentIteration
                };

                // Возвращаем сигнал для перехода к телу цикла и текущий индекс
                return {
                    body: true,
                    index: this.state.currentIteration
                };
            }
        }

        // Если цикл завершен, сбрасываем состояние и переходим к следующему ноду
        this.state = { count, currentIteration: 0 };
        return { next: true };
    }

    /**
     * Переопределение метода setProperty для специфичной логики
     * @param {string} key - Ключ свойства
     * @param {any} value - Значение свойства 
     */
    setProperty(key, value) {
        if (key === 'count') {
            // Convert value to integer
            super.setProperty(key, Math.max(1, parseInt(value) || 1));
        } else {
            super.setProperty(key, value);
        }

        return this;
    }
}