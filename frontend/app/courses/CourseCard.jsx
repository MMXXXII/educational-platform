// frontend/courses/CourseCard.jsx
import React from 'react';
import { Link } from 'react-router';

export function CourseCard({ course }) {
    const getInitialsPlaceholder = (title) => {
        return title.substring(0, 2).toUpperCase();
    };

    const getCategoryColor = (categoryName) => {
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

        if (!categoryName) return `${colorOptions[0].bg} ${colorOptions[0].text}`;

        let hash = 0;
        for (let i = 0; i < categoryName.length; i++) {
            hash = ((hash << 5) - hash) + categoryName.charCodeAt(i);
            hash |= 0;
        }

        const colors = colorOptions[Math.abs(hash) % colorOptions.length];
        return `${colors.bg} ${colors.text}`;
    };

    const categoryName = course.categories?.[0]?.name || '';

    const renderImage = () => {
        // Основное изменение: проверяем наличие валидного URL изображения
        const isValidImage = course.image_url && (
            course.image_url.startsWith('http://') ||
            course.image_url.startsWith('https://') ||
            course.image_url.startsWith('data:image')
        );

        if (!isValidImage) {
            const [bgClass, textClass] = getCategoryColor(categoryName).split(' ');
            return (
                <div className={`w-full h-full flex items-center justify-center ${bgClass}`}>
                    <span className={`font-bold text-lg ${textClass}`}>
                        {getInitialsPlaceholder(course.title)}
                    </span>
                </div>
            );
        }

        return (
            <img
                src={course.image_url}
                alt={course.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                    e.target.onerror = null;
                    const [bgClass, textClass] = getCategoryColor(categoryName).split(' ');
                    const parent = e.target.parentNode;
                    if (parent) {
                        parent.innerHTML = `
                            <div class="w-full h-full flex items-center justify-center ${bgClass}">
                                <span class="font-bold text-lg ${textClass}">
                                    ${getInitialsPlaceholder(course.title)}
                                </span>
                            </div>
                        `;
                    }
                }}
            />
        );
    };

    const formatLevel = (level) => {
        return level ? level.charAt(0).toUpperCase() + level.slice(1) : '';
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="h-40 bg-gray-200 relative">
                {renderImage()}
                <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                    {formatLevel(course.level)}
                </div>
            </div>

            {/* Остальная часть компонента без изменений */}
            <div className="p-4">
                <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">{course.title}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{course.description}</p>

                <div className="flex items-center text-sm text-gray-500 mb-3">
                    <span>Автор: {course.author}</span>
                    <span className="mx-2">•</span>
                    <span>{course.lessons_count || 0} уроков</span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        {course.students_count || 0} учеников
                    </div>

                    <Link
                        to={`/courses/${course.id}`}
                        className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
                    >
                        Подробнее
                    </Link>
                </div>
            </div>
        </div>
    );
}