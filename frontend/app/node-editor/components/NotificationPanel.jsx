import React, { useEffect, useState } from 'react';
import { XMarkIcon, InformationCircleIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

/**
 * Компонент для отображения уведомлений
 * 
 * @param {Object} props - Свойства компонента
 * @param {Object} props.notification - Объект уведомления {message, type}
 * @param {Function} props.onClose - Функция закрытия уведомления
 * @param {number} props.autoHideTime - Время в мс, через которое уведомление скроется автоматически (0 - не скрывать)
 */
const NotificationPanel = ({ notification, onClose, autoHideTime = 0 }) => {
    // Если нет уведомления, не рендерим компонент
    if (!notification) return null;
    
    const [hideTime, setHideTime] = useState(0);
    const [animationDuration, setAnimationDuration] = useState(0);

    // Используем эффект для автоматического скрытия уведомления через указанное время
    useEffect(() => {
        // Определяем время автоскрытия в зависимости от типа уведомления
        let time = autoHideTime;
        
        if (autoHideTime === 0) {
            switch (notification.type) {
                case 'error':
                    time = 10000; // 10 секунд для ошибок
                    break;
                case 'warning':
                    time = 8000; // 8 секунд для предупреждений
                    break;
                case 'success':
                    time = 5000; // 5 секунд для успешных операций
                    break;
                case 'info':
                default:
                    time = 7000; // 7 секунд для информационных сообщений
                    break;
            }
        }
        
        setHideTime(time);
        setAnimationDuration(time);

        if (time > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, time);

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
                    style: 'bg-red-100 text-red-800 border-l-4 border-red-500',
                    progressColor: 'bg-red-500'
                };
            case 'warning':
                return {
                    icon: <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />,
                    style: 'bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500',
                    progressColor: 'bg-yellow-500'
                };
            case 'success':
                return {
                    icon: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
                    style: 'bg-green-100 text-green-800 border-l-4 border-green-500',
                    progressColor: 'bg-green-500'
                };
            case 'info':
            default:
                return {
                    icon: <InformationCircleIcon className="h-5 w-5 text-blue-500" />,
                    style: 'bg-blue-100 text-blue-800 border-l-4 border-blue-500',
                    progressColor: 'bg-blue-500'
                };
        }
    };

    const { icon, style, progressColor } = getNotificationStyle();

    return (
        <div
            className={`fixed bottom-4 left-4 z-50 p-4 rounded-lg shadow-lg flex flex-col max-w-md ${style} overflow-hidden`}
            role="alert"
        >
            <div className="flex items-center w-full">
                <div className="mr-2">{icon}</div>
                <span className="flex-grow">{notification.message}</span>
                <button
                    className="ml-3 text-gray-500 hover:text-gray-700"
                    onClick={onClose}
                    aria-label="Закрыть уведомление"
                >
                    <XMarkIcon className="h-4 w-4" />
                </button>
            </div>
            
            {hideTime > 0 && (
                <div className="h-1 w-full mt-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                        className={`h-full ${progressColor} transition-all ease-linear`}
                        style={{ 
                            width: '100%', 
                            animation: `shrink ${animationDuration}ms linear forwards`
                        }}
                    />
                </div>
            )}
            
            <style jsx>{`
                @keyframes shrink {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}</style>
        </div>
    );
};

export default NotificationPanel;