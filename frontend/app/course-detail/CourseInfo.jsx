import { UserIcon, ClockIcon, ChartBarIcon, AcademicCapIcon, TagIcon } from '@heroicons/react/24/outline';

export function CourseInfo({ course }) {
    // Получаем количество студентов (в API оно может быть в разных свойствах)
    const studentCount = course.students_count || 
                        course.total_enrollments || 
                        course.enrollments_count || 
                        (course.students !== undefined ? course.students : 0);
    
    // Получение категорий курса
    const categories = course.categories && Array.isArray(course.categories)
        ? course.categories.map(cat => cat.name || cat).join(', ')
        : course.category || 'Без категории';

    // Определяем автора курса
    const author = course.author || 'Автор не указан';
    
    // Рассчитываем примерную длительность на основе количества уроков и сложности
    const calculateDuration = () => {
        if (!course.lessons_count && (!course.lessons || !course.lessons.length)) {
            return 'Длительность не указана';
        }
        
        const count = course.lessons_count || 
            (Array.isArray(course.lessons) ? course.lessons.length : 0);
        
        // Средняя длительность урока в зависимости от уровня сложности
        let lessonDuration = 30; // в минутах по умолчанию
        
        if (course.level) {
            const level = course.level.toLowerCase();
            if (level.includes('начинающий')) lessonDuration = 20;
            else if (level.includes('средний')) lessonDuration = 30;
            else if (level.includes('продвинутый')) lessonDuration = 45;
        }
        
        const totalMinutes = count * lessonDuration;
        
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
    
    const duration = course.duration || calculateDuration();
    
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
                    <ClockIcon className="h-4 w-4 mr-1" />
                    <span>{duration}</span>
                </div>
                <div className="flex items-center text-gray-500">
                    <ChartBarIcon className="h-4 w-4 mr-1" />
                    <span>Уровень: {course.level}</span>
                </div>
            </div>
            
            {/* Categories */}
            <div className="flex items-center text-sm text-gray-500 mb-2">
                <TagIcon className="h-4 w-4 mr-1" />
                <span>{categories}</span>
            </div>
        </>
    );
}