import React from 'react';
import PropTypes from 'prop-types';
import { FileIcon } from './FileIcon';

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

    return (
        <li className="relative">
            <button
                className={`flex items-center w-full px-4 py-2 text-left ${selected ? 'bg-purple-900 bg-opacity-40' : 'hover:bg-gray-700'
                    }`}
                onClick={() => onClick?.(file)}
            >
                <div className="mr-4">
                    <FileIcon file={file} />
                </div>
                <div className="flex-grow min-w-0">
                    <div className="text-sm font-medium text-gray-200 truncate">{file.name}</div>
                    {getSecondaryText() && (
                        <div className="text-xs text-gray-400">{getSecondaryText()}</div>
                    )}
                </div>
                <button
                    className="ml-2 p-1 rounded-full hover:bg-gray-600 focus:outline-none"
                    onClick={handleMenuClick}
                >
                    <svg
                        className="h-5 w-5 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                    >
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                </button>
            </button>
        </li>
    );
}

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
    onClick: () => { },
    onMenuClick: () => { },
    selected: false,
};