import { useState, useCallback, useEffect } from 'react';
import { fileService } from '../api';

export const useFileNavigation = () => {
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderPath, setFolderPath] = useState([]);
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [foldersData, filesData] = await Promise.all([
        fileService.getFolders(currentFolder),
        fileService.getFiles(currentFolder)
      ]);
      setFolders(foldersData);
      setFiles(filesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [currentFolder]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const navigateToFolder = (folder) => {
    setCurrentFolder(folder.id);
    setFolderPath([...folderPath, folder]);
  };

  const navigateByBreadcrumb = (index) => {
    if (index === -1) {
      setCurrentFolder(null);
      setFolderPath([]);
    } else {
      const newPath = folderPath.slice(0, index + 1);
      setCurrentFolder(newPath[newPath.length - 1].id);
      setFolderPath(newPath);
    }
  };

  return {
    currentFolder,
    folderPath,
    folders,
    files,
    loading,
    navigateToFolder,
    navigateByBreadcrumb,
    refresh: fetchData
  };
};