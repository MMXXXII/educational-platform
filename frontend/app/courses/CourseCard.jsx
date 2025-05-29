import { Link } from 'react-router';
import { UsersIcon } from '@heroicons/react/24/outline';
import { CourseImagePlaceholder } from '../common';

export function CourseCard({ course }) {
    const formatDifficulty = (difficulty) => {
        return difficulty ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1) : '';
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg dark:hover:shadow-gray-700/50 transition-shadow duration-300">
            <div className="h-40 bg-gray-200 dark:bg-gray-700 relative">
                <CourseImagePlaceholder course={course} />
                <div className="absolute top-2 right-2 bg-blue-600 dark:bg-blue-500 text-white dark:text-gray-100 text-xs px-2 py-1 rounded-full">
                    {formatDifficulty(course.difficulty)}
                </div>
            </div>

            <div className="p-4">
                <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-2 line-clamp-2">{course.title}</h3>
                <div className="h-10 mb-3">
                    <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">{course.description}</p>
                </div>

                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <span>Автор: {course.author}</span>
                    <span className="mx-2">•</span>
                    <span>{course.lessons_count || 0} уроков</span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <UsersIcon className="h-4 w-4 mr-1" />
                        {course.students_count || 0} учеников
                    </div>

                    <Link
                        to={`/courses/${course.id}`}
                        className="px-3 py-1 bg-blue-600 dark:bg-blue-500 text-white dark:text-gray-100 text-sm font-medium rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                    >
                        Подробнее
                    </Link>
                </div>
            </div>
        </div>
    );
}