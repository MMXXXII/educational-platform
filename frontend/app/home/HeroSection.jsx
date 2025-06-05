import { Link } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

export function HeroSection() {
    const { hasRole, isLoading } = useAuth();

    return (
        <section className="flex-grow flex items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-slate-800 dark:to-slate-900 py-12 sm:py-16">
            <div className="text-center px-4 sm:px-6 max-w-3xl mx-auto">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-white leading-tight">
                    Учись программировать вместе с нами
                </h2>
                <p className="mt-4 text-base sm:text-lg text-gray-600 dark:text-gray-300">
                    Интерактивные курсы для детей и подростков. Создавай свои уроки или проходи готовые.
                </p>
                <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center gap-4">
                    <Link
                        to="/courses"
                        className="px-6 sm:px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto flex items-center justify-center"
                    >
                        Начать обучение
                    </Link>
                    {/* Ссылка "Создать курс" только для администраторов и учителей*/}
                    {!isLoading && hasRole(['admin', 'teacher']) && (
                        <Link
                            to="/create-course"
                            className="px-6 sm:px-8 py-3 border border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 font-semibold rounded-lg hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors w-full sm:w-auto flex items-center justify-center"
                        >
                            Создать курс
                        </Link>
                    )}
                </div>
            </div>
        </section>
    );
}