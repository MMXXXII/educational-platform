import React from 'react';
import { LightBulbIcon, PuzzlePieceIcon } from '@heroicons/react/24/outline';

export function DetailedFeaturesSection() {
    const features = [
        {
            title: 'Интерактивные задания',
            description: 'Наша платформа предлагает увлекательные интерактивные задания, которые помогут вашему ребенку освоить базовые принципы программирования в игровой форме. Дети получают мгновенную обратную связь и видят результаты своей работы сразу, что стимулирует интерес к обучению.',
            icon: <LightBulbIcon className="h-10 w-10 sm:h-12 sm:w-12 text-yellow-500 dark:text-yellow-400" />,
            imagePosition: 'right'
        },
        {
            title: 'Создание собственных курсов',
            description: 'Преподаватели и родители могут создавать собственные образовательные курсы, адаптированные под конкретные потребности. Платформа предоставляет простые и интуитивно понятные инструменты для создания заданий различной сложности, от простых алгоритмов до сложных проектов.',
            icon: <PuzzlePieceIcon className="h-10 w-10 sm:h-12 sm:w-12 text-green-500 dark:text-green-400" />,
            imagePosition: 'left'
        }
    ];

    return (
        <section className="py-12 bg-gray-50 dark:bg-slate-800">
            <div className="container mx-auto px-4 sm:px-6">
                <h3 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 dark:text-white mb-8 sm:mb-12">
                    Ключевые возможности
                </h3>

                <div className="space-y-12 sm:space-y-16">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className={`flex flex-col md:flex-row ${feature.imagePosition === 'right' ? 'md:flex-row' : 'md:flex-row-reverse'} gap-6 sm:gap-8 items-center`}
                        >
                            <div className="flex-1">
                                <div className="flex items-center mb-4 justify-center md:justify-start">
                                    {feature.icon}
                                    <h4 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-white ml-4">{feature.title}</h4>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg text-center md:text-left">{feature.description}</p>
                            </div>
                            <div className="flex-1 flex justify-center w-full md:w-auto">
                                <div className="bg-gray-200 dark:bg-slate-700 w-full aspect-video rounded-lg flex items-center justify-center">
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">Изображение будет добавлено позже</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}