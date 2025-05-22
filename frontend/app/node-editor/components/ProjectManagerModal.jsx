import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import ProjectManager from './ProjectManager';

/**
 * Модальное окно для отображения менеджера проектов
 * 
 * @param {Object} props - Свойства компонента
 * @param {boolean} props.isOpen - Открыто ли модальное окно
 * @param {Function} props.onClose - Функция закрытия модального окна
 * @param {boolean} props.isMobile - Флаг мобильного отображения
 */
const ProjectManagerModal = ({ isOpen, onClose, isMobile = false }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            {/* Полупрозрачный оверлей */}
            <div className="absolute inset-0 bg-gray-900/75"></div>

            <div
                className={`bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-xl w-full ${isMobile ? 'max-w-sm mx-2' : 'max-w-6xl mx-4'} z-50 relative`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6">
                    <div className="flex items-center justify-between">
                        <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-medium text-gray-900 dark:text-gray-100`}>
                            Менеджер проектов
                        </h3>

                        {/* Кнопка закрытия */}
                        <button
                            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                            onClick={onClose}
                        >
                            <XMarkIcon className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'}`} />
                        </button>
                    </div>
                    
                    {/* Содержимое модального окна */}
                    <div className={`mt-4 max-h-[calc(90vh-8rem)] overflow-y-auto ${isMobile ? 'px-1' : ''}`}>
                        <ProjectManager onClose={onClose} isMobile={isMobile} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectManagerModal;