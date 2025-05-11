import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { ArrowDownTrayIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

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
                    <ArrowDownTrayIcon className="h-5 w-5 mr-3 text-gray-400" />
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
                <PencilIcon className="h-5 w-5 mr-3 text-gray-400" />
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
                <TrashIcon className="h-5 w-5 mr-3 text-red-400" />
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