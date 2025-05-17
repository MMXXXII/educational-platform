import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

// Импорт компонентов
import { CourseBreadcrumbs } from './CourseBreadcrumbs';
import { CourseImage } from './CourseImage';
import { CourseInfo } from './CourseInfo';
import { CourseDescription } from './CourseDescription';
import { SyllabusAccordion } from './SyllabusAccordion';
import { CourseSidebar } from './CourseSidebar';

// Импорт API сервиса
import { coursesApi } from '../api/coursesService';

export function CourseDetailPage({ courseId }) {
    const { id } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Используем ID из пропсов или из параметров URL
    const currentCourseId = courseId || id;

    // Запрос к API для получения данных о курсе
    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                setLoading(true);
                
                // Получение основной информации о курсе
                const courseData = await coursesApi.getCourseById(currentCourseId);
                
                // Получение курса с уроками если они есть
                try {
                    const courseWithLessons = await coursesApi.getCourseWithLessons(currentCourseId);
                    // Если успешно получили детальную информацию с уроками, используем её
                    setCourse({
                        ...courseWithLessons,
                        // Сохраняем уроки для отображения в SyllabusAccordion
                        lessons: courseWithLessons.lessons || []
                    });
                } catch (lessonsError) {
                    // Если не удалось получить уроки, используем базовую информацию о курсе
                    console.warn('Failed to load lessons for the course:', lessonsError);
                    setCourse({
                        ...courseData,
                        lessons: [] // Пустой массив уроков
                    });
                }
                
                setError(null);
            } catch (err) {
                console.error('Error fetching course data:', err);
                setError('Не удалось загрузить информацию о курсе');
            } finally {
                setLoading(false);
            }
        };

        if (currentCourseId) {
            fetchCourseData();
        }
    }, [currentCourseId]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 sm:px-6 py-16 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="container mx-auto px-4 sm:px-6 py-16 text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Курс не найден</h2>
                <p className="text-gray-600 mb-6">{error || "К сожалению, запрашиваемый курс не существует или был удален"}</p>
                <Link
                    to="/courses"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <ArrowLeftIcon className="h-5 w-5 mr-2" />
                    Вернуться к списку курсов
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 py-8">
            {/* Навигационные хлебные крошки */}
            <CourseBreadcrumbs course={course} />

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Основная информация о курсе */}
                <div className="lg:w-2/3">
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        {/* Обложка курса */}
                        <CourseImage course={course} />

                        {/* Информация о курсе */}
                        <div className="p-6">
                            <CourseInfo course={course} />

                            <div className="mt-4 mb-6">
                                <p className="text-gray-700">{course.description}</p>
                            </div>

                            <CourseDescription course={course} />

                            {course.lessons && (
                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-gray-800 mb-3">Учебный план</h2>
                                    <SyllabusAccordion lessons={course.lessons} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Сайдбар с информацией о записи на курс */}
                <CourseSidebar course={course} />
            </div>
        </div>
    );
}