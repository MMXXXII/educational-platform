import axios from 'axios';
import config from '../../config';

const authService = {
    login: async (username_or_email, password) => {
        const formData = new URLSearchParams();
        formData.append('username_or_email', username_or_email);
        formData.append('password', password);

        const response = await axios.post(`${config.apiUrl}/custom-token`, 
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
        const response = await axios.post(`${config.apiUrl}/refresh`, {}, {
            withCredentials: true
        });
        return response.data;
    },

    loginWithVK: async () => {
        const response = await axios.get(`${config.apiUrl}/login/vk`, {
            withCredentials: true
        });
        return response.data;
    },

    handleVKCallback: async (code) => {
        const response = await axios.get(`${config.apiUrl}/vk-callback`, { 
            params: { code },
            withCredentials: true
        });
        return response.data;
    }
};

export default authService;