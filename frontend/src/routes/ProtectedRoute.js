import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getAccessToken } from '../utils/auth';

// Компонент для защиты роутов, требующих авторизации
const ProtectedRoute = ({ children }) => {
    const location = useLocation();
    const accessToken = getAccessToken();

    // Если токен отсутствует, редиректим на страницу логина
    if (!accessToken) {
        return <Navigate to="/sign-in" state={{ from: location }} replace />;
    }

    // Если токен есть, рендерим защищенный компонент
    return children;
};

// Компонент для защиты роутов, требующих прав администратора
const AdminRoute = ({ children }) => {
    const location = useLocation();
    const accessToken = getAccessToken();

    // Получаем данные о пользователе из localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = user.role === 'admin';

    if (!accessToken) {
        return <Navigate to="/sign-in" state={{ from: location }} replace />;
    }

    if (!isAdmin) {
        return <Navigate to="/profile" state={{ from: location }} replace />;
    }

    return children;
};

export { ProtectedRoute, AdminRoute };