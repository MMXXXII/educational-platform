/**
 * BaseNode - абстрактный базовый класс для всех типов нодов
 * Представляет общую структуру и функциональность, которую должны иметь все ноды
 */
class BaseNode {
    /**
     * Создает новый экземпляр нода
     * @param {string} id - Уникальный идентификатор нода
     * @param {string} type - Тип нода
     * @param {string} label - Отображаемое имя нода
     * @param {Object} data - Дополнительные данные нода
     */
    constructor(id, type, label, data = {}) {
        this.id = id;
        this.type = type;
        this.label = label || type;
        this.data = data;
        this.inputs = [];
        this.outputs = [];
        this.state = {}; // Состояние нода при выполнении
    }

    /**
     * Добавляет входной порт к ноду
     * @param {string} name - Имя порта
     * @param {string} label - Отображаемое имя порта
     * @param {string} dataType - Тип данных, принимаемых портом
     * @param {boolean} required - Является ли порт обязательным
     */
    addInput(name, label, dataType = 'any', required = false) {
        this.inputs.push({
            id: `input-${name}`,
            name,
            label: label || name,
            dataType,
            required
        });
        return this;
    }

    /**
     * Добавляет выходной порт к ноду
     * @param {string} name - Имя порта
     * @param {string} label - Отображаемое имя порта
     * @param {string} dataType - Тип данных, предоставляемых портом
     */
    addOutput(name, label, dataType = 'any') {
        this.outputs.push({
            id: `output-${name}`,
            name,
            label: label || name,
            dataType
        });
        return this;
    }

    /**
     * Проверяет совместимость типов данных для соединения
     * @param {string} sourceType - Тип данных источника
     * @param {string} targetType - Тип данных приемника
     * @returns {boolean} - Совместимы ли типы
     */
    static isCompatibleTypes(sourceType, targetType) {
        // Базовая логика совместимости типов
        if (sourceType === targetType) return true;
        if (sourceType === 'any' || targetType === 'any') return true;

        // Дополнительная логика совместимости типов
        // Число может быть подключено к строке, но не наоборот
        if (sourceType === 'number' && targetType === 'string') return true;

        return false;
    }

    /**
     * Устанавливает значение свойства нода
     * @param {string} key - Ключ свойства
     * @param {any} value - Значение свойства
     */
    setProperty(key, value) {
        this.data[key] = value;
        
        // Обновляем метку нода, если изменилось имя (для переменных)
        if (key === 'name' && this.type === 'variable') {
            this.label = `Переменная: ${value}`;
        }
        
        // Обновляем метку нода, если изменилась операция (для математических нодов)
        if (key === 'operation' && this.type === 'math') {
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

    /**
     * Получает значение свойства нода
     * @param {string} key - Ключ свойства
     * @returns {any} - Значение свойства
     */
    getProperty(key) {
        return this.data[key];
    }

    /**
     * Выполняет логику нода
     * @param {Object} inputValues - Входные значения
     * @param {Object} context - Контекст выполнения
     * @returns {Object} - Выходные значения
     */
    execute(inputValues, context = {}) {
        // Базовая реализация, должна быть переопределена в подклассах
        throw new Error('Метод execute должен быть реализован в подклассе');
    }

    /**
     * Преобразует нод в объект для визуализации в ReactFlow
     * @returns {Object} - Объект нода для ReactFlow
     */
    toReactFlowNode(position = { x: 0, y: 0 }) {
        return {
            id: this.id,
            type: 'customNode',
            position,
            data: {
                nodeRef: this,
                type: this.type,
                label: this.label,
                inputs: this.inputs,
                outputs: this.outputs,
                data: this.data
            }
        };
    }

    /**
     * Обновляет нод после изменения его свойств
     * Может быть переопределен в подклассах для специфической логики обновления
     */
    update() {
        return this;
    }

    /**
     * Сериализует нод для сохранения
     * @returns {Object} - Сериализованный объект нода
     */
    serialize() {
        return {
            id: this.id,
            type: this.type,
            label: this.label,
            data: this.data,
            inputs: this.inputs,
            outputs: this.outputs
        };
    }

    /**
     * Создает экземпляр нода из сериализованных данных
     * @param {Object} data - Сериализованные данные нода
     * @returns {BaseNode} - Новый экземпляр нода
     */
    static deserialize(data) {
        const node = new BaseNode(data.id, data.type, data.label, data.data);
        node.inputs = data.inputs;
        node.outputs = data.outputs;
        return node;
    }
}

export default BaseNode;