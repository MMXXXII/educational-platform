import React from 'react';
import { FolderIcon } from '@heroicons/react/24/outline';

/**
 * Компонент кнопки для открытия менеджера проектов
 * 
 * @param {Object} props - Свойства компонента
 * @param {Function} props.onClick - Обработчик нажатия на кнопку
 */
const ProjectManagerButton = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded flex items-center shadow-sm hover:shadow transition-all duration-200"
            title="Управление проектами"
        >
            <FolderIcon className="w-5 h-5 mr-1.5" />
            <span>Проекты</span>
        </button>
    );
};

export default ProjectManagerButton;