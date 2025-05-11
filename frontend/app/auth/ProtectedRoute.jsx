import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

// Компонент для защиты маршрутов
export function ProtectedRoute({ children, requiredRoles = [] }) {
    const { isAuthenticated, isLoading, hasRole } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Используем useEffect для перенаправления на страницу входа
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate('/sign-in', { state: { from: location }, replace: true });
        }
    }, [isLoading, isAuthenticated, navigate, location]);

    // Пока проверяем авторизацию, показываем загрузчик
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // Если пользователь не авторизован, показываем загрузчик пока useEffect не выполнит перенаправление
    if (!isAuthenticated) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // Если указаны требуемые роли и у пользователя нет нужной роли
    if (requiredRoles.length > 0 && !hasRole(requiredRoles)) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-red-600 mb-4">Доступ запрещен</h2>
                <p className="text-gray-700">
                    У вас нет необходимых прав для доступа к этой странице.
                </p>
            </div>
        );
    }

    // Если все проверки пройдены, отображаем запрошенный компонент
    return children;
}