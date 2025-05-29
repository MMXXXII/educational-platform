import React from 'react';
import { CodeBracketIcon, AcademicCapIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';

export function FeaturesSection() {
    const features = [
        {
            title: 'Интерактивное обучение',
            description: 'Практические задания и проекты для лучшего усвоения материала',
            icon: <CodeBracketIcon className="h-10 w-10 sm:h-12 sm:w-12 text-blue-500 dark:text-blue-400" />
        },
        {
            title: 'Создание курсов',
            description: 'Возможность создавать собственные курсы и делиться ими',
            icon: <AcademicCapIcon className="h-10 w-10 sm:h-12 sm:w-12 text-blue-500 dark:text-blue-400" />
        },
        {
            title: 'Для всех возрастов',
            description: 'Подходит для детей и подростков любого уровня подготовки',
            icon: <RocketLaunchIcon className="h-10 w-10 sm:h-12 sm:w-12 text-blue-500 dark:text-blue-400" />
        }
    ];

    return (
        <section className="py-12 sm:py-16 bg-white dark:bg-slate-900">
            <div className="container mx-auto px-4 sm:px-6">
                <h3 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 dark:text-white mb-8 sm:mb-12">
                    Почему стоит выбрать нас
                </h3>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="bg-gray-50 dark:bg-slate-800 p-5 sm:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex justify-center mb-4">{feature.icon}</div>
                            <h4 className="text-lg sm:text-xl font-semibold text-center text-gray-800 dark:text-white mb-2">{feature.title}</h4>
                            <p className="text-gray-600 dark:text-gray-300 text-center text-sm sm:text-base">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}