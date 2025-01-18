import React from 'react';
import { Avatar } from '@mui/material';
import { getFileIcon, getFolderIcon } from '../../utils/fileIcons';

const FileIcon = ({ file, size = 40 }) => {
  const IconComponent = file.is_folder
    ? getFolderIcon(file.name)
    : getFileIcon(file.name);

  return (
    <Avatar
      src={!file.is_folder && file.thumbnail ? file.thumbnail : undefined}
      variant="rounded"
      sx={{
        width: size,
        height: size,
        backgroundColor: file.is_folder ? 'primary.light' : 'grey.100',
        color: file.is_folder ? 'primary.main' : 'text.secondary',
        '& img': {
          objectFit: 'cover'
        }
      }}
    >
      <IconComponent />
    </Avatar>
  );
};

export default FileIcon;