export function LoadingState() {
    // Создаем массив заглушек для карточек курсов
    const skeletonCards = Array(3).fill(0);

    return (
        <div>
            <div className="flex justify-between items-center mb-6 mt-4">
                <div className="h-5 w-64 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {skeletonCards.map((_, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                        {/* Заглушка для изображения */}
                        <div className="aspect-video bg-gray-200 animate-pulse"></div>

                        <div className="p-4">
                            {/* Заглушка для категории */}
                            <div className="h-5 w-24 bg-gray-200 rounded mb-2 animate-pulse"></div>

                            {/* Заглушка для заголовка */}
                            <div className="h-6 w-full bg-gray-200 rounded mb-3 animate-pulse"></div>

                            {/* Заглушка для описания */}
                            <div className="space-y-2 mb-4">
                                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                            </div>

                            {/* Заглушка для деталей курса */}
                            <div className="flex justify-between items-center mb-3">
                                <div className="h-5 w-20 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
                            </div>

                            {/* Заглушка для кнопки */}
                            <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Заглушка для пагинации */}
            <div className="flex justify-center mt-8">
                <div className="flex space-x-2">
                    {Array(5).fill(0).map((_, index) => (
                        <div key={index} className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                    ))}
                </div>
            </div>
        </div>
    );
}