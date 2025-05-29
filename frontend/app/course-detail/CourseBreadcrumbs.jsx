import { Link } from 'react-router';

export function CourseBreadcrumbs({ course }) {
    return (
        <div className="mb-6">
            <nav className="flex text-sm">
                <Link to="/" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">Главная</Link>
                <span className="mx-2 text-gray-500 dark:text-gray-400">/</span>
                <Link to="/courses" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">Курсы</Link>
                <span className="mx-2 text-gray-500 dark:text-gray-400">/</span>
                <span className="text-gray-800 dark:text-gray-200 font-medium">{course.title}</span>
            </nav>
        </div>
    );
}