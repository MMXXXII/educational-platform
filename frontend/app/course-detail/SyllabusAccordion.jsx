import { useState } from 'react';
import { EyeIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

export function SyllabusAccordion({ lessons }) {
    const [activeLesson, setActiveLesson] = useState(null);

    // Если нет уроков, выводим сообщение
    if (!lessons || lessons.length === 0) {
        return (
            <div className="text-center py-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400">Для этого курса пока нет доступных уроков</p>
            </div>
        );
    }

    // Проверяем, имеет ли урок интерактивную сцену
    const hasInteractiveScene = (lesson) => {
        return lesson.scene_data && lesson.scene_data !== 'null';
    };

    return (
        <div className="mt-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Программа курса</h2>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {lessons.map((lesson, index) => (
                    <div key={lesson.id || index} className={`border-b border-gray-200 dark:border-gray-700 ${index === lessons.length - 1 ? 'border-b-0' : ''}`}>
                        <div
                            onClick={() => setActiveLesson(activeLesson === index ? null : index)}
                            className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${activeLesson === index
                                    ? 'bg-blue-50 dark:bg-blue-900/30'
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                        >
                            <div className="flex items-center space-x-3">
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${activeLesson === index
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                                    }`}>
                                    {index + 1}
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900 dark:text-gray-100">{lesson.title}</h3>
                                    {hasInteractiveScene(lesson) && (
                                        <span className="inline-flex items-center mt-1 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-full">
                                            <EyeIcon className="w-3 h-3 mr-1" />
                                            Интерактивный
                                        </span>
                                    )}
                                </div>
                            </div>
                            <ChevronDownIcon
                                className={`h-5 w-5 text-gray-500 dark:text-gray-400 transform transition-transform ${activeLesson === index ? 'rotate-180' : ''}`}
                            />
                        </div>

                        {activeLesson === index && (
                            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                                <div className="prose dark:prose-invert max-w-none">
                                    <>
                                        <div
                                            className="max-h-32 overflow-hidden relative"
                                            style={{
                                                maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
                                                WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)'
                                            }}
                                        >
                                            <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
                                        </div>
                                    </>

                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}