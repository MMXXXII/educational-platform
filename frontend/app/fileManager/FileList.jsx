import React from 'react';
import { FileListItem } from './FileListItem';

export function FileList({
    files,
    folders,
    onItemClick,
    onMenuClick,
    selectedItem,
    onDrop,
    searchQuery
}) {
    const handleDragOver = (event) => {
        event.preventDefault();
    };

    const filteredFolders = folders.filter(folder =>
        folder.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredFiles = files.filter(file =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div
            className="h-full overflow-auto bg-gray-50 dark:bg-gray-800 rounded-md shadow"
            onDrop={onDrop}
            onDragOver={handleDragOver}
        >
            <ul>
                {filteredFolders.map((folder) => (
                    <FileListItem
                        key={folder.id}
                        file={{ ...folder, is_folder: true }}
                        onClick={onItemClick}
                        onMenuClick={onMenuClick}
                        selected={selectedItem?.id === folder.id}
                    />
                ))}
                {filteredFiles.map((file) => (
                    <FileListItem
                        key={file.id}
                        file={{ ...file, is_folder: false }}
                        onClick={onItemClick}
                        onMenuClick={onMenuClick}
                        selected={selectedItem?.id === file.id}
                    />
                ))}
            </ul>
        </div>
    );
}