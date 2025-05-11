import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

/**
 * Базовый компонент для сайдбаров редактора
 * Предоставляет общую структуру и функциональность для всех типов сайдбаров
 * 
 * @param {Object} props - Свойства компонента
 * @param {React.ReactNode} props.children - Дочерние элементы (содержимое сайдбара)
 * @param {string} props.title - Заголовок сайдбара
 * @param {string} props.icon - Иконка в формате JSX
 * @param {string} props.position - Позиция сайдбара: 'left', 'right', 'top', 'bottom' (по умолчанию 'right')
 * @param {boolean} props.initiallyCollapsed - Свернут ли сайдбар изначально
 * @param {boolean} props.collapsible - Можно ли сворачивать сайдбар
 * @param {string} props.width - Ширина сайдбара (в px, rem, % и т.д.)
 * @param {string} props.height - Высота сайдбара (в px, rem, % и т.д.)
 * @param {string} props.className - Дополнительные CSS-классы
 */
const BaseSidebar = ({
    children,
    title = 'Панель',
    icon = null,
    position = 'right',
    initiallyCollapsed = false,
    collapsible = true,
    width = '350px',
    height = 'auto',
    className = '',
}) => {
    // Состояние свернутости сайдбара
    const [isCollapsed, setIsCollapsed] = useState(initiallyCollapsed);

    // Определяем позиционирование и размеры в зависимости от параметра position
    const getPositionStyle = () => {
        const baseStyle = {
            position: 'absolute',
            zIndex: 10,
        };

        switch (position) {
            case 'left':
                return {
                    ...baseStyle,
                    left: isCollapsed ? '-100%' : '1rem',
                    top: '1rem',
                    bottom: '1rem',
                    width,
                    transition: 'left 0.3s ease',
                };
            case 'top':
                return {
                    ...baseStyle,
                    top: isCollapsed ? '-100%' : '1rem',
                    left: '1rem',
                    right: '1rem',
                    height,
                    transition: 'top 0.3s ease',
                };
            case 'bottom':
                return {
                    ...baseStyle,
                    bottom: isCollapsed ? '-100%' : '1rem',
                    left: '1rem',
                    right: '1rem',
                    height,
                    transition: 'bottom 0.3s ease',
                };
            case 'right':
            default:
                return {
                    ...baseStyle,
                    right: isCollapsed ? '-100%' : '1rem',
                    top: '1rem',
                    bottom: '1rem',
                    width,
                    transition: 'right 0.3s ease',
                };
        }
    };

    // Получаем стили с учетом позиции
    const sidebarStyle = getPositionStyle();

    // Если сайдбар полностью свернут, показываем только кнопку разворачивания
    if (isCollapsed) {
        const expandButtonStyle = {
            position: 'absolute',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-primary, #ffffff)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
            cursor: 'pointer',
        };

        // Размещаем кнопку в зависимости от позиции сайдбара
        if (position === 'left') {
            expandButtonStyle.left = '1rem';
            expandButtonStyle.top = '1rem';
        } else if (position === 'top') {
            expandButtonStyle.top = '1rem';
            expandButtonStyle.right = '1rem';
        } else if (position === 'bottom') {
            expandButtonStyle.bottom = '1rem';
            expandButtonStyle.right = '1rem';
        } else { // right
            expandButtonStyle.right = '1rem';
            expandButtonStyle.top = '1rem';
        }

        return (
            <div
                style={expandButtonStyle}
                onClick={() => setIsCollapsed(false)}
                className="dark:bg-gray-800 dark:text-gray-200 text-gray-800"
                title="Развернуть панель"
            >
                {icon || (position === 'left' || position === 'right' ? '⇆' : '⇅')}
            </div>
        );
    }

    return (
        <div
            style={sidebarStyle}
            className={`nodrag nopan bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden ${className}`}
        >
            {/* Заголовок сайдбара */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center">
                    {icon && <span className="mr-2">{icon}</span>}
                    <h3 className="font-medium text-gray-800 dark:text-gray-200">{title}</h3>
                </div>

                {/* Кнопка сворачивания, если разрешено */}
                {collapsible && (
                    <button
                        onClick={() => setIsCollapsed(true)}
                        className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                        title="Свернуть панель"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                )}
            </div>

            {/* Содержимое сайдбара */}
            <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(100% - 50px)' }}>
                {children}
            </div>
        </div>
    );
};

export default BaseSidebar;