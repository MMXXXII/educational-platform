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
            </div>
        </>
    );
}