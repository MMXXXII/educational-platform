import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { authService, userService } from '../api';
import { setTokens } from '../utils/auth';
import { LockClosedIcon } from '@heroicons/react/24/outline';

function Copyright() {
    return (
        <p className="text-sm text-gray-400 mt-1">
            {'Copyright © '}
            {new Date().getFullYear()}
            <a className="text-gray-400 hover:text-gray-300">
                &nbsp;EduPlatform
            </a>
        </p>
    );
}

export function SignIn() {
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/';

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        const data = new FormData(event.currentTarget);

        try {
            // Authentication
            const authData = await authService.login(
                data.get('email'),
                data.get('password')
            );
            setTokens(authData.access_token, authData.refresh_token);

            // Get user data
            const userData = await userService.getCurrentUser();
            localStorage.setItem('user', JSON.stringify(userData));

            navigate(from, { replace: true });
        } catch (error) {
            console.error('Error:', error);
            setError(error.response?.data?.detail || 'Authentication failed');
        }
    };

    return (
        <div className="bg-gray-900 text-gray-100 min-h-screen py-4 sm:py-12">
            <div className="max-w-xs sm:max-w-md mx-auto px-4">
                <div className="flex flex-col items-center">
                    {/* Avatar */}
                    <div className="bg-purple-600 rounded-full p-3 mb-4">
                        <LockClosedIcon className="h-6 w-6 text-white" />
                    </div>

                    {/* Header */}
                    <h1 className="text-3xl font-bold mb-2">Вход</h1>

                    {/* Error Alert */}
                    {error && (
                        <div className="w-full bg-red-600 text-white p-3 mb-4 rounded">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="w-full mt-4">
                        {/* Email Field */}
                        <div className="mb-4">
                            <label htmlFor="email" className="block text-sm font-medium mb-1">
                                Электронная почта
                            </label>
                            <input
                                className="w-full bg-gray-800 rounded p-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-600"
                                required
                                id="email"
                                name="email"
                                // type="email"
                                autoComplete="email"
                                autoFocus
                            />
                        </div>

                        {/* Password Field */}
                        <div className="mb-4">
                            <label htmlFor="password" className="block text-sm font-medium mb-1">
                                Пароль
                            </label>
                            <input
                                className="w-full bg-gray-800 rounded p-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-600"
                                required
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                            />
                        </div>

                        {/* Remember Me Checkbox */}
                        <div className="flex items-center mb-4">
                            <input
                                id="remember"
                                name="remember"
                                type="checkbox"
                                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 rounded"
                            />
                            <label htmlFor="remember" className="ml-2 block text-sm">
                                Запомнить меня
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 mt-3 mb-2"
                        >
                            Войти
                        </button>

                        {/* Links */}
                        <div className="flex flex-wrap justify-between text-sm mt-4">
                            <a href="#" className="text-purple-400 hover:text-purple-300">
                                Забыли пароль?
                            </a>
                            <a href="/sign-up" className="text-purple-400 hover:text-purple-300">
                                Нет аккаунта? Зарегистрироваться
                            </a>
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