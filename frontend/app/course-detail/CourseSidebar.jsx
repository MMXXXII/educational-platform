import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { coursesApi } from '../api/coursesService';
import { ClockIcon, ClipboardIcon, TagIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export function CourseSidebar({ course }) {
    const [enrolling, setEnrolling] = useState(false);
    const [enrolled, setEnrolled] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    // Проверяем, записан ли пользователь на курс при загрузке компонента
    useEffect(() => {
        const checkEnrollmentStatus = async () => {
            try {
                setLoading(true);
                const enrollments = await coursesApi.getUserEnrollments();
                const isEnrolled = enrollments?.some(enrollment =>
                    enrollment.course_id === course.id || enrollment.course?.id === course.id
                );
                setEnrolled(isEnrolled);
            } catch (err) {
                console.error('Failed to check enrollment status:', err);
            } finally {
                setLoading(false);
            }
        };

        checkEnrollmentStatus();
    }, [course.id]);

    // Получение категорий курса
    const categories = course.categories && Array.isArray(course.categories)
        ? course.categories.map(cat => cat.name || cat).join(', ')
        : course.category || 'Без категории';

    // Определяем количество уроков из API
    const lessonsCount = course.lessons_count ||
        (course.lessons && Array.isArray(course.lessons) ? course.lessons.length : 0);

    // Рассчитываем примерную длительность на основе количества уроков и сложности
    const calculateDuration = () => {
        if (!lessonsCount) {
            return 'Длительность не указана';
        }

        // Средняя длительность урока в зависимости от уровня сложности
        let lessonDuration = 30; // в минутах по умолчанию

        if (course.difficulty) {
            const difficulty = course.difficulty.toLowerCase();
            if (difficulty.includes('начинающий')) lessonDuration = 20;
            else if (difficulty.includes('средний')) lessonDuration = 30;
            else if (difficulty.includes('продвинутый')) lessonDuration = 45;
        }

        const totalMinutes = lessonsCount * lessonDuration;

        if (totalMinutes < 60) {
            return `${totalMinutes} минут`;
        }

        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        if (hours < 24) {
            return `${hours} ${getHoursWord(hours)}` + (minutes > 0 ? ` ${minutes} мин.` : '');
        }

        const days = Math.round(totalMinutes / (60 * 24));
        return `около ${days} ${getDaysWord(days)}`;
    };

    // Вспомогательная функция для склонения слова "час"
    const getHoursWord = (hours) => {
        if (hours % 10 === 1 && hours % 100 !== 11) return 'час';
        if ([2, 3, 4].includes(hours % 10) && ![12, 13, 14].includes(hours % 100)) return 'часа';
        return 'часов';
    };

    // Вспомогательная функция для склонения слова "день"
    const getDaysWord = (days) => {
        if (days % 10 === 1 && days % 100 !== 11) return 'день';
        if ([2, 3, 4].includes(days % 10) && ![12, 13, 14].includes(days % 100)) return 'дня';
        return 'дней';
    };

    // Определяем продолжительность курса
    const duration = course.duration || calculateDuration();

    // Функция для записи на курс
    const handleEnroll = async () => {
        try {
            setEnrolling(true);
            await coursesApi.enrollInCourse(course.id);
            setEnrolled(true);
            setError(null);
            // Перенаправляем пользователя на страницу прохождения после успешной записи
            window.location.href = `/node-editor`;
        } catch (err) {
            console.error('Failed to enroll:', err);
            // Если ошибка содержит сообщение о том, что пользователь уже записан
            if (err.message && err.message.includes('уже записаны')) {
                setEnrolled(true);
                setError(null);
                // Перенаправляем пользователя на страницу прохождения если он уже записан
                window.location.href = `/node-editor`;
            } else if (err.message && err.message.includes('авторизация')) {
                setError('Требуется авторизация для записи на курс');
            } else {
                setError('Не удалось записаться на курс');
            }
        } finally {
            setEnrolling(false);
        }
    };

    // Получаем текст кнопки в зависимости от статуса
    const getButtonText = () => {
        if (enrolling) {
            return (
                <span className="flex items-center justify-center">
                    <ArrowPathIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Запись...
                </span>
            );
        } else if (enrolled) {
            return 'Продолжить';
        } else {
            return 'Начать прохождение';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <div className="text-center mb-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">Бесплатно</div>
                <p className="text-gray-500">Начните обучение уже сегодня</p>
            </div>

            {loading ? (
                <button
                    className="w-full py-3 bg-gray-400 text-white font-semibold rounded-lg cursor-not-allowed mb-4"
                    disabled
                >
                    <span className="flex items-center justify-center">
                        <ArrowPathIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                        Загрузка...
                    </span>
                </button>
            ) : enrolled ? (
                <Link
                    to={`/node-editor`}
                    className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors mb-4 inline-block text-center"
                >
                    {getButtonText()}
                </Link>
            ) : (
                <button
                    className={`w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors mb-4 ${enrolling ? 'opacity-70 cursor-not-allowed' : ''}`}
                    onClick={handleEnroll}
                    disabled={enrolling}
                >
                    {getButtonText()}
                </button>
            )}

            {error && (
                <div className="text-red-500 text-sm mb-4 text-center">
                    {error}
                </div>
            )}

            <div className="space-y-4 mb-2">
                <div className="flex items-center">
                    <ClockIcon className="h-5 w-5 text-blue-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" />
                    <span className="text-gray-700">{duration}</span>
                </div>
                <div className="flex items-center">
                    <ClipboardIcon className="h-5 w-5 text-blue-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" />
                    <span className="text-gray-700">{lessonsCount} уроков</span>
                </div>

                {/* Катеогории */}
                <div className="flex items-center">
                    <TagIcon className="h-5 w-5 text-blue-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" />
                    <span className="text-gray-700">{categories}</span>
                </div>
            </div>
        </div>
    );
}