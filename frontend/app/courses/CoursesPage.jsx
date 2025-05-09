import React, { useState, useEffect } from 'react';
import { CourseCard } from './CourseCard';
import { Filters } from './Filters';
import { SearchBar } from './SearchBar';
import { EmptyState } from './EmptyState';
import { LoadingState } from './LoadingState';
import { coursesApi, categoriesApi } from '../api/coursesService';

export function CoursesPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [levelOptions, setLevelOptions] = useState([]);
    const [activeFilters, setActiveFilters] = useState({
        categories: [],
        levels: []
    });

    // Получение категорий с сервера
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoriesApi.getCategories();
                // Достаем массив категорий из поля items
                const categoriesArray = response.items;

                const formattedCategories = categoriesArray.map(category => ({
                    value: category.id,
                    label: category.name
                }));

                setCategories(formattedCategories);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
                setCategories([]);
            }
        };

        fetchCategories();
    }, []);

    // Получение всех доступных уровней сложности
    useEffect(() => {
        const fetchAllLevels = async () => {
            try {
                // Запрашиваем курсы без фильтров, чтобы получить все возможные уровни
                const data = await coursesApi.getCourses({
                    page: 1,
                    size: 100  // Запрашиваем большее количество курсов для получения всех возможных уровней
                });

                if (data.items?.length > 0) {
                    const uniqueLevels = [...new Set(data.items.map(course => course.level))]
                        .filter(Boolean)
                        .map(level => ({
                            value: level,
                            label: level
                        }));

                    setLevelOptions(uniqueLevels);
                }
            } catch (error) {
                console.error('Failed to fetch all levels:', error);
                // В случае ошибки используем стандартные уровни
                setLevelOptions([
                    { value: 'начинающий', label: 'Начинающий' },
                    { value: 'средний', label: 'Средний' },
                    { value: 'продвинутый', label: 'Продвинутый' }
                ]);
            }
        };

        fetchAllLevels();
    }, []);

    // Получение курсов с сервера
    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            try {
                // Используем API сервис для получения данных
                const params = {
                    page: 1,
                    size: 12,
                    search: searchQuery || undefined
                };

                // Добавляем фильтры категорий, если они выбраны
                if (activeFilters.categories.length > 0) {
                    // Бэкенд ожидает один category_id, а не массив
                    // Преобразуем массив в отдельные параметры
                    params.category_id = activeFilters.categories[0];
                }

                // Добавляем фильтры уровней, если они выбраны
                if (activeFilters.levels.length > 0) {
                    // Бэкенд ожидает один level параметр, а не массив
                    params.level = activeFilters.levels[0];
                }

                const data = await coursesApi.getCourses(params);
                setCourses(data.items || []);
            } catch (error) {
                console.error('Failed to fetch courses:', error);
                setCourses([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, [searchQuery, activeFilters]);

    // Функция сброса фильтров
    const resetFilters = () => {
        setSearchQuery('');
        setActiveFilters({ categories: [], levels: [] });
    };

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
                        categories={categories}
                        levels={levelOptions}
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
                                categories={categories}
                                levels={levelOptions}
                                setActiveFilters={setActiveFilters}
                                activeFilters={activeFilters}
                            />
                        </div>
                    )}

                    {loading ? (
                        // Индикатор загрузки
                        <LoadingState />
                    ) : courses.length > 0 ? (
                        // Сетка курсов
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {courses.map((course) => (
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