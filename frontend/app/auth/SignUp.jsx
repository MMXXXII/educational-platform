import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Link } from 'react-router';
import { userService } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { LockClosedIcon, HomeIcon } from '@heroicons/react/24/outline';

function Copyright() {
    return (
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {'Copyright © '}
            {new Date().getFullYear()}
            <a className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300">
                &nbsp;EduPlatform
            </a>
        </p>
    );
}

export function SignUp() {
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setIsLoading(true);
        const data = new FormData(event.currentTarget);

        const username = data.get('username');
        const email = data.get('email');
        const password = data.get('password');

        try {
            await userService.createUser({
                username: username,
                email: email,
                password: password
            });
            await login(username, password);
            navigate('/');
        } catch (error) {
            console.error('Error:', error);
            setError(error.response?.data?.detail || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen py-4 sm:py-12">
            <div className="max-w-xs sm:max-w-md mx-auto px-4">
                {/* Return to the main page button */}
                <div className="flex justify-center mb-6">
                    <Link
                        to="/"
                        className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    >
                        <HomeIcon className="h-5 w-5 mr-2" />
                        <span className="text-sm font-medium">На главную</span>
                    </Link>
                </div>

                <div className="flex flex-col items-center">
                    {/* Avatar */}
                    <div className="bg-blue-600 rounded-full p-3 mb-4">
                        <LockClosedIcon className="h-6 w-6 text-white" />
                    </div>

                    {/* Header */}
                    <h1 className="text-3xl font-bold mb-2">Регистрация</h1>

                    {/* Error Alert */}
                    {error && (
                        <div className="w-full bg-red-600 text-white p-3 mb-4 rounded">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="w-full mt-4">
                        {/* Username Field */}
                        <div className="mb-4">
                            <label htmlFor="username" className="block text-sm font-medium mb-1">
                                Имя пользователя или Email
                            </label>
                            <input
                                className="w-full bg-white dark:bg-gray-800 rounded p-2 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                                required
                                id="username"
                                name="username"
                                type="text"
                                autoComplete="username"
                                autoFocus
                            />
                        </div>

                        {/* Email Field */}
                        <div className="mb-4">
                            <label htmlFor="email" className="block text-sm font-medium mb-1">
                                Электронная почта
                            </label>
                            <input
                                className="w-full bg-white dark:bg-gray-800 rounded p-2 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                                required
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                            />
                        </div>

                        {/* Password Field */}
                        <div className="mb-4">
                            <label htmlFor="password" className="block text-sm font-medium mb-1">
                                Пароль
                            </label>
                            <input
                                className="w-full bg-white dark:bg-gray-800 rounded p-2 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                                required
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                            />
                        </div>

                        {/* Newsletter Checkbox */}
                        <div className="flex items-center mb-4">
                            <input
                                id="allowExtraEmails"
                                name="allowExtraEmails"
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                            />
                            <label htmlFor="allowExtraEmails" className="ml-2 block text-sm">
                                Я хочу получать новости об обновлениях на электронную почту.
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 mt-3 mb-2"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
                        </button>

                        {/* Login Link */}
                        <div className="flex justify-end text-sm mt-4">
                            <Link to="/sign-in" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                                Уже есть аккаунт? Войти
                            </Link>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="mt-8 mb-4 text-center">
                    <Copyright />
                </div>
            </div>
        </div>
    );
}