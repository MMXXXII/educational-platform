import React from 'react';

export function EmptyState({ resetFilters }) {
    return (
        <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">Курсы не найдены</h3>
            <p className="text-gray-600">Попробуйте изменить параметры поиска или фильтрации</p>
            <button
                onClick={resetFilters}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
                Сбросить фильтры
            </button>
        </div>
    );
}