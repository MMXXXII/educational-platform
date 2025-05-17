import { UserIcon, ClockIcon, ChartBarIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

export function CourseInfo({ course }) {
    // Получаем количество студентов (в API оно может быть в разных свойствах)
    const studentCount = course.students_count ||
        course.total_enrollments ||
        course.enrollments_count ||
        (course.students !== undefined ? course.students : 0);

    // Определяем автора курса
    const author = course.author || 'Автор не указан';

    return (
        <>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">{course.title}</h1>

            {/* Author */}
            <div className="flex items-center mb-3">
                <AcademicCapIcon className="h-5 w-5 text-gray-600 mr-2" />
                <span className="text-gray-600">{author}</span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm mb-4">
                <div className="flex items-center text-gray-500">
                    <UserIcon className="h-4 w-4 mr-1" />
                    <span>{studentCount} учеников</span>
                </div>
                <div className="flex items-center text-gray-500">
                    <ChartBarIcon className="h-4 w-4 mr-1" />
                    <span>Уровень: {course.level}</span>
                </div>
            </div>
        </>
    );
}