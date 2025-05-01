import BaseNode from './BaseNode';
import { v4 as uuidv4 } from 'uuid';

/**
 * VariableNode - нод для хранения переменной
 */
export class VariableNode extends BaseNode {
    /**
     * @param {string} id - Идентификатор нода
     * @param {Object} data - Данные нода
     * @param {string} data.name - Имя переменной
     * @param {any} data.initialValue - Начальное значение переменной
     */
    constructor(id = uuidv4(), data = {}) {
        const name = data.name || 'x';
        super(id, 'variable', `Переменная: ${name}`, {
            name,
            initialValue: data.initialValue !== undefined ? data.initialValue : '',
            ...data
        });

        // Добавление портов
        this.addInput('value', 'Значение', 'any');
        this.addOutput('value', 'Значение', 'any');
    }

    /**
     * Выполняет логику нода
     * @param {Object} inputValues - Входные значения
     * @param {Object} context - Контекст выполнения
     * @returns {Object} - Выходные значения
     */
    execute(inputValues, context) {
        // Если есть входное значение, используем его
        let value = inputValues.value;

        // Если входного значения нет, используем значение из данных нода
        if (value === undefined) {
            value = this.data.initialValue;
        }

        // Сохраняем значение в контексте выполнения
        if (context.variables) {
            context.variables[this.data.name] = value;
        }

        // Обновляем состояние нода
        this.state = { currentValue: value };

        // Возвращаем значение на выходной порт
        return { value };
    }

    /**
     * Переопределение метода setProperty для специфичной логики
     * @param {string} key - Ключ свойства
     * @param {any} value - Значение свойства 
     */
    setProperty(key, value) {
        super.setProperty(key, value);

        // Если обновилось имя переменной, обновим метку нода
        if (key === 'name') {
            this.label = `Переменная: ${value}`;
        }

        return this;
    }
}

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
        super(id, 'number', 'Число', {
            value: data.value !== undefined ? data.value : 0,
            ...data
        });

        // Добавление выходного порта
        this.addOutput('value', 'Значение', 'number');
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
        super(id, 'string', 'Строка', {
            value: data.value || '',
            ...data
        });

        // Добавление выходного порта
        this.addOutput('value', 'Значение', 'string');
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

/**
 * PrintNode - нод для вывода значений
 */
export class PrintNode extends BaseNode {
    /**
     * @param {string} id - Идентификатор нода
     * @param {Object} data - Данные нода
     */
    constructor(id = uuidv4(), data = {}) {
        super(id, 'print', 'Вывод', data);

        // Добавление портов
        this.addInput('value', 'Значение', 'any', true);
        this.addOutput('next', 'Далее', 'flow');
    }

    /**
     * Выполняет логику нода
     * @param {Object} inputValues - Входные значения
     * @param {Object} context - Контекст выполнения
     * @returns {Object} - Выходные значения
     */
    execute(inputValues, context) {
        const value = inputValues.value;

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
                displayValue = '[Объект]';
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
            console.warn("[PrintNode] Контекст не имеет console массива");
        }

        // Возвращаем сигнал для перехода к следующему ноду
        return { next: true };
    }
}

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
        super(id, 'loop', 'Цикл', {
            count: data.count || 5,
            currentIteration: 0,
            ...data
        });

        // Добавление портов
        this.addInput('count', 'Количество', 'number');
        this.addOutput('body', 'Тело цикла', 'flow');
        this.addOutput('next', 'После цикла', 'flow');
        this.addOutput('index', 'Индекс', 'number');
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
            // Преобразуем значение в целое число
            super.setProperty(key, Math.max(1, parseInt(value) || 1));
        } else {
            super.setProperty(key, value);
        }

        return this;
    }
}

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
            case 'add': label = 'Сложение'; break;
            case 'subtract': label = 'Вычитание'; break;
            case 'multiply': label = 'Умножение'; break;
            case 'divide': label = 'Деление'; break;
            default: label = 'Мат. операция';
        }

        super(id, 'math', label, {
            operation,
            ...data
        });

        // Добавление портов
        this.addInput('a', 'A', 'number', true);
        this.addInput('b', 'B', 'number', true);
        this.addOutput('result', 'Результат', 'number');
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
                case 'add': this.label = 'Сложение'; break;
                case 'subtract': this.label = 'Вычитание'; break;
                case 'multiply': this.label = 'Умножение'; break;
                case 'divide': this.label = 'Деление'; break;
                default: this.label = 'Мат. операция';
            }
        }

        return this;
    }
}

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
        super(id, 'if', 'Условие', {
            condition: data.condition || 'equal',
            ...data
        });

        // Добавление портов
        this.addInput('a', 'A', 'any', true);
        this.addInput('b', 'B', 'any', true);
        this.addOutput('true', 'Истина', 'flow');
        this.addOutput('false', 'Ложь', 'flow');
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

// Реестр всех типов нодов
export const nodeTypes = {
    variable: VariableNode,
    number: NumberNode,
    string: StringNode,
    print: PrintNode,
    loop: LoopNode,
    math: MathNode,
    if: IfNode
};

/**
 * Создает нод указанного типа
 * @param {string} type - Тип нода
 * @param {Object} data - Данные для инициализации нода
 * @returns {BaseNode} - Экземпляр созданного нода
 */
export function createNode(type, data = {}) {
    const NodeClass = nodeTypes[type];
    if (!NodeClass) {
        throw new Error(`Неизвестный тип нода: ${type}`);
    }
    return new NodeClass(data.id, data);
}

/**
 * Регистрирует новый тип нода
 * @param {string} type - Тип нода
 * @param {class} NodeClass - Класс нода
 */
export function registerNodeType(type, NodeClass) {
    nodeTypes[type] = NodeClass;
}

export default {
    BaseNode,
    VariableNode,
    NumberNode,
    StringNode,
    PrintNode,
    LoopNode,
    MathNode,
    IfNode,
    createNode,
    registerNodeType,
    nodeTypes
};