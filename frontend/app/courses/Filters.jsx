// Компонент фильтрации
export function Filters({ categories, difficulties, setActiveFilters, activeFilters }) {
    // Обработчик изменения категории позволяет выбирать несколько категорий
    const handleCategoryChange = (categoryId) => {
        // Проверяем, выбрана ли уже эта категория
        if (activeFilters.categories.includes(categoryId)) {
            // Если выбрана - убираем из выбранных
            setActiveFilters({
                ...activeFilters,
                categories: activeFilters.categories.filter(id => id !== categoryId)
            });
        } else {
            // Если не выбрана - добавляем к уже выбранным
            setActiveFilters({
                ...activeFilters,
                categories: [...activeFilters.categories, categoryId]
            });
        }
    };

    // Обработчик изменения уровня сложности позволяет выбирать несколько уровней
    const handleDifficultyChange = (difficultyValue) => {
        // Проверяем, выбран ли уже этот уровень сложности
        if (activeFilters.difficulties.includes(difficultyValue)) {
            // Если выбран - убираем из выбранных
            setActiveFilters({
                ...activeFilters,
                difficulties: activeFilters.difficulties.filter(diff => diff !== difficultyValue)
            });
        } else {
            // Если не выбран - добавляем к уже выбранным
            setActiveFilters({
                ...activeFilters,
                difficulties: [...activeFilters.difficulties, difficultyValue]
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
                                className={`px-3 py-1 text-sm rounded-full ${activeFilters.categories.includes(category.value)
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
                    {difficulties.map((difficulty) => (
                        <button
                            key={difficulty.value}
                            onClick={() => handleDifficultyChange(difficulty.value)}
                            className={`px-3 py-1 text-sm rounded-full ${activeFilters.difficulties.includes(difficulty.value)
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {difficulty.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}