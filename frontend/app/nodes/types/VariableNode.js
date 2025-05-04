import BaseNode from '../BaseNode';
import { v4 as uuidv4 } from 'uuid';

/**
 * VariableNode - универсальный нод для создания или изменения переменных
 */
export class VariableNode extends BaseNode {
    /**
     * @param {string} id - Идентификатор нода
     * @param {Object} data - Данные нода
     * @param {string} data.name - Имя переменной
     * @param {any} data.initialValue - Начальное значение переменной
     * @param {string} data.variableType - Тип переменной (number, string, boolean)
     */
    constructor(id = uuidv4(), data = {}) {
        const name = data.name || 'x';
        super(id, 'variable', `Переменная: ${name}`, {
            name,
            initialValue: data.initialValue !== undefined ? data.initialValue : '',
            variableType: data.variableType || 'any',
            ...data
        });


        this.addInput('flow', 'Flow', 'flow');  
        this.addInput('value', 'Value', data.variableType || 'any'); 

        this.addOutput('flow', 'Flow', 'flow'); 
        this.addOutput('value', 'Value', data.variableType || 'any'); 
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

        // Преобразуем значение в соответствии с типом переменной
        if (this.data.variableType === 'number' && typeof value !== 'number') {
            value = Number(value) || 0;
        } else if (this.data.variableType === 'string' && typeof value !== 'string') {
            value = String(value);
        } else if (this.data.variableType === 'boolean' && typeof value !== 'boolean') {
            value = Boolean(value);
        }

        // Сохраняем значение в контексте выполнения
        if (context.variables) {
            context.variables[this.data.name] = value;
        }

        // Обновляем состояние нода
        this.state = { currentValue: value };

        // Возвращаем значение на выходные порты
        return { 
            flow: true,  // Сигнал для продолжения выполнения
            value: value // Значение переменной
        };
    }

    /**
     * Переопределение метода setProperty для специфичной логики
     * @param {string} key - Ключ свойства
     * @param {any} value - Значение свойства 
     */
    setProperty(key, value) {
        if (key === 'name') {
            super.setProperty(key, value);
            this.label = `Переменная: ${value}`;
        } else {
            super.setProperty(key, value);
        }

        // Если обновился тип переменной, обновляем типы портов
        if (key === 'variableType') {
            const inputs = this.inputs.filter(input => input.name === 'value');
            const outputs = this.outputs.filter(output => output.name === 'value');
            
            if (inputs.length > 0) {
                inputs[0].dataType = value;
            }
            
            if (outputs.length > 0) {
                outputs[0].dataType = value;
            }
        }

        return this;
    }
}