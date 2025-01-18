// Main file manager component
import React, { useState, useRef } from 'react';
import {
  Box, Button, TextField, InputAdornment,
  Breadcrumbs, Link
} from '@mui/material';
import { CreateNewFolder, Search, CloudUpload } from '@mui/icons-material';

import FileList from './FileList';
import FileContextMenu from './FileContextMenu';
import { CreateFolderDialog, RenameDialog, DeleteDialog } from './FileDialogs';
import { useFileOperations } from '../../hooks/useFileOperations';
import { useFileNavigation } from '../../hooks/useFileNavigation';

const FileManager = () => {
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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <TextField
          fullWidth
          placeholder="Поиск файлов и папок..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      
      <Box sx={{ p: 1 }}>
        <Breadcrumbs>
          <Link
            component="button"
            variant="body1"
            onClick={() => navigateByBreadcrumb(-1)}
          >
            Корневая папка
          </Link>
          {folderPath.map((folder, index) => (
            <Link
              key={folder.id}
              component="button"
              variant="body1"
              onClick={() => navigateByBreadcrumb(index)}
            >
              {folder.name}
            </Link>
          ))}
        </Breadcrumbs>
      </Box>

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

      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex', gap: 2 }}>
        <Button
          startIcon={<CreateNewFolder />}
          onClick={() => setNewFolderDialog(true)}
        >
          Новая папка
        </Button>
        <Button
          startIcon={<CloudUpload />}
          onClick={handleManualFileUpload}
        >
          Загрузить файл
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileInputChange}
          multiple
        />
      </Box>

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
        loading={loading.type === 'create' && loading.status}
      />

      <RenameDialog
        open={renameDialog}
        onClose={() => setRenameDialog(false)}
        onRename={handleRename}
        value={newName}
        onChange={setNewName}
        loading={loading.type === 'rename' && loading.status}
      />

      <DeleteDialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        onDelete={executeDelete}
        item={selectedItem}
        dontAskAgain={dontAskDelete}
        onDontAskAgainChange={setDontAskDelete}
        loading={loading.type === 'delete' && loading.status}
      />
    </Box>
  );
};

export default FileManager;