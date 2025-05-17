import { useState } from 'react';
import { coursesApi } from '../api/coursesService';

export function CourseSidebar({ course }) {
    const [enrolling, setEnrolling] = useState(false);
    const [enrolled, setEnrolled] = useState(false);
    const [error, setError] = useState(null);

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
        
        if (course.level) {
            const level = course.level.toLowerCase();
            if (level.includes('начинающий')) lessonDuration = 20;
            else if (level.includes('средний')) lessonDuration = 30;
            else if (level.includes('продвинутый')) lessonDuration = 45;
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
        } catch (err) {
            console.error('Failed to enroll:', err);
            if (err.message && err.message.includes('авторизация')) {
                setError('Требуется авторизация для записи на курс');
            } else {
                setError('Не удалось записаться на курс');
            }
        } finally {
            setEnrolling(false);
        }
    };

    return (
        <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-blue-600 mb-2">Бесплатно</div>
                    <p className="text-gray-500">Начните обучение уже сегодня</p>
                </div>

                <button 
                    className={`w-full py-3 ${enrolled ? 'bg-green-600' : 'bg-blue-600'} text-white font-semibold rounded-lg hover:${enrolled ? 'bg-green-700' : 'bg-blue-700'} transition-colors mb-4 ${enrolling ? 'opacity-70 cursor-not-allowed' : ''}`}
                    onClick={handleEnroll}
                    disabled={enrolling || enrolled}
                >
                    {enrolling ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Запись...
                        </span>
                    ) : enrolled ? (
                        'Вы записаны на курс'
                    ) : (
                        'Начать прохождение'
                    )}
                </button>

                {error && (
                    <div className="text-red-500 text-sm mb-4 text-center">
                        {error}
                    </div>
                )}

                <div className="space-y-4 mb-2">
                    <div className="flex items-center">
                        <svg className="h-5 w-5 text-blue-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <span className="text-gray-700">{duration}</span>
                    </div>
                    <div className="flex items-center">
                        <svg className="h-5 w-5 text-blue-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                        </svg>
                        <span className="text-gray-700">{lessonsCount} уроков</span>
                    </div>
                </div>
            </div>
        </div>
    );
}