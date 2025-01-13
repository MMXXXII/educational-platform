import axios from 'axios';
import { getAccessToken, setTokens, removeTokens } from '../utils/auth';
import config from '../../config';

// Create axios instance with default config
const api = axios.create({
    baseURL: `${config.apiUrl}/api`,
    headers: {
        'Content-Type': 'application/json'
    },
    // Enable sending cookies and auth headers
    withCredentials: true
});

// Request interceptor - add auth token
api.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        // If no response, it's a network error
        if (!error.response) {
            console.error('Network error:', error);
            return Promise.reject(error);
        }

        const originalRequest = error.config;

        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const response = await axios.post(`${config.apiUrl}/api/refresh`, {}, {
                    headers: {
                        'Authorization': `Bearer ${getAccessToken()}`
                    },
                    withCredentials: true
                });

                const { access_token, refresh_token } = response.data;
                setTokens(access_token, refresh_token);

                originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
                return api(originalRequest);
            } catch (refreshError) {
                removeTokens();
                window.location.href = '/sign-in';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;