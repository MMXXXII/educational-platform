import React from 'react';
import { NodeToolbar as ReactFlowNodeToolbar } from 'reactflow';
import { TrashIcon } from '@heroicons/react/24/solid';

/**
 * Компонент для отображения панели инструментов нода при выделении
 * 
 * @param {Object} props - Свойства компонента
 * @param {boolean} props.selected - Выбран ли нод
 * @param {string} props.nodeId - ID нода
 * @param {Function} props.onDelete - Обработчик удаления нода
 * @returns {JSX.Element} JSX элемент
 */
const NodeToolbar = ({ selected, nodeId, onDelete }) => {
  if (!selected) return null;

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete && nodeId) {
      onDelete(nodeId);
    }
  };

  return (
    <ReactFlowNodeToolbar position="top" align="center" className="node-toolbar">
      <button 
        onClick={handleDelete} 
        className="node-toolbar__button bg-black bg-opacity-70 hover:bg-opacity-80 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md transition-all"
        title="Удалить"
      >
        <TrashIcon className="h-5 w-5" />
      </button>
    </ReactFlowNodeToolbar>
  );
};

export default NodeToolbar; 