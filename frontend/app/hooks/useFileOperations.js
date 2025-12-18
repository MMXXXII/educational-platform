import { useState } from 'react';
import { fileService } from '../api';

export const useFileOperations = (currentFolder, onSuccess) => {
    const [loading, setLoading] = useState({});
    const [error, setError] = useState(null); // Добавлено

    const createFolder = async (folderName) => {
        setLoading({ type: 'createFolder', status: true });
        setError(null); // Сбрасываем предыдущие ошибки
        try {
            await fileService.createFolder(folderName, currentFolder);
            onSuccess(); // Используем onSuccess вместо refresh
        } catch (error) {
            console.error('Error creating folder:', error);
            setError(error.response?.data?.detail || 'Ошибка при создании папки');
            throw error; // Прокидываем ошибку дальше
        } finally {
            setLoading({ type: 'createFolder', status: false });
        }
    };

    const rename = async (item, newName) => {
        if (!item || !newName) return;
        setLoading({ type: 'rename', status: true });

        try {
            if (item.is_folder) {
                await fileService.renameFolder(item.id, newName);
            } else {
                await fileService.renameFile(item.id, newName);
            }
            onSuccess();
        } catch (error) {
            console.error('Error renaming item:', error);
            throw error; // Добавлено: тоже прокидываем ошибку
        } finally {
            setLoading({ type: 'rename', status: false });
        }
    };

    const deleteItem = async (item) => {
        if (!item) return;
        setLoading({ type: 'delete', status: true });

        try {
            if (item.is_folder) {
                await fileService.deleteFolder(item.id);
            } else {
                await fileService.deleteFile(item.id);
            }
            onSuccess();
        } catch (error) {
            console.error('Error deleting item:', error);
            throw error; // Добавлено
        } finally {
            setLoading({ type: 'delete', status: false });
        }
    };

    const download = async (item) => {
        if (!item || item.is_folder) return;
        setLoading({ type: 'download', status: true });

        try {
            const blob = await fileService.downloadFile(item.id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = item.name;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading file:', error);
            throw error; // Добавлено
        } finally {
            setLoading({ type: 'download', status: false });
        }
    };

    const upload = async (files) => {
        setLoading({ type: 'upload', status: true });
        try {
            for (const file of files) {
                await fileService.uploadFile(file, currentFolder);
            }
            onSuccess();
        } catch (error) {
            console.error('Error uploading files:', error);
            throw error; // Добавлено
        } finally {
            setLoading({ type: 'upload', status: false });
        }
    };

    return {
        loading,
        error, // Добавлено в возвращаемый объект
        createFolder,
        rename,
        deleteItem,
        download,
        upload
    };
};