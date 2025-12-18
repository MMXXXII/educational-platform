import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Link as RouterLink } from 'react-router';
import { userService } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { LockClosedIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

export function UserProfile() {
    // Все хуки должны быть на верхнем уровне
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    
    // Хуки для формы пароля
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    
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

    const handlePasswordChange = (e) => {
        setPasswordForm({
            ...passwordForm,
            [e.target.name]: e.target.value
        });
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordError('Новый пароль и подтверждение не совпадают');
            return;
        }
        if (passwordForm.newPassword.length < 6) {
            setPasswordError('Новый пароль должен содержать минимум 6 символов');
            return;
        }

        try {
            await userService.updatePassword(passwordForm.currentPassword, passwordForm.newPassword);
            setPasswordSuccess('Пароль успешно изменен!');
            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setTimeout(() => setPasswordSuccess(''), 3000);
        } catch (error) {
            console.error('Ошибка при изменении пароля:', error);
            setPasswordError(error.response?.data?.detail || 'Не удалось изменить пароль. Проверьте текущий пароль.');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center pt-32 h-screen text-gray-900 dark:text-gray-100">
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
                        {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <h2 className="text-xl font-semibold mb-2">{user?.username}</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">Email: {user?.email}</p>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Роль: {user?.role}</p>

                    {/* Форма смены пароля */}
                    <div className="mb-4 w-full">
                        {!isChangingPassword ? (
                            <button
                                onClick={() => setIsChangingPassword(true)}
                                className="flex items-center justify-center px-4 py-2 border border-blue-500 text-blue-600 dark:text-blue-500 rounded hover:bg-blue-500 hover:text-white transition-colors w-full"
                            >
                                <LockClosedIcon className="h-5 w-5 mr-2" />
                                Изменить пароль
                            </button>
                        ) : (
                            <form onSubmit={handlePasswordSubmit} className="space-y-4 border p-4 rounded-lg bg-white dark:bg-gray-900">
                                <h3 className="font-medium">Смена пароля</h3>
                                <div>
                                    <label className="block text-sm mb-1">Текущий пароль</label>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        value={passwordForm.currentPassword}
                                        onChange={handlePasswordChange}
                                        className="w-full px-3 py-2 border rounded dark:bg-gray-800"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm mb-1">Новый пароль</label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={passwordForm.newPassword}
                                        onChange={handlePasswordChange}
                                        className="w-full px-3 py-2 border rounded dark:bg-gray-800"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm mb-1">Подтвердите новый пароль</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={passwordForm.confirmPassword}
                                        onChange={handlePasswordChange}
                                        className="w-full px-3 py-2 border rounded dark:bg-gray-800"
                                        required
                                    />
                                </div>
                                {passwordError && <div className="text-red-600 text-sm">{passwordError}</div>}
                                {passwordSuccess && <div className="text-green-600 text-sm">{passwordSuccess}</div>}
                                <div className="flex space-x-2">
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                    >
                                        Сохранить
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsChangingPassword(false);
                                            setPasswordError('');
                                            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                        }}
                                        className="px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                                    >
                                        Отмена
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

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