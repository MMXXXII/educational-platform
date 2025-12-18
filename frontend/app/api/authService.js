import api from './client';  // ✅ Используем настроенный api клиент

const authService = {
    login: async (username_or_email, password) => {
        const formData = new URLSearchParams();
        formData.append('username_or_email', username_or_email);
        formData.append('password', password);

        // ✅ Используем api вместо axios напрямую
        const response = await api.post('/custom-token', formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        return response.data;
    },

    refresh: async () => {
        // ✅ Используем api
        const response = await api.post('/refresh', {});
        return response.data;
    },

    loginWithVK: async () => {
        // ✅ Используем api
        const response = await api.get('/login/vk');
        return response.data;
    },

    handleVKCallback: async (code) => {
        // ✅ Используем api
        const response = await api.get('/vk-callback', { 
            params: { code }
        });
        return response.data;
    }
};

export default authService;