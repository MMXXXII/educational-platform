// Заглушка данных для курсов (в итоговом приложении будет приходить с API)
export const MOCK_COURSES = [
    {
        id: 1,
        title: 'Основы программирования в Python',
        description: 'Научитесь основам программирования с помощью Python - простого и мощного языка для начинающих.',
        level: 'начинающий',
        category: 'python',
        author: 'Александр Иванов',
        lessons: 12,
        imageUrl: '/images/python-basics.jpg',
        students: 1240,
        tags: ['python', 'основы программирования']
    },
    {
        id: 2,
        title: 'Создание веб-сайтов с HTML и CSS',
        description: 'Изучите основы веб-разработки и научитесь создавать свои первые веб-страницы.',
        level: 'начинающий',
        category: 'web',
        author: 'Мария Петрова',
        lessons: 10,
        imageUrl: '/images/html-css.jpg',
        students: 980,
        tags: ['html', 'css', 'веб-разработка']
    },
    {
        id: 3,
        title: 'JavaScript для детей',
        description: 'Интерактивный курс по JavaScript с играми и анимациями для юных программистов.',
        level: 'начинающий',
        category: 'javascript',
        author: 'Павел Смирнов',
        lessons: 15,
        imageUrl: '/images/js-kids.jpg',
        students: 750,
        tags: ['javascript', 'игры', 'анимация']
    },
    {
        id: 4,
        title: 'Алгоритмы и структуры данных',
        description: 'Изучите основные алгоритмы и структуры данных на примерах и интерактивных заданиях.',
        level: 'средний',
        category: 'algorithms',
        author: 'Анна Козлова',
        lessons: 20,
        imageUrl: '/images/algorithms.jpg',
        students: 420,
        tags: ['алгоритмы', 'структуры данных']
    },
    {
        id: 5,
        title: 'Разработка игр в Scratch',
        description: 'Создавайте свои первые игры с помощью визуального языка программирования Scratch.',
        level: 'начинающий',
        category: 'game-dev',
        author: 'Дмитрий Соколов',
        lessons: 8,
        imageUrl: '/images/scratch.jpg',
        students: 1580,
        tags: ['scratch', 'игры', 'визуальное программирование']
    },
    {
        id: 6,
        title: 'Робототехника с Arduino',
        description: 'Научитесь программировать микроконтроллеры Arduino и создавать свои электронные устройства.',
        level: 'средний',
        category: 'robotics',
        author: 'Екатерина Новикова',
        lessons: 14,
        imageUrl: '/images/arduino.jpg',
        students: 340,
        tags: ['arduino', 'робототехника', 'электроника']
    }
];

export const CATEGORIES = [
    { value: 'python', label: 'Python' },
    { value: 'web', label: 'Веб-разработка' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'algorithms', label: 'Алгоритмы' },
    { value: 'game-dev', label: 'Разработка игр' },
    { value: 'robotics', label: 'Робототехника' }
];

export const LEVELS = [
    { value: 'начинающий', label: 'Начинающий' },
    { value: 'средний', label: 'Средний' },
    { value: 'продвинутый', label: 'Продвинутый' }
];