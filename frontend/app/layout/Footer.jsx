import React from 'react';
import { Link } from 'react-router';

export function Footer() {
    return (
        <footer className="bg-slate-900 dark:bg-slate-950 text-white py-6 sm:py-8 border-t border-slate-800">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
                    {/* Лого и навигация */}
                    <div className="flex flex-col items-center md:items-start space-y-4">
                        <Link 
                            to="/" 
                            className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                        >
                            EduPlatform
                        </Link>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                            <Link 
                                to="/about" 
                                className="text-sm text-slate-300 hover:text-white transition-colors hover:underline"
                            >
                                О платформе
                            </Link>
                            <Link 
                                to="/courses" 
                                className="text-sm text-slate-300 hover:text-white transition-colors hover:underline"
                            >
                                Курсы
                            </Link>
                            <Link 
                                to="/profile" 
                                className="text-sm text-slate-300 hover:text-white transition-colors hover:underline"
                            >
                                Профиль
                            </Link>
                        </div>
                    </div>

                    {/* Контактная информация */}
                    <div className="text-center md:text-right">
                        <p className="text-slate-400 text-sm mb-2">
                            Образовательная платформа с 3D элементами
                        </p>
                        <p className="text-slate-500 text-xs">
                            Изучайте программирование через визуальное конструирование
                        </p>
                    </div>
                </div>

                {/* Разделитель */}
                <div className="my-6 border-t border-slate-800"></div>

                {/* Копирайт и дополнительная информация */}
                <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
                    <div className="text-slate-500 text-xs text-center sm:text-left">
                        © {new Date().getFullYear()} EduPlatform. Все права защищены.
                    </div>
                    <div className="flex items-center space-x-4">
                        <a 
                            href="https://github.com/MMXXXII/educational-platform" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-white transition-colors text-xs"
                        >
                            GitHub
                        </a>
                        <span className="text-slate-600">•</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}