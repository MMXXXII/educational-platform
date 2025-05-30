import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router';
import {
    CheckIcon,
    Bars3Icon
} from '@heroicons/react/24/outline';
import { useEditor } from '../../contexts/EditorContext';
import ProjectManagerButton from './ProjectManagerButton';
import ProjectManagerModal from './ProjectManagerModal';

/**
 * Компонент верхней панели редактора нодов
 * 
 * @param {Object} props - Свойства компонента
 * @param {string} props.projectName - Название текущего проекта
 * @param {boolean} props.isModified - Флаг изменения проекта
 * @param {Function} props.onSave - Обработчик сохранения проекта
 * @param {boolean} props.isMobile - Флаг мобильного отображения
 */
const EditorHeader = ({
    projectName,
    isModified,
    onSave,
    isMobile = false
}) => {
    const { refreshProjectsList } = useEditor();

    // Состояние для модального окна менеджера проектов
    const [isProjectManagerOpen, setIsProjectManagerOpen] = useState(false);

    // Состояние для мобильного меню
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Состояние для определения темной темы
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Определение темной темы при загрузке и изменении настроек системы
    useEffect(() => {
        const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        setIsDarkMode(darkModeMediaQuery.matches);

        const handleChange = (e) => {
            setIsDarkMode(e.matches);
        };

        darkModeMediaQuery.addEventListener('change', handleChange);

        return () => {
            darkModeMediaQuery.removeEventListener('change', handleChange);
        };
    }, []);

    /**
     * Обработчик открытия/закрытия модального окна менеджера проектов
     */
    const handleProjectManagerToggle = () => {
        setIsProjectManagerOpen(!isProjectManagerOpen);
    };

    /**
     * Обработчик закрытия модального окна менеджера проектов
     */
    const handleProjectManagerClose = useCallback(() => {
        setIsProjectManagerOpen(false);
        refreshProjectsList();
    }, [refreshProjectsList]);

    /**
     * Обработчик переключения мобильного меню
     */
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    /**
     * Обработчик сохранения и закрытия мобильного меню
     */
    const handleSaveAndClose = () => {
        onSave();
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            <nav className="bg-white dark:bg-gray-800 shadow-md h-16">
                <div className="w-full px-2 sm:px-6 lg:px-8 h-full">
                    <div className="flex items-center justify-between h-full">
                        {/* Логотип и название проекта */}
                        <div className="flex items-center">
                            <Link to="/" className="flex-shrink-0">
                                <img src="/logo.png" alt="Logo" className="h-10 w-auto light-mode-logo" />
                                <img src="/dark logo.png" alt="Logo" className="h-10 w-auto dark-mode-logo" />
                            </Link>

                            {!isMobile && (
                                <div className="ml-4">
                                    <div className="text-lg font-medium text-gray-800 dark:text-gray-200">
                                        Редактор нодов
                                        {projectName && (
                                            <span className="ml-2 text-gray-600 dark:text-gray-400">
                                                - {projectName}
                                                {isModified && <span className="ml-1 text-amber-500">*</span>}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Мобильное меню */}
                        {isMobile ? (
                            <div className="flex items-center">
                                {projectName && (
                                    <div className="mr-4 text-sm font-medium text-gray-600 dark:text-gray-400 truncate max-w-[120px]">
                                        {projectName}
                                        {isModified && <span className="ml-1 text-amber-500">*</span>}
                                    </div>
                                )}

                                <button
                                    className="p-2 rounded-md text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white focus:outline-none"
                                    onClick={toggleMobileMenu}
                                >
                                    <Bars3Icon className="h-6 w-6" />
                                </button>

                                {isMobileMenuOpen && (
                                    <div className="absolute top-16 right-0 left-0 bg-white dark:bg-gray-800 shadow-lg z-50 border-t border-gray-200 dark:border-gray-700">
                                        <div className="px-4 py-2 space-y-2">
                                            <button
                                                onClick={handleSaveAndClose}
                                                className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none"
                                            >
                                                <CheckIcon className="h-5 w-5 mr-2" />
                                                Сохранить
                                            </button>

                                            <button
                                                onClick={() => {
                                                    handleProjectManagerToggle();
                                                    setIsMobileMenuOpen(false);
                                                }}
                                                className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                                            >
                                                Проекты
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={onSave}
                                    className="px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none flex items-center"
                                >
                                    <CheckIcon className="h-5 w-5 mr-1.5" />
                                    <span>Сохранить</span>
                                </button>

                                <ProjectManagerButton onClick={handleProjectManagerToggle} />
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Модальное окно менеджера проектов */}
            <ProjectManagerModal
                isOpen={isProjectManagerOpen}
                onClose={handleProjectManagerClose}
                isMobile={isMobile}
            />
        </>
    );
};

export default EditorHeader;