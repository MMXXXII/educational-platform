import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

export function FileContextMenu({
    anchorEl,
    onClose,
    selectedItem,
    onDownload,
    onRename,
    onDelete
}) {
    const menuRef = useRef(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    useEffect(() => {
        if (anchorEl && menuRef.current) {
            // Handle click outside to close menu
            const handleClickOutside = (event) => {
                if (menuRef.current && !menuRef.current.contains(event.target) && event.target !== anchorEl) {
                    onClose();
                }
            };

            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [anchorEl, onClose]);

    useEffect(() => {
        if (anchorEl && menuRef.current) {
            const rect = anchorEl.getBoundingClientRect();
            const menuWidth = 192; // w-48 = 12rem = 192px

            // Calculate available space to the right
            const viewportWidth = window.innerWidth;
            const spaceToRight = viewportWidth - rect.right;

            // If not enough space to the right, position to the left
            const left = spaceToRight < menuWidth ? rect.left - menuWidth : rect.right;

            setPosition({
                top: rect.bottom,
                left: Math.max(0, left) // Ensure menu doesn't go off the left edge
            });
        }
    }, [anchorEl]);

    if (!selectedItem || !anchorEl) {
        return null;
    }

    return (
        <div
            ref={menuRef}
            className="fixed z-50 bg-gray-800 rounded-md shadow-lg py-1 w-48 ring-1 ring-black ring-opacity-5 focus:outline-none"
            style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
            }}
        >
            {/* Показываем кнопку скачивания только для файлов */}
            {!selectedItem.is_folder && (
                <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                    onClick={() => {
                        onDownload?.();
                        onClose();
                    }}
                >
                    <svg className="h-5 w-5 mr-3 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <span>Скачать</span>
                </button>
            )}

            <button
                className="flex items-center w-full px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                onClick={() => {
                    onRename?.();
                    onClose();
                }}
            >
                <svg className="h-5 w-5 mr-3 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                <span>Переименовать</span>
            </button>

            <div className="border-t border-gray-700 my-1"></div>

            <button
                className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
                onClick={() => {
                    onDelete?.();
                    onClose();
                }}
            >
                <svg className="h-5 w-5 mr-3 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>Удалить</span>
            </button>
        </div>
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
    onClose: () => { },
    onDownload: () => { },
    onRename: () => { },
    onDelete: () => { }
};