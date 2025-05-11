import React, { useState } from 'react';
import { ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export function SyllabusAccordion({ syllabus }) {
    const [openSection, setOpenSection] = useState(0);

    return (
        <div className="mt-6">
            {syllabus.map((section, sectionIndex) => (
                <div key={sectionIndex} className="mb-3 border border-gray-200 rounded-lg overflow-hidden">
                    <button
                        className={`w-full flex justify-between items-center p-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors ${openSection === sectionIndex ? 'font-semibold text-blue-700' : 'text-gray-800'}`}
                        onClick={() => setOpenSection(openSection === sectionIndex ? -1 : sectionIndex)}
                    >
                        <div className="flex items-center">
                            <span className="mr-2">{sectionIndex + 1}.</span>
                            <span>{section.title}</span>
                            <span className="ml-3 text-sm text-gray-500">({section.lessons.length} уроков)</span>
                        </div>
                        <svg
                            className={`h-5 w-5 transform transition-transform ${openSection === sectionIndex ? 'rotate-180' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {openSection === sectionIndex && (
                        <div className="bg-white">
                            {section.lessons.map((lesson, lessonIndex) => (
                                <div
                                    key={lessonIndex}
                                    className={`p-4 border-t border-gray-200 flex justify-between ${lesson.isUnlocked ? 'opacity-100' : 'opacity-70'}`}
                                >
                                    <div className="flex items-start">
                                        <div className={`flex-shrink-0 mt-0.5 ${lesson.isUnlocked ? 'text-blue-600' : 'text-gray-400'}`}>
                                            {lesson.isUnlocked ? (
                                                <CheckCircleIcon className="h-5 w-5" />
                                            ) : (
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                                    />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-gray-800">{lesson.title}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center ml-4 text-sm text-gray-500">
                                        <ClockIcon className="h-4 w-4 mr-1" />
                                        <span>{lesson.duration}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}