import React from 'react';
import PropTypes from 'prop-types';
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

const FileContextMenu = ({
  anchorEl,
  onClose,
  selectedItem,
  onDownload,
  onRename,
  onDelete
}) => {
  if (!selectedItem || !anchorEl) {
    return null;
  }

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      {/* Показываем кнопку скачивания только для файлов */}
      {!selectedItem.is_folder && (
        <MenuItem onClick={() => {
          onDownload?.();
          onClose();
        }}>
          <ListItemIcon>
            <FileDownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Скачать</ListItemText>
        </MenuItem>
      )}
      
      <MenuItem onClick={() => {
        onRename?.();
        onClose();
      }}>
        <ListItemIcon>
          <DriveFileRenameOutlineIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Переименовать</ListItemText>
      </MenuItem>

      <Divider />
      
      <MenuItem onClick={() => {
        onDelete?.();
        onClose();
      }} sx={{ color: 'error.main' }}>
        <ListItemIcon>
          <DeleteIcon fontSize="small" color="error" />
        </ListItemIcon>
        <ListItemText>Удалить</ListItemText>
      </MenuItem>
    </Menu>
  );
};

FileContextMenu.propTypes = {
  anchorEl: PropTypes.object,
  onClose: PropTypes.func,
  selectedItem: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    is_folder: PropTypes.bool
  }),
  onDownload: PropTypes.func,
  onRename: PropTypes.func,
  onDelete: PropTypes.func
};

FileContextMenu.defaultProps = {
  onClose: () => {},
  onDownload: () => {},
  onRename: () => {},
  onDelete: () => {}
};

export default FileContextMenu;