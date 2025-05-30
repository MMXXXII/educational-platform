import React from 'react';
import PropTypes from 'prop-types';
import { FileIcon } from './FileIcon';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';

export function FileListItem({ file, onClick, onMenuClick, selected }) {
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

    // Check if it's an image file that might have a thumbnail
    const isImage = !file.is_folder && file.name.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i);

    return (
        <li className="relative">
            <div
                className={`flex items-center w-full px-4 py-2 text-left cursor-pointer ${selected
                    ? 'bg-blue-100 dark:bg-blue-900 bg-opacity-70 dark:bg-opacity-40'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                onClick={() => onClick?.(file)}
            >
                <div className="mr-4">
                    {isImage && file.thumbnail ? (
                        <img
                            src={file.thumbnail}
                            alt={file.name}
                            className="h-6 w-6 object-cover rounded"
                        />
                    ) : (
                        <FileIcon file={file} />
                    )}
                </div>
                <div className="flex-grow min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-200 truncate">{file.name}</div>
                    {getSecondaryText() && (
                        <div className="text-xs text-gray-600 dark:text-gray-400">{getSecondaryText()}</div>
                    )}
                </div>
                <button
                    className="ml-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none"
                    onClick={handleMenuClick}
                >
                    <EllipsisVerticalIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" aria-hidden="true" />
                </button>
            </div>
        </li>
    );
}

FileListItem.propTypes = {
    file: PropTypes.shape({
        name: PropTypes.string.isRequired,
        is_folder: PropTypes.bool,
        size: PropTypes.number,
        thumbnail: PropTypes.string,
    }),
    onClick: PropTypes.func,
    onMenuClick: PropTypes.func,
    selected: PropTypes.bool,
};

FileListItem.defaultProps = {
    onClick: () => { },
    onMenuClick: () => { },
    selected: false,
};