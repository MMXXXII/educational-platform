import React, { useEffect } from 'react';
import { XMarkIcon, InformationCircleIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

/**
 * Компонент для отображения уведомлений
 * 
 * @param {Object} props - Свойства компонента
 * @param {Object} props.notification - Объект уведомления {message, type}
 * @param {Function} props.onClose - Функция закрытия уведомления
 * @param {number} props.autoHideTime - Время в мс, через которое уведомление скроется автоматически (0 - не скрывать)
 */
const NotificationPanel = ({ notification, onClose, autoHideTime = 5000 }) => {
    // Если нет уведомления, не рендерим компонент
    if (!notification) return null;

    // Используем эффект для автоматического скрытия уведомления через указанное время
    useEffect(() => {
        if (autoHideTime > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, autoHideTime);

            // Очищаем таймер при размонтировании компонента или изменении уведомления
            return () => clearTimeout(timer);
        }
    }, [notification, autoHideTime, onClose]);

    // Определяем иконку и стили в зависимости от типа уведомления
    const getNotificationStyle = () => {
        switch (notification.type) {
            case 'error':
                return {
                    icon: <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />,
                    style: 'bg-red-100 text-red-800 border-l-4 border-red-500'
                };
            case 'warning':
                return {
                    icon: <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />,
                    style: 'bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500'
                };
            case 'success':
                return {
                    icon: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
                    style: 'bg-green-100 text-green-800 border-l-4 border-green-500'
                };
            case 'info':
            default:
                return {
                    icon: <InformationCircleIcon className="h-5 w-5 text-blue-500" />,
                    style: 'bg-blue-100 text-blue-800 border-l-4 border-blue-500'
                };
        }
    };

    const { icon, style } = getNotificationStyle();

    return (
        <div
            className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center ${style}`}
            role="alert"
        >
            <div className="mr-2">{icon}</div>
            <span>{notification.message}</span>
            <button
                className="ml-3 text-gray-500 hover:text-gray-700"
                onClick={onClose}
                aria-label="Закрыть уведомление"
            >
                <XMarkIcon className="h-4 w-4" />
            </button>
        </div>
    );
};

export default NotificationPanel;