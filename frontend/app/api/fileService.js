import api from './client';

const fileService = {
    // Folders operations
    getFolders: async (parentId = null) => {
        const response = await api.get('/folders', { 
            params: { parent: parentId } 
        });
        return response.data;
    },

    createFolder: async (name, parentId = null) => {
        const response = await api.post('/folders', { 
            name, 
            parent: parentId 
        });
        return response.data;
    },

    renameFolder: async (folderId, newName) => {
        const response = await api.put(`/folders/${folderId}/rename`, null, {
            params: { new_name: newName }
        });
        return response.data;
    },

    deleteFolder: async (folderId) => {
        await api.delete(`/folders/${folderId}`);
    },

    // Files operations
    getFiles: async (folderId = null) => {
        const response = await api.get('/files', { 
            params: { folder: folderId } 
        });
        return response.data;
    },

    uploadFile: async (file, folderId = null) => {
        const formData = new FormData();
        formData.append('file', file);
        if (folderId) {
            formData.append('folder', folderId);
        }

        const response = await api.post('/files', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    renameFile: async (fileId, newName) => {
        const response = await api.put(`/files/${fileId}/rename`, null, {
            params: { new_name: newName }
        });
        return response.data;
    },

    deleteFile: async (fileId) => {
        await api.delete(`/files/${fileId}`);
    },

    downloadFile: async (fileId) => {
        const response = await api.get(`/files/${fileId}/download`, {
            responseType: 'blob'
        });
        return response.data;
    }
};

export default fileService;