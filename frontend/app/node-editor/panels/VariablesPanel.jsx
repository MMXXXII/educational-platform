import React, { useState } from 'react';
import { BeakerIcon, PlusIcon, TrashIcon, PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useGlobalVariables, VariableTypes } from '../../contexts/GlobalVariablesContext';

/**
 * Панель для просмотра и редактирования глобальных переменных
 */
const VariablesPanel = () => {
    const {
        variables,
        variableValues,
        addVariable,
        updateVariable,
        deleteVariable,
        setVariableValue
    } = useGlobalVariables();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [editingVariable, setEditingVariable] = useState(null);

    const [formName, setFormName] = useState('');
    const [formType, setFormType] = useState(VariableTypes.NUMBER);
    const [formValue, setFormValue] = useState('');

    const handleOpenAddModal = () => {
        setModalMode('add');
        setFormName('');
        setFormType(VariableTypes.NUMBER);
        setFormValue('');
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (name) => {
        const variable = variables[name];
        if (!variable) return;

        setModalMode('edit');
        setFormName(name);
        setFormType(variable.type);
        setFormValue(variable.initialValue);
        setEditingVariable(name);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingVariable(null);
    };

    const handleSubmitForm = () => {
        if (modalMode === 'add') {
            addVariable(formName, formType, formValue);
        } else {
            updateVariable(formName, formType, formValue);
        }
        handleCloseModal();
    };

    const handleValueChange = (name, value) => {
        setVariableValue(name, value);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && formName.trim()) {
            handleSubmitForm();
        }
    };

    return (
        <div className="h-full nodrag nopan">
            <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    Всего: {Object.keys(variables).length}
                </div>
                <button
                    className="p-1.5 bg-purple-100 dark:bg-purple-900 rounded hover:bg-purple-200 dark:hover:bg-purple-800 flex items-center text-purple-600 dark:text-purple-300 text-sm font-medium"
                    title="Добавить переменную"
                    onClick={handleOpenAddModal}
                >
                    <PlusIcon className="w-4 h-4 mr-1" />
                    Добавить
                </button>
            </div>

            <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 p-3 rounded-md mb-4 text-sm">
                Здесь отображаются все глобальные переменные, доступные во время выполнения.
                Вы можете добавлять, изменять и удалять переменные.
            </div>

            {/* Список переменных */}
            <div className="space-y-2 mt-4 max-h-[calc(100vh-300px)] overflow-y-auto">
                {Object.keys(variables).length === 0 ? (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                        Нет переменных. Нажмите "Добавить" для создания переменной.
                    </div>
                ) : (
                    Object.entries(variables).map(([name, variable]) => (
                        <div
                            key={name}
                            className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600"
                        >
                            <div className="flex items-center">
                                <div className={`w-2 h-2 rounded-full mr-2 ${variable.type === VariableTypes.NUMBER ? 'bg-green-500' :
                                    variable.type === VariableTypes.STRING ? 'bg-blue-500' :
                                        variable.type === VariableTypes.BOOLEAN ? 'bg-yellow-500' : 'bg-gray-500'
                                    }`} />
                                <span className="font-medium">{name}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                    ({variable.type})
                                </span>
                            </div>
                            <div className="flex items-center">
                                {variable.type === VariableTypes.BOOLEAN ? (
                                    <select
                                        value={variableValues[name] === true ? 'true' : 'false'}
                                        onChange={(e) => handleValueChange(name, e.target.value === 'true')}
                                        className="w-24 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800 mr-2"
                                    >
                                        <option value="true">true</option>
                                        <option value="false">false</option>
                                    </select>
                                ) : (
                                    <input
                                        type={variable.type === VariableTypes.NUMBER ? 'number' : 'text'}
                                        value={variableValues[name] !== undefined ? variableValues[name] : ''}
                                        onChange={(e) => handleValueChange(name, e.target.value)}
                                        className="w-24 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800 mr-2"
                                    />
                                )}
                                <button
                                    className="text-blue-500 hover:text-blue-600 p-1 mr-1"
                                    onClick={() => handleOpenEditModal(name)}
                                    title="Редактировать"
                                >
                                    <PencilIcon className="w-4 h-4" />
                                </button>
                                <button
                                    className="text-red-500 hover:text-red-600 p-1"
                                    onClick={() => deleteVariable(name)}
                                    title="Удалить"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Модальное окно для добавления/редактирования переменных */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-gray-900/75" onClick={handleCloseModal}></div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md z-10">
                        <h3 className="text-lg font-medium mb-4">
                            {modalMode === 'add' ? 'Добавить переменную' : 'Редактировать переменную'}
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Имя переменной</label>
                                <input
                                    type="text"
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    disabled={modalMode === 'edit'}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700"
                                    onKeyPress={handleKeyPress}
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Тип</label>
                                <select
                                    value={formType}
                                    onChange={(e) => setFormType(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700"
                                >
                                    <option value={VariableTypes.NUMBER}>Число</option>
                                    <option value={VariableTypes.STRING}>Строка</option>
                                    <option value={VariableTypes.BOOLEAN}>Логическое</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Начальное значение</label>
                                {formType === VariableTypes.BOOLEAN ? (
                                    <select
                                        value={formValue === true ? 'true' : 'false'}
                                        onChange={(e) => setFormValue(e.target.value === 'true')}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700"
                                    >
                                        <option value="true">true</option>
                                        <option value="false">false</option>
                                    </select>
                                ) : (
                                    <input
                                        type={formType === VariableTypes.NUMBER ? 'number' : 'text'}
                                        value={formValue}
                                        onChange={(e) => setFormValue(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700"
                                        onKeyPress={handleKeyPress}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2 mt-6">
                            <button
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                                onClick={handleCloseModal}
                            >
                                Отмена
                            </button>
                            <button
                                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${!formName.trim()
                                    ? 'bg-purple-400 cursor-not-allowed'
                                    : 'bg-purple-600 hover:bg-purple-700'
                                    }`}
                                onClick={handleSubmitForm}
                                disabled={!formName.trim()}
                            >
                                {modalMode === 'add' ? 'Добавить' : 'Сохранить'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VariablesPanel;