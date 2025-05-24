import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { AcademicCapIcon, PencilSquareIcon, TrashIcon, PlayIcon, PlusIcon } from '@heroicons/react/24/outline';
import { coursesApi } from '../api/coursesService';
import { useAuth } from '../contexts/AuthContext';
import { LoadingState } from '../courses/LoadingState';
import { Pagination } from '../courses/Pagination';

export function MyCoursesPage() {
    const { hasRole } = useAuth();
    const [activeTab, setActiveTab] = useState('enrolled'); // 'enrolled' или 'created'
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [createdCourses, setCreatedCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Состояния пагинации для записанных курсов
    const [enrolledPage, setEnrolledPage] = useState(1);
    const [enrolledTotalPages, setEnrolledTotalPages] = useState(1);
    const [enrolledTotal, setEnrolledTotal] = useState(0);
    const [enrolledPageSize, setEnrolledPageSize] = useState(12);
    
    // Состояния пагинации для созданных курсов
    const [createdPage, setCreatedPage] = useState(1);
    const [createdTotalPages, setCreatedTotalPages] = useState(1);
    const [createdTotal, setCreatedTotal] = useState(0);
    const [createdPageSize, setCreatedPageSize] = useState(12);
    
    const isTeacherOrAdmin = hasRole(['admin', 'teacher']);

    // Загрузка курсов, на которые записан пользователь
    useEffect(() => {
        const fetchEnrolledCourses = async () => {
            try {
                setLoading(true);
                const data = await coursesApi.getMyCourses(enrolledPage, enrolledPageSize);
                setEnrolledCourses(data.items || []);
                setEnrolledTotal(data.total || 0);
                setEnrolledTotalPages(data.pages || 1);
            } catch (err) {
                console.error('Failed to fetch enrolled courses:', err);
                setError('Не удалось загрузить курсы');
            } finally {
                setLoading(false);
            }
        };

        fetchEnrolledCourses();
    }, [enrolledPage, enrolledPageSize]);

    // Загрузка созданных курсов (только для учителей и админов)
    useEffect(() => {
        if (!isTeacherOrAdmin) return;

        const fetchCreatedCourses = async () => {
            try {
                // Устанавливаем loading только если это вкладка created
                if (activeTab === 'created') {
                    setLoading(true);
                }
                const data = await coursesApi.getMyCreatedCourses(createdPage, createdPageSize);
                setCreatedCourses(data.items || []);
                setCreatedTotal(data.total || 0);
                setCreatedTotalPages(data.pages || 1);
            } catch (err) {
                console.error('Failed to fetch created courses:', err);
                if (activeTab === 'created') {
                    setError('Не удалось загрузить созданные курсы');
                }
            } finally {
                if (activeTab === 'created') {
                    setLoading(false);
                }
            }
        };

        fetchCreatedCourses();
    }, [createdPage, createdPageSize, isTeacherOrAdmin]);

    // Обработчик удаления курса
    const handleDeleteCourse = async (courseId, courseTitle) => {
        if (!window.confirm(`Вы уверены, что хотите удалить курс "${courseTitle}"?`)) {
            return;
        }

        try {
            await coursesApi.deleteCourse(courseId);
            // Обновляем список после удаления
            const updatedCourses = createdCourses.filter(course => course.id !== courseId);
            setCreatedCourses(updatedCourses);
            setCreatedTotal(prev => prev - 1);
        } catch (err) {
            console.error('Failed to delete course:', err);
            alert('Не удалось удалить курс');
        }
    };

    // Обработчик изменения размера страницы для записанных курсов
    const handleEnrolledPageSizeChange = (e) => {
        const newSize = parseInt(e.target.value);
        setEnrolledPageSize(newSize);
        setEnrolledPage(1); // Сбрасываем на первую страницу
    };

    // Обработчик изменения размера страницы для созданных курсов
    const handleCreatedPageSizeChange = (e) => {
        const newSize = parseInt(e.target.value);
        setCreatedPageSize(newSize);
        setCreatedPage(1); // Сбрасываем на первую страницу
    };

    // Компонент прогресс-бара
    const ProgressBar = ({ progress }) => (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress || 0}%` }}
            />
        </div>
    );

    // Компонент карточки курса для изучаемых курсов
    const EnrolledCourseCard = ({ course }) => {
        // Получаем прогресс из enrollments, если есть
        const enrollment = course.enrollments && course.enrollments.length > 0 
            ? course.enrollments[0] 
            : null;
        const progress = enrollment ? enrollment.progress : 0;
        const isCompleted = enrollment ? enrollment.completed : false;

        return (
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                            {course.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {course.description}
                        </p>
                        <div className="flex items-center text-sm text-gray-500 mb-3">
                            <span>Автор: {course.author}</span>
                            <span className="mx-2">•</span>
                            <span>{course.lessons_count || 0} уроков</span>
                        </div>
                        
                        {/* Прогресс-бар */}
                        <div className="mb-2">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-gray-600">Прогресс</span>
                                <span className="text-xs font-medium text-gray-700">{Math.round(progress)}%</span>
                            </div>
                            <ProgressBar progress={progress} />
                        </div>
                        
                        {isCompleted && (
                            <div className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                ✓ Завершено
                            </div>
                        )}
                    </div>
                    <AcademicCapIcon className="h-8 w-8 text-blue-500 flex-shrink-0 ml-4" />
                </div>
                
                <div className="flex items-center justify-between">
                    <Link
                        to={`/courses/${course.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                        Подробнее о курсе
                    </Link>
                    <Link
                        to={`/node-editor`}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <PlayIcon className="h-4 w-4 mr-2" />
                        {progress > 0 ? 'Продолжить' : 'Начать'}
                    </Link>
                </div>
            </div>
        );
    };

    // Компонент карточки курса для созданных курсов
    const CreatedCourseCard = ({ course }) => (
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                        {course.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {course.description}
                    </p>
                    <div className="flex items-center text-sm text-gray-500">
                        <span>{course.students_count || 0} студентов</span>
                        <span className="mx-2">•</span>
                        <span>{course.lessons_count || 0} уроков</span>
                    </div>
                </div>
                <PencilSquareIcon className="h-8 w-8 text-green-500 flex-shrink-0 ml-4" />
            </div>
            
            <div className="flex items-center justify-between">
                <Link
                    to={`/courses/${course.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                    Просмотреть
                </Link>
                <div className="flex space-x-2">
                    <button
                        className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        title="Редактировать курс"
                    >
                        <PencilSquareIcon className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => handleDeleteCourse(course.id, course.title)}
                        className="flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        title="Удалить курс"
                    >
                        <TrashIcon className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );

    // Компонент выбора количества элементов на странице
    const PageSizeSelector = ({ pageSize, onChange, currentPage, totalItems }) => {
        const startItem = (currentPage - 1) * pageSize + 1;
        const endItem = Math.min(currentPage * pageSize, totalItems);
        
        return (
            <div className="flex justify-between items-center mb-6 text-sm text-gray-600">
                <div>
                    {totalItems > 0 && `Показано ${startItem} - ${endItem} из ${totalItems} курсов`}
                </div>
                <div className="flex items-center">
                    <label htmlFor="pageSize" className="mr-2">На странице:</label>
                    <select
                        id="pageSize"
                        value={pageSize}
                        onChange={onChange}
                        className="border rounded px-2 py-1 text-sm"
                    >
                        <option value="6">6</option>
                        <option value="12">12</option>
                        <option value="24">24</option>
                        <option value="48">48</option>
                    </select>
                </div>
            </div>
        );
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Мои курсы</h1>
                <p className="text-gray-600">
                    {isTeacherOrAdmin 
                        ? 'Управляйте своими курсами и продолжайте обучение'
                        : 'Продолжайте обучение с того места, где остановились'}
                </p>
            </div>

            {/* Вкладки */}
            {isTeacherOrAdmin && (
                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('enrolled')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'enrolled'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Изучаемые курсы ({enrolledTotal})
                        </button>
                        <button
                            onClick={() => setActiveTab('created')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'created'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Созданные курсы ({createdTotal})
                        </button>
                    </nav>
                </div>
            )}

            {/* Контент вкладок */}
            {loading ? (
                <LoadingState />
            ) : error ? (
                <div className="text-center py-8">
                    <p className="text-red-600">{error}</p>
                </div>
            ) : (
                <>
                    {activeTab === 'enrolled' && (
                        <>
                            {enrolledCourses.length === 0 ? (
                                <div className="text-center py-12">
                                    <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        Вы еще не записаны ни на один курс
                                    </h3>
                                    <p className="text-gray-500 mb-4">
                                        Начните свое обучение прямо сейчас
                                    </p>
                                    <Link
                                        to="/courses"
                                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Перейти к каталогу курсов
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    <PageSizeSelector 
                                        pageSize={enrolledPageSize}
                                        onChange={handleEnrolledPageSizeChange}
                                        currentPage={enrolledPage}
                                        totalItems={enrolledTotal}
                                    />
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                        {enrolledCourses.map(course => (
                                            <EnrolledCourseCard key={course.id} course={course} />
                                        ))}
                                    </div>
                                    <Pagination
                                        currentPage={enrolledPage}
                                        totalPages={enrolledTotalPages}
                                        onPageChange={setEnrolledPage}
                                    />
                                </>
                            )}
                        </>
                    )}

                    {activeTab === 'created' && isTeacherOrAdmin && (
                        <>
                            {createdCourses.length === 0 ? (
                                <div className="text-center py-12">
                                    <PencilSquareIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        Вы еще не создали ни одного курса
                                    </h3>
                                    <p className="text-gray-500 mb-4">
                                        Создайте свой первый курс и поделитесь знаниями
                                    </p>
                                    <Link
                                        to="/create-course"
                                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        <PlusIcon className="h-5 w-5 mr-2" />
                                        Создать курс
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    <PageSizeSelector 
                                        pageSize={createdPageSize}
                                        onChange={handleCreatedPageSizeChange}
                                        currentPage={createdPage}
                                        totalItems={createdTotal}
                                    />
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                        {createdCourses.map(course => (
                                            <CreatedCourseCard key={course.id} course={course} />
                                        ))}
                                    </div>
                                    <Pagination
                                        currentPage={createdPage}
                                        totalPages={createdTotalPages}
                                        onPageChange={setCreatedPage}
                                    />
                                </>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    );
}