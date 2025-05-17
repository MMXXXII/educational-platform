import { useState } from 'react';

export function SyllabusAccordion({ lessons }) {
    const [openLesson, setOpenLesson] = useState(null);

    // If no lessons, display a message
    if (!lessons || lessons.length === 0) {
        return (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Для этого курса пока нет доступных уроков</p>
            </div>
        );
    }

    return (
        <div className="mt-6">
            {lessons.map((lesson, index) => (
                <div key={lesson.id || index} className="mb-3 border border-gray-200 rounded-lg overflow-hidden">
                    <button
                        className={`w-full flex justify-between items-center p-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors ${openLesson === index ? 'font-semibold text-blue-700' : 'text-gray-800'}`}
                        onClick={() => setOpenLesson(openLesson === index ? null : index)}
                    >
                        <div className="flex items-center">
                            <span className="mr-2">{index + 1}.</span>
                            <span>{lesson.title}</span>
                        </div>
                        <svg
                            className={`h-5 w-5 transform transition-transform ${openLesson === index ? 'rotate-180' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {openLesson === index && (
                        <div className="bg-white p-4 border-t border-gray-200">
                            {lesson.content(
                                <div className="prose max-w-none">
                                    <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
                                </div>
                            )}

                            {lesson.order && (
                                <div className="mt-3 text-sm text-gray-500">
                                    <span className="font-medium">Урок {lesson.order}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}