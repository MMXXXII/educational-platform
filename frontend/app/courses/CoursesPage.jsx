import React, { useState, useEffect } from 'react';
import { CourseCard } from './CourseCard';
import { Filters } from './Filters';
import { SearchBar } from './SearchBar';
import { EmptyState } from './EmptyState';
import { LoadingState } from './LoadingState';
import { MOCK_COURSES, CATEGORIES, LEVELS } from './constants';

export function CoursesPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilters, setActiveFilters] = useState({
        categories: [],
        levels: []
    });

    // Имитация получения данных с сервера
    useEffect(() => {
        // Здесь будет запрос к API
        setTimeout(() => {
            setCourses(MOCK_COURSES);
            setLoading(false);
        }, 700);
    }, []);

    // Функция сброса фильтров
    const resetFilters = () => {
        setSearchQuery('');
        setActiveFilters({ categories: [], levels: [] });
    };

    // Фильтрация курсов
    const filteredCourses = courses.filter(course => {
        // Фильтр по поисковому запросу
        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

        // Фильтр по категориям
        const matchesCategory = activeFilters.categories.length === 0 ||
            activeFilters.categories.includes(course.category);

        // Фильтр по уровню сложности
        const matchesLevel = activeFilters.levels.length === 0 ||
            activeFilters.levels.includes(course.level);

        return matchesSearch && matchesCategory && matchesLevel;
    });

    return (
        <div className="container mx-auto px-4 sm:px-6 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Каталог курсов</h1>
                <p className="text-gray-600">Выбери подходящий курс и начни обучение программированию прямо сейчас</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Сайдбар с фильтрами (отображение на десктопе) */}
                <div className="w-full md:w-64 hidden md:block">
                    <Filters
                        categories={CATEGORIES}
                        levels={LEVELS}
                        setActiveFilters={setActiveFilters}
                        activeFilters={activeFilters}
                    />
                </div>

                <div className="flex-1">
                    {/* Верхняя панель поиска и фильтров */}
                    <SearchBar 
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        showFilters={showFilters}
                        setShowFilters={setShowFilters}
                    />

                    {/* Мобильные фильтры */}
                    {showFilters && (
                        <div className="mt-4 md:hidden">
                            <Filters
                                categories={CATEGORIES}
                                levels={LEVELS}
                                setActiveFilters={setActiveFilters}
                                activeFilters={activeFilters}
                            />
                        </div>
                    )}

                    {loading ? (
                        // Индикатор загрузки
                        <LoadingState />
                    ) : filteredCourses.length > 0 ? (
                        // Сетка курсов
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredCourses.map((course) => (
                                <CourseCard key={course.id} course={course} />
                            ))}
                        </div>
                    ) : (
                        // Состояние пустого результата
                        <EmptyState resetFilters={resetFilters} />
                    )}
                </div>
            </div>
        </div>
    );
}