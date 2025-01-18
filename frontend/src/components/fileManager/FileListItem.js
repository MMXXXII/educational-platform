import React from 'react';
import PropTypes from 'prop-types';
import {
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  IconButton
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FileIcon from './FileIcon';

const FileListItem = ({ file, onClick, onMenuClick, selected }) => {
  // Return null if no file is provided
  if (!file) {
    console.warn('FileListItem: No file prop provided');
    return null;
  }

  const handleMenuClick = (event) => {
    event.stopPropagation();
    onMenuClick(event, file);
  };

  const getSecondaryText = () => {
    if (!file.is_folder && typeof file.size === 'number') {
      return `Размер: ${(file.size / 1024).toFixed(2)} КБ`;
    }
    return null;
  };

  return (
    <ListItem
      disablePadding
      secondaryAction={
        <IconButton edge="end" onClick={handleMenuClick}>
          <MoreVertIcon />
        </IconButton>
      }
    >
      <ListItemButton 
        onClick={() => onClick?.(file)} 
        selected={selected}
      >
        <ListItemIcon>
          <FileIcon file={file} />
        </ListItemIcon>
        <ListItemText 
          primary={file.name}
          secondary={getSecondaryText()}
        />
      </ListItemButton>
    </ListItem>
  );
};

FileListItem.propTypes = {
  file: PropTypes.shape({
    name: PropTypes.string.isRequired,
    is_folder: PropTypes.bool,
    size: PropTypes.number,
  }),
  onClick: PropTypes.func,
  onMenuClick: PropTypes.func,
  selected: PropTypes.bool,
};

FileListItem.defaultProps = {
  onClick: () => {},
  onMenuClick: () => {},
  selected: false,
};

export default FileListItem;