import axios from 'axios';
import config from '../../config';

const authService = {
    login: async (username, password) => {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        const response = await axios.post(`${config.apiUrl}/api/token`, 
            formData,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                withCredentials: true
            }
        );
        return response.data;
    },

    refresh: async () => {
        const response = await axios.post(`${config.apiUrl}/api/refresh`, {}, {
            withCredentials: true
        });
        return response.data;
    },

    loginWithVK: async () => {
        const response = await axios.get(`${config.apiUrl}/api/login/vk`, {
            withCredentials: true
        });
        return response.data;
    },

    handleVKCallback: async (code) => {
        const response = await axios.get(`${config.apiUrl}/api/vk-callback`, { 
            params: { code },
            withCredentials: true
        });
        return response.data;
    }
};

export default authService;