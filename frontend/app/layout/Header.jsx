import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { UserIcon, ArrowRightEndOnRectangleIcon, BookOpenIcon, PlayIcon, PencilSquareIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export function Header({ isAuthenticated }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Обработчик для предотвращения контекстного меню на логотипе
    const preventContextMenu = (e) => {
        e.preventDefault();
        return false;
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    return (
        <header className="bg-white shadow-md relative z-20">
            <div className="container mx-auto px-4 sm:px-6 py-3">
                <div className="flex justify-between items-center">
                    {/* Вариант 1: Защищенный логотип с использованием CSS background-image */}
                    <Link to="/" className="block">
                        <div 
                            className="h-12 sm:h-15 w-auto sm:w-40 bg-no-repeat bg-contain bg-center select-none" 
                            style={{ 
                                backgroundImage: 'url("logo.png")',
                                pointerEvents: 'none' 
                            }}
                            onContextMenu={preventContextMenu}
                            aria-label="EduPlatform Logo"
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex space-x-4 items-center">
                        {isAuthenticated ? (
                            <>
                                {/* Временная ссылка "Пройти курс" */}
                                <Link
                                    to="/node-editor"
                                    className="text-gray-700 hover:text-blue-600 flex items-center"
                                >
                                    <PlayIcon className="h-5 w-5 mr-1" />
                                    <span>Пройти курс</span>
                                </Link>
                                <Link
                                    to="/courses"
                                    className="text-gray-700 hover:text-blue-600 flex items-center"
                                >
                                    <BookOpenIcon className="h-5 w-5 mr-1" />
                                    <span>Курсы</span>
                                </Link>
                                <Link
                                    to="/editor"
                                    className="text-gray-700 hover:text-blue-600 flex items-center"
                                >
                                    <PencilSquareIcon className="h-5 w-5 mr-1" />
                                    <span>Создать курс</span>
                                </Link>
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
                                    className="px-4 py-2 border border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 flex items-center"
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
                        )}
                    </nav>

                    {/* Mobile menu button */}
                    <button
                        className="md:hidden text-gray-700 focus:outline-none"
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
                {mobileMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg py-4 px-6 z-10">
                        <nav className="flex flex-col space-y-4">
                            {isAuthenticated ? (
                                <>
                                    <Link
                                        to="/courses"
                                        className="text-gray-700 hover:text-blue-600 flex items-center"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <BookOpenIcon className="h-5 w-5 mr-2" />
                                        <span>Курсы</span>
                                    </Link>
                                    <Link
                                        to="/editor"
                                        className="text-gray-700 hover:text-blue-600 flex items-center"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <PencilSquareIcon className="h-5 w-5 mr-2" />
                                        <span>Создать курс</span>
                                    </Link>
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
                                        to="/login"
                                        className="px-4 py-2 border border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 flex items-center justify-center"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <ArrowRightEndOnRectangleIcon className="h-5 w-5 mr-2" />
                                        <span>Войти</span>
                                    </Link>
                                    <Link
                                        to="/register"
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