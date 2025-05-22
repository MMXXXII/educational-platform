import React, { useCallback, useState } from 'react';
import { TrashIcon } from '@heroicons/react/24/solid';

/**
 * Компонент для отображения панели инструментов ребра при выделении
 * 
 * @param {Object} props - Свойства компонента
 * @param {boolean} props.selected - Выбрано ли ребро
 * @param {string} props.edgeId - ID ребра
 * @param {Function} props.onDelete - Обработчик удаления ребра
 * @returns {JSX.Element} JSX элемент
 */
const EdgeToolbar = ({ selected, edgeId, edge, onDelete }) => {
  const [visible, setVisible] = useState(selected);
  
  // Обработчик клика по кнопке удаления
  const handleDelete = useCallback((e) => {
    e.stopPropagation();
    if (onDelete && edgeId) {
      onDelete(edgeId);
    }
  }, [edgeId, onDelete]);

  // Скрываем тулбар, если ребро не выбрано
  React.useEffect(() => {
    setVisible(selected);
  }, [selected]);

  // Если тулбар не должен быть видимым, не рендерим его
  if (!visible || !edge || !edge.sourceX) return null;

  // Вычисляем позицию тулбара - середина ребра
  const centerX = (edge.sourceX + edge.targetX) / 2;
  const centerY = (edge.sourceY + edge.targetY) / 2;
  
  return (
    <div 
      className="edge-toolbar"
      style={{
        top: `${centerY}px`,
        left: `${centerX}px`
      }}
    >
      <button 
        onClick={handleDelete} 
        className="edge-toolbar__button bg-black bg-opacity-70 hover:bg-opacity-80 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md transition-all"
        title="Удалить соединение"
      >
        <TrashIcon className="h-5 w-5" />
      </button>
    </div>
  );
};

export default EdgeToolbar; 