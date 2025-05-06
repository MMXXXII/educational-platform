import api from './client';

const userService = {
    getCurrentUser: async () => {
        const response = await api.get('/users/me');
        return response.data;
    },

    createUser: async (userData) => {
        const formData = new URLSearchParams();
        formData.append('username', userData.username);
        formData.append('email', userData.email);
        formData.append('password', userData.password);
        formData.append('role', userData.role || 'user');

        const response = await api.post('/users', formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        return response.data;
    },

    getAllUsers: async () => {
        const response = await api.get('/users');
        return response.data;
    }
};

export default userService;