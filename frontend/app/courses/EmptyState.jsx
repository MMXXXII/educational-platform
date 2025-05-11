export function EmptyState({ resetFilters }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="mb-6">
                <svg
                    className="w-24 h-24 mx-auto text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">Курсы не найдены</h3>
            <p className="text-gray-500 mb-6">
                По указанным параметрам поиска не удалось найти курсы.
                Попробуйте изменить критерии поиска или сбросить фильтры.
            </p>
            <button
                onClick={resetFilters}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
            >
                Сбросить фильтры
            </button>
        </div>
    );
}