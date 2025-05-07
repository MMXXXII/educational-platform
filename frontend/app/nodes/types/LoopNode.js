import BaseNode from '../BaseNode';
import { v4 as uuidv4 } from 'uuid';

/**
 * LoopNode - нод для циклов
 * Выполняет блок кода для заданного диапазона значений с указанным шагом
 */
export class LoopNode extends BaseNode {
    /**
     * @param {string} id - Идентификатор нода
     * @param {Object} data - Данные нода
     * @param {number} data.firstIndex - Начальное значение индекса
     * @param {number} data.lastIndex - Конечное значение индекса
     * @param {number} data.step - Шаг изменения индекса
     */
    constructor(id = uuidv4(), data = {}) {
        super(id, 'loop', 'Цикл', {
            // Используем новые параметры вместо count
            firstIndex: data.firstIndex !== undefined ? data.firstIndex : 0,
            lastIndex: data.lastIndex !== undefined ? data.lastIndex : 5,
            step: data.step !== undefined ? data.step : 1,
            ...data
        });

        // Добавление портов
        this.addInput('flow', 'Вход', 'flow');  // Flow-вход для управления выполнением
        
        // Новые входы для диапазона итераций
        this.addInput('firstIndex', 'Начальный индекс', 'number');
        this.addInput('lastIndex', 'Конечный индекс', 'number');
        this.addInput('step', 'Шаг', 'number');
        
        this.addOutput('body', 'Тело цикла', 'flow'); // Переход к телу цикла
        this.addOutput('next', 'После цикла', 'flow'); // Переход после завершения цикла
        this.addOutput('index', 'Индекс', 'number'); // Текущий индекс итерации
        
        // Инициализируем состояние цикла
        this.reset();
    }

    /**
     * Выполняет логику нода
     * @param {Object} inputValues - Входные значения
     * @param {Object} context - Контекст выполнения
     * @returns {Object} - Выходные значения
     */
    execute(inputValues, context) {
        console.log("Выполнение ноды цикла:", this.id, "Текущее состояние:", JSON.stringify(this.state));
        
        // Получаем параметры цикла из входных значений или данных нода
        const firstIndex = inputValues.firstIndex !== undefined
            ? Number(inputValues.firstIndex)
            : Number(this.data.firstIndex);
            
        const lastIndex = inputValues.lastIndex !== undefined
            ? Number(inputValues.lastIndex)
            : Number(this.data.lastIndex);
            
        const step = inputValues.step !== undefined
            ? Number(inputValues.step) || 1 // Если step равен 0, используем 1
            : Number(this.data.step) || 1;
            
        // Рассчитываем количество итераций для отображения в интерфейсе
        const count = step !== 0 ? Math.floor(Math.abs((lastIndex - firstIndex) / step)) + 1 : 0;

        // При первом запуске инициализируем состояние
        if (this.state.isFirstRun) {
            this.state = {
                firstIndex,
                lastIndex,
                step,
                count,
                currentIteration: 0,
                currentIndex: firstIndex,
                isFirstRun: false,
                isCompleted: false,
                bodyEntered: false
            };
            
            // Проверяем валидность параметров (шаг должен соответствовать направлению)
            const isValidRange = (step > 0 && firstIndex <= lastIndex) || 
                               (step < 0 && firstIndex >= lastIndex);
            
            // Регистрируем этот цикл в контексте
            context.setLoopReturn(this.id);
            console.log(`Цикл запущен с параметрами: от ${firstIndex} до ${lastIndex} с шагом ${step}`);
            
            context.log('debug', `Цикл запущен: ${firstIndex} → ${lastIndex} (шаг ${step})`);
            
            // Если параметры цикла невалидны, сразу завершаем цикл
            if (!isValidRange || step === 0) {
                this.state.isCompleted = true;
                context.log('debug', `Цикл пропущен: невалидные параметры`);
                return { next: true };
            }
            
            // Возвращаем сигнал для перехода к телу цикла и текущий индекс
            return {
                body: true,
                index: firstIndex
            };
        }
        
        // Проверяем, не завершен ли уже цикл
        if (this.state.isCompleted) {
            context.log('debug', `Цикл уже завершен`);
            return { next: true };
        }
        
        // Обрабатываем случай, когда мы вернулись в цикл после выполнения тела
        if (context.loopReturn === this.id) {
            // Увеличиваем счетчик итераций и индекс
            this.state.currentIteration += 1;
            this.state.currentIndex += this.state.step;
            
            // Очищаем сигнал возврата
            context.clearLoopReturn();
            
            console.log(
                "Возврат в цикл, итерация:", 
                this.state.currentIteration, 
                "индекс:", 
                this.state.currentIndex
            );
            
            // Проверяем, достигли ли мы конца цикла
            const isCompleted = this.state.step > 0 
                ? this.state.currentIndex > this.state.lastIndex
                : this.state.currentIndex < this.state.lastIndex;
                
            if (isCompleted) {
                // Цикл завершен
                this.state.isCompleted = true;
                context.log('debug', `Цикл завершен после ${this.state.currentIteration} итераций`);
                return { next: true };
            }
            
            // Ещё не достигли конца цикла, продолжаем
            context.log('debug', `Цикл: индекс ${this.state.currentIndex}, итерация ${this.state.currentIteration + 1}/${this.state.count}`);
            
            // Устанавливаем ID цикла для последующего возврата
            context.setLoopReturn(this.id);
            
            // Возвращаем сигнал для перехода к телу цикла и текущий индекс
            return {
                body: true,
                index: this.state.currentIndex
            };
        }
        
        // Ситуация, когда мы зашли в цикл не через flow-вход
        // Сбрасываем состояние и начинаем заново
        this.reset();
        
        context.log('debug', `Цикл: перезапуск`);
        
        // Возвращаем ничего, чтобы при следующем вызове начать с начала
        return {};
    }

    /**
     * Переопределение метода setProperty для специфичной логики
     * @param {string} key - Ключ свойства
     * @param {any} value - Значение свойства 
     */
    setProperty(key, value) {
        switch (key) {
            case 'firstIndex':
            case 'lastIndex':
                // Преобразуем значение в число
                super.setProperty(key, Number(value));
                break;
            case 'step':
                // Преобразуем значение в число и гарантируем, что шаг не равен 0
                const stepValue = Number(value);
                super.setProperty(key, stepValue === 0 ? 1 : stepValue);
                break;
            default:
                super.setProperty(key, value);
        }

        return this;
    }
    
    /**
     * Сбрасывает состояние нода
     * Полностью инициализирует состояние для нового выполнения
     */
    reset() {
        console.log(`Сброс состояния цикла: ${this.id}`);
        this.state = {
            firstIndex: this.data.firstIndex || 0,
            lastIndex: this.data.lastIndex || 5,
            step: this.data.step || 1,
            count: Math.floor(Math.abs(((this.data.lastIndex || 5) - (this.data.firstIndex || 0)) / (this.data.step || 1))) + 1,
            currentIteration: 0,
            currentIndex: this.data.firstIndex || 0,
            isFirstRun: true,
            isCompleted: false,
            bodyEntered: false
        };
    }
}