import React from 'react';
import { UserIcon, ClockIcon, ChartBarIcon } from '@heroicons/react/24/outline';

export function CourseInfo({ course }) {
    return (
        <>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">{course.title}</h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm mb-4">
                <div className="flex items-center text-gray-500">
                    <UserIcon className="h-4 w-4 mr-1" />
                    <span>{course.students} учеников</span>
                </div>
                <div className="flex items-center text-gray-500">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    <span>{course.duration}</span>
                </div>
                <div className="flex items-center text-gray-500">
                    <ChartBarIcon className="h-4 w-4 mr-1" />
                    <span>Уровень: {course.level}</span>
                </div>
                {course.rating && (
                    <div className="flex items-center text-amber-500">
                        <div className="flex">
                            {[...Array(5)].map((_, i) => (
                                <svg
                                    key={i}
                                    className={`h-4 w-4 ${i < Math.floor(course.rating) ? 'text-amber-500' : 'text-gray-300'}`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 15.585l-7.07 3.716 1.35-7.87L.36 6.64l7.895-1.15L10 0l2.745 5.49 7.895 1.15-6.92 4.79 1.35 7.87L10 15.585z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            ))}
                        </div>
                        <span className="ml-1">{course.rating}</span>
                        <span className="ml-1 text-gray-500">({course.reviews} отзывов)</span>
                    </div>
                )}
            </div>
        </>
    );
}