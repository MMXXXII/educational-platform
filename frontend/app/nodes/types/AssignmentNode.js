import BaseNode from '../BaseNode';
import { v4 as uuidv4 } from 'uuid';

/**
 * AssignmentNode - нод для присваивания значения переменной
 */
export class AssignmentNode extends BaseNode {
    /**
     * @param {string} id - Идентификатор нода
     * @param {Object} data - Данные нода
     */
    constructor(id = uuidv4(), data = {}) {
        super(id, 'assignment', 'Присваивание', {
            ...data
        });

        // Добавление портов
        this.addInput('flow', 'Flow', 'flow');  // Flow-вход для управления выполнением
        this.addInput('left', 'left', 'reference', true);  // Левый операнд (ссылка на переменную)
        this.addInput('right', 'right', 'any', true); // Правый операнд (значение)
        
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
        // Отладочный вывод
        console.log('AssignmentNode execute. Входные значения:', JSON.stringify(inputValues));
        
        // Получаем ссылку на переменную и значение для присваивания
        let variableRef = inputValues.left;
        let valueToAssign = inputValues.right;
        
        // Проверяем формат входных данных и преобразуем их при необходимости
        // Если variableRef - это строка, преобразуем её в объект reference
        if (typeof variableRef === 'string') {
            variableRef = {
                type: 'reference',
                name: variableRef,
                variableType: 'any'
            };
            console.log('Преобразованная ссылка на переменную:', JSON.stringify(variableRef));
        }
        
        // Проверяем, что получили корректную ссылку на переменную
        if (!variableRef || variableRef.type !== 'reference' || !variableRef.name) {
            throw new Error('Не указана целевая переменная для присваивания');
        }
        
        // Проверяем, что получили значение для присваивания
        if (valueToAssign === undefined) {
            throw new Error('Не указано значение для присваивания');
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