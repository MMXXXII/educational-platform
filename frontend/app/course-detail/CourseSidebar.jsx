import React from 'react';
import { CourseAuthorInfo } from './CourseAuthorInfo';

export function CourseSidebar({ course }) {
    return (
        <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-blue-600 mb-2">Бесплатно</div>
                    <p className="text-gray-500">Начните обучение уже сегодня</p>
                </div>

                <button className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors mb-4">
                    Записаться на курс
                </button>

                <div className="space-y-4 mb-6">
                    <div className="flex items-center">
                        <svg className="h-5 w-5 text-blue-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <span className="text-gray-700">{course.duration} длительность</span>
                    </div>
                    <div className="flex items-center">
                        <svg className="h-5 w-5 text-blue-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                        </svg>
                        <span className="text-gray-700">{course.lessons} уроков</span>
                    </div>
                    <div className="flex items-center">
                        <svg className="h-5 w-5 text-blue-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                            />
                        </svg>
                        <span className="text-gray-700">Доступ навсегда</span>
                    </div>
                    <div className="flex items-center">
                        <svg className="h-5 w-5 text-blue-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                        <span className="text-gray-700">Сертификат по окончании</span>
                    </div>
                </div>

                {/* Информация об авторе */}
                <div className="border-t border-gray-200 pt-6">
                    <CourseAuthorInfo author={course.author} authorBio={course.authorBio} />
                </div>
            </div>
        </div>
    );
}