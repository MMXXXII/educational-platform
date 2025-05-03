import React from 'react';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

export function SearchBar({ searchQuery, setSearchQuery, showFilters, setShowFilters }) {
    return (
        <div className="bg-white p-4 rounded-lg shadow mb-4">
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder="Поиск курсов..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>

                {/* Кнопка для мобильных фильтров */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="md:hidden flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
                    Фильтры
                </button>
            </div>
        </div>
    );
}