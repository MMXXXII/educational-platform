import React from 'react';

export function CourseImage({ course }) {
    // Функция для получения инициалов курса
    const getInitialsPlaceholder = (title) => {
        return title.substring(0, 2).toUpperCase();
    };

    // Универсальная система цветов на основе строки категории
    const getCategoryColor = (category) => {
        const colorOptions = [
            { bg: 'bg-blue-100', text: 'text-blue-600' },
            { bg: 'bg-green-100', text: 'text-green-600' },
            { bg: 'bg-yellow-100', text: 'text-yellow-600' },
            { bg: 'bg-purple-100', text: 'text-purple-600' },
            { bg: 'bg-red-100', text: 'text-red-600' },
            { bg: 'bg-cyan-100', text: 'text-cyan-600' },
            { bg: 'bg-indigo-100', text: 'text-indigo-600' },
            { bg: 'bg-pink-100', text: 'text-pink-600' },
            { bg: 'bg-orange-100', text: 'text-orange-600' },
            { bg: 'bg-teal-100', text: 'text-teal-600' }
        ];

        // Генерация числового хеша из строки категории
        let hash = 0;
        for (let i = 0; i < category.length; i++) {
            hash = ((hash << 5) - hash) + category.charCodeAt(i);
            hash |= 0; // Преобразование в 32-битное целое число
        }

        // Выбор цвета из массива на основе хеша
        const colorIndex = Math.abs(hash) % colorOptions.length;
        const colors = colorOptions[colorIndex];

        return { bg: colors.bg, text: colors.text };
    };

    // Нужно ли использовать заглушку
    const shouldUsePlaceholder = !course.imageUrl || course.imageUrl.startsWith('/images/');

    // Получение цвета на основе категории курса
    const colors = getCategoryColor(course.category);

    return (
        <div className="h-48 sm:h-64 bg-gray-200 relative">
            {shouldUsePlaceholder ? (
                <div className={`w-full h-full flex items-center justify-center ${colors.bg}`}>
                    <span className={`font-bold text-4xl ${colors.text}`}>
                        {getInitialsPlaceholder(course.title)}
                    </span>
                </div>
            ) : (
                <img
                    src={course.imageUrl}
                    alt={course.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.target.onerror = null;
                        // При ошибке загрузки показать заглушку с инициалами
                        const parent = e.target.parentNode;
                        if (parent) {
                            const placeholder = document.createElement('div');
                            placeholder.className = `w-full h-full flex items-center justify-center ${colors.bg}`;
                            placeholder.innerHTML = `<span class="font-bold text-4xl ${colors.text}">${getInitialsPlaceholder(course.title)}</span>`;
                            parent.replaceChild(placeholder, e.target);
                        }
                    }}
                />
            )}
            <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full">
                {course.level}
            </div>
        </div>
    );
}