import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { UserIcon, ArrowRightEndOnRectangleIcon, BookOpenIcon, PlayIcon, PencilSquareIcon, Bars3Icon, XMarkIcon, DocumentTextIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

export function Header() {
    const { isAuthenticated, hasRole, isLoading } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        // Определение темной темы при загрузке и изменении настроек системы
        const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        setIsDarkMode(darkModeMediaQuery.matches);

        // Добавление слушателя для изменений
        const handleChange = (e) => {
            setIsDarkMode(e.matches);
        };

        darkModeMediaQuery.addEventListener('change', handleChange);

        return () => {
            darkModeMediaQuery.removeEventListener('change', handleChange);
        };
    }, []);

    // Обработчик для предотвращения контекстного меню на логотипе
    const preventContextMenu = (e) => {
        e.preventDefault();
        return false;
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    return (
        <header className="bg-white dark:bg-gray-800 shadow-md fixed w-full z-50">
            <div className="container mx-auto px-4 sm:px-6 py-3">
                <div className="flex justify-between items-center">
                    {/* Защищенный логотип с использованием CSS background-image */}
                    <Link
                        to="/"
                        className="block relative"
                        onContextMenu={preventContextMenu}
                    >
                        <img
                            src="/logo.png"
                            alt="EduPlatform Logo"
                            className="h-12 sm:h-15 w-auto select-none light-mode-logo"
                            draggable="false"
                        />
                        <img
                            src="/dark logo.png"
                            alt="EduPlatform Logo"
                            className="h-12 sm:h-15 w-auto select-none dark-mode-logo"
                            draggable="false"
                        />
                        {/* Защитный слой поверх изображения */}
                        <div
                            className="absolute inset-0 z-10"
                            onContextMenu={preventContextMenu}
                            onClick={(e) => e.stopPropagation()}
                        ></div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex space-x-4 items-center">
                        {!isLoading && (
                            isAuthenticated ? (
                                <>
                                    {/* Ссылка "Курсы" для всех авторизованных пользователей */}
                                    <Link
                                        to="/courses"
                                        className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center"
                                    >
                                        <BookOpenIcon className="h-5 w-5 mr-1" />
                                        <span>Курсы</span>
                                    </Link>

                                    {/* Ссылка "Мои курсы" для всех авторизованных пользователей */}
                                    <Link
                                        to="/my-courses"
                                        className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center"
                                    >
                                        <AcademicCapIcon className="h-5 w-5 mr-1" />
                                        <span>Мои курсы</span>
                                    </Link>

                                    {/* Ссылка "Создать курс" только для администраторов и учителей */}
                                    {hasRole(['admin', 'teacher']) && (
                                        <Link
                                            to="/create-course"
                                            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center"
                                        >
                                            <PencilSquareIcon className="h-5 w-5 mr-1" />
                                            <span>Создать курс</span>
                                        </Link>
                                    )}

                                    {/* Ссылка "Файлы" только для всех авторизованных пользователей */}
                                        <Link
                                            to="/file-manager"
                                            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center"
                                        >
                                            <DocumentTextIcon className="h-5 w-5 mr-1" />
                                            <span>Файлы</span>
                                        </Link>
                                    

                                    {/* Ссылка "Профиль" для всех авторизованных пользователей */}
                                    <Link
                                        to="/profile"
                                        className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 flex items-center"
                                    >
                                        <UserIcon className="h-5 w-5 mr-1" />
                                        <span>Профиль</span>
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/sign-in"
                                        className="px-4 py-2 border border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 flex items-center"
                                    >
                                        <ArrowRightEndOnRectangleIcon className="h-5 w-5 mr-1" />
                                        <span>Войти</span>
                                    </Link>
                                    <Link
                                        to="/sign-up"
                                        className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                                    >
                                        Регистрация
                                    </Link>
                                </>
                            )
                        )}
                    </nav>

                    {/* Mobile menu button */}
                    <button
                        className="md:hidden text-gray-700 dark:text-gray-300 focus:outline-none"
                        onClick={toggleMobileMenu}
                    >
                        {mobileMenuOpen ? (
                            <XMarkIcon className="h-6 w-6" />
                        ) : (
                            <Bars3Icon className="h-6 w-6" />
                        )}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && !isLoading && (
                    <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-800 shadow-lg py-4 px-6 z-10">
                        <nav className="flex flex-col space-y-4">
                            {isAuthenticated ? (
                                <>
                                    <Link
                                        to="/node-editor"
                                        className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <PlayIcon className="h-5 w-5 mr-2" />
                                        <span>Пройти курс</span>
                                    </Link>

                                    <Link
                                        to="/courses"
                                        className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <BookOpenIcon className="h-5 w-5 mr-2" />
                                        <span>Курсы</span>
                                    </Link>

                                    <Link
                                        to="/my-courses"
                                        className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <AcademicCapIcon className="h-5 w-5 mr-2" />
                                        <span>Мои курсы</span>
                                    </Link>

                                    {hasRole(['admin', 'teacher']) && (
                                        <Link
                                            to="/create-course"
                                            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            <PencilSquareIcon className="h-5 w-5 mr-2" />
                                            <span>Создать курс</span>
                                        </Link>
                                    )}

                                    {hasRole(['admin', 'teacher']) && (
                                        <Link
                                            to="/file-manager"
                                            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            <DocumentTextIcon className="h-5 w-5 mr-1" />
                                            <span>Файлы</span>
                                        </Link>
                                    )}

                                    <Link
                                        to="/profile"
                                        className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 flex items-center justify-center"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <UserIcon className="h-5 w-5 mr-2" />
                                        <span>Профиль</span>
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/sign-in"
                                        className="px-4 py-2 border border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 flex items-center justify-center"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <span>Войти</span>
                                    </Link>
                                    <Link
                                        to="/sign-up"
                                        className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 flex items-center justify-center"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Регистрация
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}