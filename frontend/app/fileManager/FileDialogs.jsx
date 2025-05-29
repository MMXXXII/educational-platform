import React from 'react';
import { XMarkIcon, FolderPlusIcon, PencilIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export const CreateFolderDialog = ({ open, onClose, onCreate, value, onChange }) => {
    if (!open) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const stopPropagation = (e) => {
        e.stopPropagation();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={handleOverlayClick}
        >
            {/* Semi-transparent overlay */}
            <div className="absolute inset-0 bg-gray-500/75 dark:bg-gray-900/75"></div>

            <div
                className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-xl w-full max-w-md mx-4 z-50 relative"
                onClick={stopPropagation}
            >
                <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6">
                    <div className="flex items-center">
                        <FolderPlusIcon className="h-5 w-5 text-blue-500 mr-2" />
                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                            Создание новой папки
                        </h3>
                    </div>
                    <div className="mt-4">
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            placeholder="Имя папки"
                            value={value}
                            onChange={e => onChange(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                        type="button"
                        className="w-full sm:w-auto sm:ml-3 inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                        onClick={onCreate}
                    >
                        Создать
                    </button>
                    <button
                        type="button"
                        className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                        onClick={onClose}
                    >
                        <XMarkIcon className="h-5 w-5 mr-1" />
                        Отмена
                    </button>
                </div>
            </div>
        </div>
    );
};

export const RenameDialog = ({ open, onClose, onRename, value, onChange }) => {
    if (!open) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const stopPropagation = (e) => {
        e.stopPropagation();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={handleOverlayClick}
        >
            {/* Semi-transparent overlay */}
            <div className="absolute inset-0 bg-gray-500/75 dark:bg-gray-900/75"></div>

            <div
                className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-xl w-full max-w-md mx-4 z-50 relative"
                onClick={stopPropagation}
            >
                <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6">
                    <div className="flex items-center">
                        <PencilIcon className="h-5 w-5 text-blue-500 mr-2" />
                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                            Переименование
                        </h3>
                    </div>
                    <div className="mt-4">
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            placeholder="Новое имя"
                            value={value}
                            onChange={e => onChange(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                        type="button"
                        className="w-full sm:w-auto sm:ml-3 inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                        onClick={onRename}
                    >
                        Переименовать
                    </button>
                    <button
                        type="button"
                        className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                        onClick={onClose}
                    >
                        <XMarkIcon className="h-5 w-5 mr-1" />
                        Отмена
                    </button>
                </div>
            </div>
        </div>
    );
};

export const DeleteDialog = ({
    open,
    onClose,
    onDelete,
    item,
    dontAskAgain,
    onDontAskAgainChange
}) => {
    if (!open) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const stopPropagation = (e) => {
        e.stopPropagation();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={handleOverlayClick}
        >
            {/* Semi-transparent overlay */}
            <div className="absolute inset-0 bg-gray-500/75 dark:bg-gray-900/75"></div>

            <div
                className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-xl w-full max-w-md mx-4 z-50 relative"
                onClick={stopPropagation}
            >
                <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6">
                    <div className="flex items-center">
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                            Подтверждение удаления
                        </h3>
                    </div>
                    <div className="mt-2">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            Вы уверены, что хотите удалить {item?.is_folder ? 'папку' : 'файл'} "{item?.name}"?
                        </p>
                        {item?.is_folder && (
                            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                                Это также удалит все содержимое папки.
                            </p>
                        )}
                        <div className="mt-4">
                            <label className="inline-flex items-center">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 bg-white dark:bg-gray-700"
                                    checked={dontAskAgain}
                                    onChange={(e) => onDontAskAgainChange(e.target.checked)}
                                />
                                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Больше не спрашивать</span>
                            </label>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                        type="button"
                        className="w-full sm:w-auto sm:ml-3 inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
                        onClick={onDelete}
                    >
                        Удалить
                    </button>
                    <button
                        type="button"
                        className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                        onClick={onClose}
                    >
                        <XMarkIcon className="h-5 w-5 mr-1" />
                        Отмена
                    </button>
                </div>
            </div>
        </div>
    );
};