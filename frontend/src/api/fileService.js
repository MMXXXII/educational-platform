import api from './client';

const fileService = {
    getFolders: async (parent = null) => {
        const response = await api.get('/folders', { 
            params: { parent } 
        });
        return response.data;
    },

    createFolder: async (folderData) => {
        const response = await api.post('/folders', folderData);
        return response.data;
    },

    deleteFolder: async (folderId) => {
        const response = await api.delete(`/folders/${folderId}`);
        return response.data;
    },

    getFiles: async (folder = null) => {
        const response = await api.get('/files', { 
            params: { folder } 
        });
        return response.data;
    },

    uploadFile: async (file, folder = null) => {
        const formData = new FormData();
        formData.append('file', file);
        if (folder) {
            formData.append('folder', folder);
        }

        const response = await api.post('/files', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    deleteFile: async (fileId) => {
        const response = await api.delete(`/files/${fileId}`);
        return response.data;
    },

    downloadFile: async (fileId) => {
        const response = await api.get(`/files/${fileId}/download`, {
            responseType: 'blob'
        });
        return response.data;
    },

    readFileContent: async (fileId) => {
        const response = await api.get(`/files/${fileId}/read`);
        return response.data;
    }
};

export default fileService;