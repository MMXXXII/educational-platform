// Main file manager component
import React, { useState, useRef } from 'react';
import { FileList } from './FileList';
import { FileContextMenu } from './FileContextMenu';
import { CreateFolderDialog, RenameDialog, DeleteDialog } from './FileDialogs';
import { useFileOperations } from '../hooks/useFileOperations';
import { useFileNavigation } from '../hooks/useFileNavigation';
import {
    MagnifyingGlassIcon,
    ChevronRightIcon,
    FolderPlusIcon,
    ArrowUpTrayIcon
} from '@heroicons/react/24/outline';

export function FileManager() {
    const {
        currentFolder,
        folderPath,
        folders,
        files,
        navigateToFolder,
        navigateByBreadcrumb,
        refresh
    } = useFileNavigation();

    // UI state
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [menuAnchor, setMenuAnchor] = useState(null);
    const fileInputRef = useRef(null);

    // Dialog states
    const [newFolderDialog, setNewFolderDialog] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [renameDialog, setRenameDialog] = useState(false);
    const [newName, setNewName] = useState('');
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [dontAskDelete, setDontAskDelete] = useState(false);

    // File operations
    const { loading, createFolder, rename, deleteItem, download, upload } =
        useFileOperations(currentFolder, refresh);

    // Event handlers
    const handleItemClick = (item) => {
        if (item.is_folder) {
            navigateToFolder(item);
        }
    };

    const handleCreateFolder = async () => {
        await createFolder(newFolderName);
        setNewFolderDialog(false);
        setNewFolderName('');
    };

    const handleRename = async () => {
        await rename(selectedItem, newName);
        setRenameDialog(false);
        setNewName('');
    };

    const handleDelete = () => {
        if (!dontAskDelete) {
            setDeleteDialog(true);
            setMenuAnchor(null);
            return;
        }
        executeDelete();
    };

    const executeDelete = async () => {
        await deleteItem(selectedItem);
        setMenuAnchor(null);
        setDeleteDialog(false);
    };

    const handleFileUpload = async (files) => {
        await upload(Array.from(files));
    };

    const handleManualFileUpload = () => {
        fileInputRef.current?.click();
    };

    const handleFileInputChange = (event) => {
        handleFileUpload(event.target.files);
        event.target.value = null;
    };

    const handleDrop = (event) => {
        event.preventDefault();
        handleFileUpload(event.dataTransfer.files);
    };

    return (
        <div className="h-full flex flex-col bg-gray-900 text-gray-100">
            <div className="p-4 border-b border-gray-700">
                <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md leading-5 bg-gray-800 placeholder-gray-400 focus:outline-none focus:placeholder-gray-300 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-gray-100"
                        placeholder="Поиск файлов и папок..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="px-4 py-2 bg-gray-800">
                <nav className="flex" aria-label="Breadcrumb">
                    <ol className="inline-flex items-center space-x-1 md:space-x-3">
                        <li className="inline-flex items-center">
                            <button
                                className="text-sm font-medium text-purple-400 hover:text-purple-300"
                                onClick={() => navigateByBreadcrumb(-1)}
                            >
                                Корневая папка
                            </button>
                        </li>
                        {folderPath.map((folder, index) => (
                            <li key={folder.id}>
                                <div className="flex items-center">
                                    <ChevronRightIcon className="w-5 h-5 text-gray-500" />
                                    <button
                                        className="ml-1 text-sm font-medium text-purple-400 hover:text-purple-300 md:ml-2"
                                        onClick={() => navigateByBreadcrumb(index)}
                                    >
                                        {folder.name}
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ol>
                </nav>
            </div>

            <div className="flex-grow overflow-hidden">
                <FileList
                    files={files}
                    folders={folders}
                    onItemClick={handleItemClick}
                    onMenuClick={(event, item) => {
                        setSelectedItem(item);
                        setMenuAnchor(event.currentTarget);
                    }}
                    selectedItem={selectedItem}
                    onDrop={handleDrop}
                    searchQuery={searchQuery}
                />
            </div>

            <div className="p-4 border-t border-gray-700 flex space-x-4">
                <button
                    className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    onClick={() => setNewFolderDialog(true)}
                >
                    <FolderPlusIcon className="h-5 w-5 mr-2" />
                    Новая папка
                </button>
                <button
                    className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    onClick={handleManualFileUpload}
                >
                    <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                    Загрузить файл
                </button>
                <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileInputChange}
                    multiple
                />
            </div>

            <FileContextMenu
                anchorEl={menuAnchor}
                onClose={() => setMenuAnchor(null)}
                selectedItem={selectedItem}
                onDownload={() => download(selectedItem)}
                onRename={() => {
                    setRenameDialog(true);
                    setMenuAnchor(null);
                    setNewName(selectedItem?.name || '');
                }}
                onDelete={handleDelete}
            />

            <CreateFolderDialog
                open={newFolderDialog}
                onClose={() => setNewFolderDialog(false)}
                onCreate={handleCreateFolder}
                value={newFolderName}
                onChange={setNewFolderName}
            />

            <RenameDialog
                open={renameDialog}
                onClose={() => setRenameDialog(false)}
                onRename={handleRename}
                value={newName}
                onChange={setNewName}
            />

            <DeleteDialog
                open={deleteDialog}
                onClose={() => setDeleteDialog(false)}
                onDelete={executeDelete}
                item={selectedItem}
                dontAskAgain={dontAskDelete}
                onDontAskAgainChange={setDontAskDelete}
            />
        </div>
    );
}