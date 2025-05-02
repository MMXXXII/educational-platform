import { useState, useCallback } from 'react';
import { fileService } from '../api';

export const useFileOperations = (currentFolder, onSuccess) => {
    const [loading, setLoading] = useState({});

    const createFolder = async (name) => {
        setLoading({ type: 'create', status: true });
        try {
            await fileService.createFolder(name, currentFolder);
            onSuccess();
        } catch (error) {
            console.error('Error creating folder:', error);
        } finally {
            setLoading({ type: 'create', status: false });
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
        } finally {
            setLoading({ type: 'upload', status: false });
        }
    };

    return {
        loading,
        createFolder,
        rename,
        deleteItem,
        download,
        upload
    };
};