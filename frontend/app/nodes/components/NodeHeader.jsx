import React from 'react';

/**
 * Компонент заголовка нода с классом для перетаскивания
 * 
 * @param {Object} props - Свойства компонента
 * @param {ReactNode} props.children - Содержимое заголовка
 * @param {string} props.className - Дополнительные классы стилей
 * @returns {JSX.Element} JSX элемент
 */
const NodeHeader = ({ children, className = '' }) => {
  return (
    <div className={`font-bold text-center mb-2 pb-1 border-b border-gray-300 dark:border-gray-600 node-drag-handle cursor-move ${className}`}>
      {children}
    </div>
  );
};

export default NodeHeader; 