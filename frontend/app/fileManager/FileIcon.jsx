import React from 'react';
import PropTypes from 'prop-types';
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
    Cog6ToothIcon,
    FolderIcon
} from '@heroicons/react/24/outline';

export function FileIcon({ file }) {
    if (!file) return null;

    // Function to get file extension
    const getFileExtension = (filename) => {
        return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
    };

    // If it's a folder, return folder icon
    if (file.is_folder) {
        return <FolderIcon className="h-6 w-6 text-yellow-500" />;
    }

    // Handle different file types based on extension
    const extension = getFileExtension(file.name);

    switch (extension) {
        // Code files
        case 'js':
        case 'jsx':
        case 'ts':
        case 'tsx':
        case 'html':
        case 'css':
        case 'json':
            return <CodeBracketIcon className="h-6 w-6 text-blue-400" />;

        // Image files
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'svg':
        case 'webp':
            return <PhotoIcon className="h-6 w-6 text-green-400" />;

        // Document files
        case 'pdf':
        case 'doc':
        case 'docx':
            return <DocumentTextIcon className="h-6 w-6 text-red-400" />;

        // Text files
        case 'txt':
        case 'md':
            return <DocumentTextIcon className="h-6 w-6 text-gray-400" />;

        // Audio files
        case 'mp3':
        case 'wav':
        case 'ogg':
            return <MusicalNoteIcon className="h-6 w-6 text-purple-400" />;

        // Video files
        case 'mp4':
        case 'avi':
        case 'mov':
        case 'webm':
            return <FilmIcon className="h-6 w-6 text-pink-400" />;

        // Archive files
        case 'zip':
        case 'rar':
        case 'tar':
        case 'gz':
            return <ArchiveBoxIcon className="h-6 w-6 text-yellow-400" />;

        // Data files
        case 'csv':
        case 'xlsx':
        case 'xls':
            return <NewspaperIcon className="h-6 w-6 text-green-600" />;

        // Script/executable
        case 'sh':
        case 'bat':
        case 'ps1':
            return <CommandLineIcon className="h-6 w-6 text-gray-400" />;

        // Config files
        case 'yaml':
        case 'yml':
        case 'conf':
        case 'ini':
        case 'env':
            return <Cog6ToothIcon className="h-6 w-6 text-gray-400" />;

        // Default for unknown types
        default:
            return <DocumentIcon className="h-6 w-6 text-gray-400" />;
    }
}

FileIcon.propTypes = {
    file: PropTypes.shape({
        name: PropTypes.string.isRequired,
        is_folder: PropTypes.bool
    })
};