import { useState, useEffect, useCallback } from 'react';
import { CourseCard } from './CourseCard';
import { Filters } from './Filters';
import { SearchBar } from './SearchBar';
import { EmptyState } from './EmptyState';
import { LoadingState, Pagination, PageSizeSelector } from '../common';
import { coursesApi, categoriesApi } from '../api/coursesService';

export function CoursesPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [difficultyOptions, setDifficultyOptions] = useState([
        { value: 'начинающий', label: 'Начинающий' },
        { value: 'средний', label: 'Средний' },
        { value: 'продвинутый', label: 'Продвинутый' }
    ]);
    const [activeFilters, setActiveFilters] = useState({
        categories: [],
        difficulties: []
    });
    // Состояние для дебаунса поиска
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

    // Состояния для пагинации
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize, setPageSize] = useState(12);
    const [totalItems, setTotalItems] = useState(0);

    // Настройка дебаунса для поисковых запросов
    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500); // задержка 500мс перед отправкой запроса

        return () => {
            clearTimeout(timerId);
        };
    }, [searchQuery]);

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

    // Получение курсов с сервера
    const fetchCourses = useCallback(async () => {
        setLoading(true);
        try {
            // Используем API сервис для получения данных
            const params = {
                page: currentPage,
                size: pageSize
            };

            // Добавляем строку поиска, если она не пустая
            if (debouncedSearchQuery.trim()) {
                params.search = debouncedSearchQuery.trim();
            }

            // Добавляем фильтры категорий, если они выбраны
            if (activeFilters.categories.length > 0) {
                // Получаем названия выбранных категорий
                const categoryNames = activeFilters.categories.map(categoryId => {
                    const category = categories.find(cat => cat.value === categoryId);
                    return category ? category.label : null;
                }).filter(Boolean);

                // Используем параметр category_names для множественного выбора
                if (categoryNames.length > 0) {
                    params.category_names = categoryNames;
                } else if (activeFilters.categories.length > 0) {
                    // Если не нашли имена по ID, используем сами ID
                    params.category_id = activeFilters.categories[0]; // Используем первый ID
                }
            }

            // Добавляем фильтры уровней сложности, если они выбраны
            if (activeFilters.difficulties.length > 0) {
                // Валидация сложностей - на бекенде допустимы только начинающий/средний/продвинутый
                const validDifficulties = ["начинающий", "средний", "продвинутый"];
                const filteredDifficulties = activeFilters.difficulties.filter(
                    diff => validDifficulties.includes(diff)
                );

                // Поддержка множественных значений сложности
                if (filteredDifficulties.length > 0) {
                    params.difficulties = filteredDifficulties;
                }
            }

            const data = await coursesApi.getCourses(params);
            setCourses(data.items || []);

            // Обновляем информацию о пагинации
            setTotalItems(data.total || 0);
            setTotalPages(Math.ceil((data.total || 0) / pageSize));
        } catch (error) {
            console.error('Failed to fetch courses:', error);
            setCourses([]);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearchQuery, activeFilters, currentPage, pageSize, categories]);

    // Запускаем поиск курсов при изменении фильтров, поисковой строки или страницы
    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    // Функция сброса фильтров и поиска
    const resetFilters = () => {
        setActiveFilters({ categories: [], difficulties: [] });
        setSearchQuery(''); // Также сбрасываем поиск
        setCurrentPage(1); // Возвращаемся на первую страницу при сбросе фильтров
    };

    // Обработчик для поиска при нажатии Enter
    const handleSearchSubmit = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            setCurrentPage(1); // Возвращаемся на первую страницу при новом поиске
            fetchCourses();
        }
    };

    // Обработчик изменения страницы
    const handlePageChange = (pageNumber) => {
        // Прокручиваем страницу вверх при смене страницы
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setCurrentPage(pageNumber);
    };

    // Обработчик изменения размера страницы
    const handlePageSizeChange = (e) => {
        const newSize = parseInt(e.target.value);
        setPageSize(newSize);
        setCurrentPage(1); // Сбрасываем на первую страницу при изменении размера
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 py-8">
            <div className="mb-8 text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Каталог курсов</h1>
                <p className="text-gray-600 dark:text-gray-300">Выбери подходящий курс и начни обучение программированию прямо сейчас</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Сайдбар с фильтрами (отображение на десктопе) */}
                <div className="w-full md:w-64 hidden md:block">
                    <Filters
                        categories={categories}
                        difficulties={difficultyOptions}
                        setActiveFilters={setActiveFilters}
                        activeFilters={activeFilters}
                    />
                    <button
                        onClick={resetFilters}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                        Сбросить фильтры
                    </button>
                </div>

                <div className="flex-1">

                    {/* Верхняя панель поиска и фильтров */}
                    <SearchBar
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        showFilters={showFilters}
                        setShowFilters={setShowFilters}
                        onKeyDown={handleSearchSubmit}
                    />

                    {/* Мобильные фильтры */}
                    {showFilters && (
                        <div className="mt-4 md:hidden">
                            <Filters
                                categories={categories}
                                difficulties={difficultyOptions}
                                setActiveFilters={setActiveFilters}
                                activeFilters={activeFilters}
                            />
                        </div>
                    )}

                    {/* Добавляем постоянную мобильную кнопку под поиском */}
                    <div className="md:hidden mb-4">
                        <button
                            onClick={resetFilters}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                            Сбросить фильтры
                        </button>
                    </div>

                    {loading ? (
                        // Индикатор загрузки
                        <LoadingState />
                    ) : courses.length > 0 ? (
                        <>
                            {/* Статистика результатов и выбор количества на странице */}
                            <PageSizeSelector
                                pageSize={pageSize}
                                onChange={handlePageSizeChange}
                                currentPage={currentPage}
                                totalItems={totalItems}
                                itemName="курсов"
                            />

                            {/* Сетка курсов */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {courses.map((course) => (
                                    <CourseCard key={course.id} course={course} />
                                ))}
                            </div>

                            {/* Компонент пагинации */}
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </>
                    ) : (
                        // Состояние пустого результата
                        <EmptyState resetFilters={resetFilters} />
                    )}
                </div>
            </div>
        </div>
    );
}