import React from 'react';

export function CourseTargetAudience({ targetAudience }) {
    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Для кого этот курс</h2>
            <ul className="space-y-2">
                {targetAudience.map((item, index) => (
                    <li key={index} className="flex items-start">
                        <svg
                            className="h-5 w-5 text-blue-600 mr-2 mt-0.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                        <span className="text-gray-700">{item}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}