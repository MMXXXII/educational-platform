import { Link } from 'react-router';

export function CourseBreadcrumbs({ course }) {
    return (
        <div className="mb-6">
            <nav className="flex text-sm">
                <Link to="/" className="text-gray-500 hover:text-blue-600">Главная</Link>
                <span className="mx-2 text-gray-500">/</span>
                <Link to="/courses" className="text-gray-500 hover:text-blue-600">Курсы</Link>
                <span className="mx-2 text-gray-500">/</span>
                <span className="text-gray-800 font-medium">{course.title}</span>
            </nav>
        </div>
    );
}