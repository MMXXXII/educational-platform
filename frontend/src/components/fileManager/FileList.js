import React from 'react';
import { List, Paper } from '@mui/material';
import FileListItem from './FileListItem';

const FileList = ({
  files,
  folders,
  onItemClick,
  onMenuClick,
  selectedItem,
  onDrop,
  searchQuery
}) => {
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
    <Paper
      sx={{ height: '100%', overflow: 'auto' }}
      onDrop={onDrop}
      onDragOver={handleDragOver}
    >
      <List>
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
      </List>
    </Paper>
  );
};

export default FileList;