import React from 'react';

// Компонент фильтрации
export function Filters({ categories, levels, setActiveFilters, activeFilters }) {
    // Обработчик изменения категории
    const handleCategoryChange = (categoryId) => {
        // Проверяем, выбрана ли уже эта категория
        if (activeFilters.categories.includes(categoryId)) {
            // Если выбрана - убираем из выбранных
            setActiveFilters({
                ...activeFilters,
                categories: []
            });
        } else {
            // Если не выбрана - делаем активной одну категорию
            // Из-за особенностей API мы можем фильтровать только по одной категории
            setActiveFilters({
                ...activeFilters,
                categories: [categoryId]
            });
        }
    };

    // Обработчик изменения уровня сложности
    const handleLevelChange = (levelValue) => {
        // Проверяем, выбран ли уже этот уровень
        if (activeFilters.levels.includes(levelValue)) {
            // Если выбран - убираем из выбранных
            setActiveFilters({
                ...activeFilters,
                levels: []
            });
        } else {
            // Если не выбран - делаем активным один уровень
            // Из-за особенностей API мы можем фильтровать только по одному уровню
            setActiveFilters({
                ...activeFilters,
                levels: [levelValue]
            });
        }
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow mb-4">
            <div className="mb-4">
                <h3 className="font-semibold text-gray-800 mb-2">Категории</h3>
                <div className="flex flex-wrap gap-2">
                    {categories && categories.length > 0 ? (
                        categories.map((category) => (
                            <button
                                key={category.value}
                                onClick={() => handleCategoryChange(category.value)}
                                className={`px-3 py-1 text-sm rounded-full ${
                                    activeFilters.categories.includes(category.value)
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {category.label}
                            </button>
                        ))
                    ) : (
                        <div className="text-sm text-gray-500">Загрузка категорий...</div>
                    )}
                </div>
            </div>

            <div>
                <h3 className="font-semibold text-gray-800 mb-2">Уровень сложности</h3>
                <div className="flex flex-wrap gap-2">
                    {levels.map((level) => (
                        <button
                            key={level.value}
                            onClick={() => handleLevelChange(level.value)}
                            className={`px-3 py-1 text-sm rounded-full ${
                                activeFilters.levels.includes(level.value)
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {level.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}