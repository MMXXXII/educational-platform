export function Pagination({ currentPage, totalPages, onPageChange }) {
    // Если страница всего одна, не показываем пагинацию
    if (totalPages <= 1) {
        return null;
    }

    // Создаем массив номеров страниц для отображения
    const getPageNumbers = () => {
        const pageNumbers = [];

        // Определяем количество кнопок для показа (не более 5)
        const maxPagesToShow = 5;

        // Начальная страница для отображения
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));

        // Конечная страница для отображения
        let endPage = startPage + maxPagesToShow - 1;

        // Если конечная страница больше общего количества, корректируем
        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        // Заполняем массив номерами страниц
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return pageNumbers;
    };

    return (
        <div className="flex justify-center items-center mt-8 space-x-1">
            {/* Кнопка "Назад" */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded ${currentPage === 1
                    ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                    : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700'
                    }`}
            >
                &laquo;
            </button>

            {/* Кнопка на первую страницу (если текущая не 1 и не 2) */}
            {currentPage > 3 && (
                <>
                    <button
                        onClick={() => onPageChange(1)}
                        className="px-3 py-1 rounded hover:bg-blue-50 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400"
                    >
                        1
                    </button>
                    {currentPage > 4 && (
                        <span className="px-2 py-1 text-gray-500 dark:text-gray-400">...</span>
                    )}
                </>
            )}

            {/* Номера страниц */}
            {getPageNumbers().map(number => (
                <button
                    key={number}
                    onClick={() => onPageChange(number)}
                    className={`px-3 py-1 rounded ${currentPage === number
                        ? 'bg-blue-600 text-white dark:bg-blue-500 dark:text-gray-100'
                        : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700'
                        }`}
                >
                    {number}
                </button>
            ))}

            {/* Многоточие и кнопка на последнюю страницу */}
            {currentPage < totalPages - 2 && (
                <>
                    {currentPage < totalPages - 3 && (
                        <span className="px-2 py-1 text-gray-500 dark:text-gray-400">...</span>
                    )}
                    <button
                        onClick={() => onPageChange(totalPages)}
                        className="px-3 py-1 rounded hover:bg-blue-50 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400"
                    >
                        {totalPages}
                    </button>
                </>
            )}

            {/* Кнопка "Вперед" */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded ${currentPage === totalPages
                    ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                    : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700'
                    }`}
            >
                &raquo;
            </button>
        </div>
    );
}