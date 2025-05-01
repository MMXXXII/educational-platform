import React from 'react';
import {
    DocumentIcon,
    CodeBracketIcon,
    PhotoIcon,
    DocumentTextIcon,
    MusicalNoteIcon,
    FilmIcon,
    ArchiveBoxIcon,
    NewspaperIcon,
    CommandLineIcon,
    ArrowsUpDownIcon,
    Cog6ToothIcon,
    RssIcon,
    FolderIcon,
    FolderPlusIcon,
    FolderArrowDownIcon,
    Square3Stack3DIcon,
    CodeBracketSquareIcon
} from '@heroicons/react/24/outline';

// File extension to icon mapping
export const fileIconsMap = {
    // Images
    'png': PhotoIcon,
    'jpg': PhotoIcon,
    'jpeg': PhotoIcon,
    'gif': PhotoIcon,
    'svg': PhotoIcon,
    'webp': PhotoIcon,

    // Documents
    'pdf': DocumentTextIcon,
    'doc': DocumentIcon,
    'docx': DocumentIcon,
    'txt': NewspaperIcon,
    'md': NewspaperIcon,

    // Code
    'js': CodeBracketIcon,
    'jsx': CodeBracketIcon,
    'ts': CodeBracketIcon,
    'tsx': CodeBracketIcon,
    'css': CodeBracketSquareIcon,
    'scss': CodeBracketSquareIcon,
    'sass': CodeBracketSquareIcon,
    'html': CodeBracketSquareIcon,
    'json': CodeBracketSquareIcon,
    'xml': RssIcon,
    'py': CodeBracketIcon,
    'java': CodeBracketIcon,
    'cpp': CodeBracketIcon,

    // Config files
    'yml': Cog6ToothIcon,
    'yaml': Cog6ToothIcon,
    'env': Cog6ToothIcon,

    // Archives
    'zip': ArchiveBoxIcon,
    'rar': ArchiveBoxIcon,
    'tar': ArchiveBoxIcon,
    'gz': ArchiveBoxIcon,

    // Media
    'mp3': MusicalNoteIcon,
    'wav': MusicalNoteIcon,
    'mp4': FilmIcon,
    'avi': FilmIcon,
};

// Special folder name to icon mapping
export const folderIconsMap = {
    'src': FolderArrowDownIcon,
    'source': FolderArrowDownIcon,
    'node_modules': Cog6ToothIcon,
    'dist': Square3Stack3DIcon,
    'build': Square3Stack3DIcon,
    'public': FolderPlusIcon,
    'assets': FolderPlusIcon,
    'images': PhotoIcon,
    'img': PhotoIcon,
    'docs': DocumentIcon,
};

// Get icon for file based on extension
export const getFileIcon = (filename) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    return fileIconsMap[extension] || DocumentIcon;
};

// Get icon for folder based on name
export const getFolderIcon = (folderName) => {
    const normalizedName = folderName.toLowerCase();
    return folderIconsMap[normalizedName] || FolderIcon;
};

// React component for rendering file or folder icon
export function FileIcon({ file }) {
    if (!file) {
        console.warn('FileIcon: No file prop provided');
        return <DocumentIcon className="h-5 w-5 text-gray-400" />;
    }

    let IconComponent;

    if (file.is_folder) {
        IconComponent = getFolderIcon(file.name);
    } else {
        IconComponent = getFileIcon(file.name);
    }

    return <IconComponent className="h-5 w-5 text-gray-300" />;
}