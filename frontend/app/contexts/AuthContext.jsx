import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { authService, userService } from '../api';
import { getAccessToken, setTokens, removeTokens } from '../utils/auth';
import { cleanupOldData } from '../utils/indexedDB';

// Создаем контекст
const AuthContext = createContext(null);

// Провайдер контекста
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // Функция проверки аутентификации при загрузке приложения
    useEffect(() => {
        const initAuth = async () => {
            try {
                // Если токен существует, получаем данные пользователя
                if (getAccessToken()) {
                    const userData = await userService.getCurrentUser();
                    setUser(userData);
                }
            } catch (error) {
                console.error('Error initializing auth:', error);
                // Если запрос не прошел, очищаем токены
                removeTokens();
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
    }, []);

    // Функция входа в систему
    const login = async (username_or_email, password) => {
        try {
            // Авторизация
            const authData = await authService.login(username_or_email, password);
            setTokens(authData.access_token, authData.refresh_token);

            // Получение данных пользователя
            const userData = await userService.getCurrentUser();
            setUser({ ...userData });

            return userData;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    // Функция выхода из системы
    const logout = async () => {
        try {
            removeTokens();
            setUser(null);
            
            // Очищаем IndexedDB при выходе
            await cleanupOldData();
            
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Проверка прав пользователя
    const hasRole = (roles) => {
        if (!user) return false;

        // Если роли представлены в виде массива
        if (Array.isArray(roles)) {
            return roles.includes(user.role);
        }

        // Если передана одна роль
        return user.role === roles;
    };

    // Значение контекста, которое будет доступно компонентам
    const value = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasRole
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// Хук для использования контекста авторизации
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};