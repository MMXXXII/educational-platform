import BaseNode from '../BaseNode';
import { v4 as uuidv4 } from 'uuid';

/**
 * AssignmentNode - нод для присваивания значения переменной
 */
export class AssignmentNode extends BaseNode {
    /**
     * @param {string} id - Идентификатор нода
     * @param {Object} data - Данные нода
     * @param {any} data.leftValue - Левый операнд (имя переменной)
     * @param {any} data.rightValue - Правый операнд (значение)
     * @param {string} data.rightType - Тип правого операнда
     */
    constructor(id = uuidv4(), data = {}) {
        super(id, 'assignment', 'Присваивание', {
            leftValue: data.leftValue !== undefined ? data.leftValue : '',
            rightValue: data.rightValue !== undefined ? data.rightValue : '',
            rightType: data.rightType || 'any',
            ...data
        });

        // Добавление портов
        this.addInput('flow', 'Flow', 'flow');  // Flow-вход для управления выполнением
        this.addInput('left', 'Target', 'reference', true);  // Левый операнд (ссылка на переменную)
        this.addInput('right', 'Value', 'any', true); // Правый операнд (значение)
        
        this.addOutput('flow', 'Flow', 'flow');  // Flow-выход для продолжения выполнения
        this.addOutput('result', 'Result', 'any');  // Результат операции (присвоенное значение)
    }

    /**
     * Выполняет логику нода
     * @param {Object} inputValues - Входные значения (уже с разрешенными reference-типами)
     * @param {Object} context - Контекст выполнения
     * @returns {Object} - Выходные значения
     */
    execute(inputValues, context) {
        // Получаем ссылку на переменную и значение для присваивания
        let variableRef = inputValues.left;
        let valueToAssign = inputValues.right !== undefined ? inputValues.right : this.data.rightValue;
        
        // Проверяем, что получили корректную ссылку на переменную
        if (!variableRef || variableRef.type !== 'reference' || !variableRef.name) {
            // Если ссылка не передана через вход, используем значение по умолчанию
            if (this.data.leftValue) {
                // Создаем ссылку из строкового значения
                variableRef = {
                    type: 'reference',
                    name: this.data.leftValue,
                    variableType: 'any'
                };
            } else {
                throw new Error('Не указана целевая переменная для присваивания');
            }
        }
        
        // Преобразуем правый операнд в соответствии с типом
        if (variableRef.variableType === 'number' && typeof valueToAssign !== 'number') {
            valueToAssign = Number(valueToAssign) || 0;
        } else if (variableRef.variableType === 'string' && typeof valueToAssign !== 'string') {
            valueToAssign = String(valueToAssign);
        } else if (variableRef.variableType === 'boolean' && typeof valueToAssign !== 'boolean') {
            valueToAssign = Boolean(valueToAssign);
        }
        
        // Сохраняем значение в контексте выполнения
        if (context.variables) {
            context.variables[variableRef.name] = valueToAssign;
            context.log('output', `Переменной "${variableRef.name}" присвоено значение: ${valueToAssign}`);
        }

        // Обновляем состояние нода
        this.state = { 
            variableName: variableRef.name, 
            value: valueToAssign, 
            result: valueToAssign 
        };

        return { 
            flow: true,  // Сигнал для продолжения выполнения
            result: valueToAssign  // Передаем результат операции (присвоенное значение)
        };
    }
}