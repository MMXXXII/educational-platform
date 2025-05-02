import React from 'react';

// Компонент фильтрации
export function Filters({ categories, levels, setActiveFilters, activeFilters }) {
    return (
        <div className="bg-white p-4 rounded-lg shadow mb-4">
            <div className="mb-4">
                <h3 className="font-semibold text-gray-800 mb-2">Категории</h3>
                <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                        <button
                            key={category.value}
                            onClick={() => {
                                if (activeFilters.categories.includes(category.value)) {
                                    setActiveFilters({
                                        ...activeFilters,
                                        categories: activeFilters.categories.filter(c => c !== category.value)
                                    });
                                } else {
                                    setActiveFilters({
                                        ...activeFilters,
                                        categories: [...activeFilters.categories, category.value]
                                    });
                                }
                            }}
                            className={`px-3 py-1 text-sm rounded-full ${activeFilters.categories.includes(category.value)
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {category.label}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="font-semibold text-gray-800 mb-2">Уровень сложности</h3>
                <div className="flex flex-wrap gap-2">
                    {levels.map((level) => (
                        <button
                            key={level.value}
                            onClick={() => {
                                if (activeFilters.levels.includes(level.value)) {
                                    setActiveFilters({
                                        ...activeFilters,
                                        levels: activeFilters.levels.filter(l => l !== level.value)
                                    });
                                } else {
                                    setActiveFilters({
                                        ...activeFilters,
                                        levels: [...activeFilters.levels, level.value]
                                    });
                                }
                            }}
                            className={`px-3 py-1 text-sm rounded-full ${activeFilters.levels.includes(level.value)
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