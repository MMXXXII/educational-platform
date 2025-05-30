import { useEffect, useState } from 'react';
import config from '../../config';

const API_URL = config.apiUrl || import.meta.env.VITE_API_URL || '';

export function CourseImagePlaceholder({ course, className = "w-full h-full object-cover" }) {
    const [displayImageUrl, setDisplayImageUrl] = useState(null);

    // Получение инициалов курса для placeholder
    const getInitialsPlaceholder = (title) => {
        return title.substring(0, 2).toUpperCase();
    };

    // Генерация цветовой схемы на основе категории
    const getCategoryColor = (categoryName) => {
        const colorOptions = [
            { bg: 'bg-blue-100', text: 'text-blue-600', darkBg: 'dark:bg-blue-800', darkText: 'dark:text-blue-300' },
            { bg: 'bg-green-100', text: 'text-green-600', darkBg: 'dark:bg-green-800', darkText: 'dark:text-green-300' },
            { bg: 'bg-yellow-100', text: 'text-yellow-600', darkBg: 'dark:bg-yellow-800', darkText: 'dark:text-yellow-300' },
            { bg: 'bg-purple-100', text: 'text-purple-600', darkBg: 'dark:bg-purple-800', darkText: 'dark:text-purple-300' },
            { bg: 'bg-red-100', text: 'text-red-600', darkBg: 'dark:bg-red-800', darkText: 'dark:text-red-300' },
            { bg: 'bg-cyan-100', text: 'text-cyan-600', darkBg: 'dark:bg-cyan-800', darkText: 'dark:text-cyan-300' },
            { bg: 'bg-indigo-100', text: 'text-indigo-600', darkBg: 'dark:bg-indigo-800', darkText: 'dark:text-indigo-300' },
            { bg: 'bg-pink-100', text: 'text-pink-600', darkBg: 'dark:bg-pink-800', darkText: 'dark:text-pink-300' },
            { bg: 'bg-orange-100', text: 'text-orange-600', darkBg: 'dark:bg-orange-800', darkText: 'dark:text-orange-300' },
            { bg: 'bg-teal-100', text: 'text-teal-600', darkBg: 'dark:bg-teal-800', darkText: 'dark:text-teal-300' }
        ];

        // Если категория не является строкой, используйте значение по умолчанию
        const category = typeof categoryName === 'string' ? categoryName : 'default';

        // Генерация числового хэша из строки категории
        let hash = 0;
        for (let i = 0; i < category.length; i++) {
            hash = ((hash << 5) - hash) + category.charCodeAt(i);
            hash |= 0; // Преобразование в 32-битное целое число
        }

        // Выбор цвета из массива на основе хэша
        const colorIndex = Math.abs(hash) % colorOptions.length;
        return colorOptions[colorIndex];
    };

    // Обработка URL изображения
    useEffect(() => {
        // Определение URL изображения (в API это image_url)
        let imageUrl = course.imageUrl || course.image_url;

        if (imageUrl) {
            // Для URL, начинающихся с /static, нам нужно получить их через API
            if (imageUrl.startsWith('/static/')) {
                imageUrl = `${API_URL}/api${imageUrl}`;
            }
            // Для других URL, начинающихся с /, добавить базовый URL API
            else if (imageUrl.startsWith('/')) {
                imageUrl = `${API_URL}${imageUrl}`;
            }
            // Для других URL, не начинающихся с /, добавить базовый URL API
            else if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://') && !imageUrl.startsWith('data:')) {
                imageUrl = `${API_URL}/${imageUrl}`;
            }

            setDisplayImageUrl(imageUrl);
        } else {
            setDisplayImageUrl(null);
        }
    }, [course]);

    // Определение категории курса (в API это может быть массив)
    const categoryName = course.category ||
        (course.categories && course.categories.length > 0 ? course.categories[0].name : 'default');

    // Получение цветов на основе категории курса
    const colors = getCategoryColor(categoryName);

    // Рендеринг placeholder
    const renderPlaceholder = () => {
        return (
            <div className={`w-full h-full flex items-center justify-center ${colors.bg} ${colors.darkBg}`}>
                <span className={`font-bold text-4xl ${colors.text} ${colors.darkText}`}>
                    {getInitialsPlaceholder(course.title)}
                </span>
            </div>
        );
    };

    // Обработка ошибки изображения
    const handleImageError = (e) => {
        e.target.onerror = null;

        const parent = e.target.parentNode;
        if (parent) {
            const placeholder = document.createElement('div');
            placeholder.className = `w-full h-full flex items-center justify-center ${colors.bg} ${colors.darkBg}`;
            placeholder.innerHTML = `<span class="font-bold text-4xl ${colors.text} ${colors.darkText}">${getInitialsPlaceholder(course.title)}</span>`;
            parent.replaceChild(placeholder, e.target);
        }
    };

    if (!displayImageUrl) {
        return renderPlaceholder();
    }

    return (
        <img
            src={displayImageUrl}
            alt={course.title}
            className={className}
            onError={handleImageError}
        />
    );
} 