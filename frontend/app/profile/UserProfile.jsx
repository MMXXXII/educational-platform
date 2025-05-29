import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Link as RouterLink } from 'react-router';
import { userService } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { LockClosedIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

export function UserProfile() {
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { logout } = useAuth();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userData = await userService.getCurrentUser();
                setUser(userData);
            } catch (error) {
                console.error('Error fetching user data:', error);
                setError(error.response?.data?.detail || 'Failed to load user data');
                if (error.response?.status === 401) {
                    navigate('/sign-in');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleLogout = (e) => {
        e.preventDefault();
        logout();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full text-gray-900 dark:text-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="py-8 px-4 sm:px-0 flex items-center justify-center h-full text-gray-900 dark:text-gray-100">
            <div className="max-w-md w-full">
                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                        <p>{error}</p>
                    </div>
                )}
                <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-lg shadow-lg flex flex-col items-center">
                    <h1 className="text-2xl font-bold mb-6">Профиль пользователя</h1>
                    <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-3xl font-bold mb-4 text-white">
                        {user?.username.charAt(0).toUpperCase()}
                    </div>
                    <h2 className="text-xl font-semibold mb-2">{user?.username}</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">Email: {user?.email}</p>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Роль: {user?.role}</p>

                    <button
                        className="flex items-center justify-center px-4 py-2 border border-blue-500 text-blue-600 dark:text-blue-500 rounded hover:bg-blue-500 hover:text-white transition-colors mb-4 w-full"
                    >
                        <LockClosedIcon className="h-5 w-5 mr-2" />
                        Изменить пароль
                    </button>

                    {user?.role === 'admin' && (
                        <RouterLink
                            to="/admin"
                            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors mb-4 w-full"
                        >
                            <ShieldCheckIcon className="h-5 w-5 mr-2" />
                            Панель администратора
                        </RouterLink>
                    )}

                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors w-full"
                    >
                        Выйти
                    </button>
                </div>
            </div>
        </div>
    );
}