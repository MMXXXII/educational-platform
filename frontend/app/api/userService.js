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
    },

    updatePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/users/me/password', {
        current_password: currentPassword,
        new_password: newPassword
    });
    return response.data;
    },

    updateUser: async (userId, userData) => {
        const response = await api.put(`/users/${userId}`, userData);
        return response.data;
    },

    deleteUser: async (userId) => {
        await api.delete(`/users/${userId}`);
    },

    getUserById: async (userId) => {
        const response = await api.get(`/users/${userId}`);
        return response.data;
    }
};

export default userService;