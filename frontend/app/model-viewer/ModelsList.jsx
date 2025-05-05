import { useState, useRef, useEffect } from 'react';

export function ModelsList({ models, selectedModelId, onSelectModel, onFileSelect }) {
  const [position, setPosition] = useState({ 
    x: typeof window !== 'undefined' ? window.innerWidth - 320 : 100, 
    y: 20 
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const controlsRef = useRef(null);

  if (models.length === 0) return null;

  // Обработчики для перетаскивания
  const handleMouseDown = (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'LABEL') return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  return (
    <div 
      ref={controlsRef}
      className="fixed p-3 border rounded-lg shadow-lg backdrop-blur-sm"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        backgroundColor: 'rgba(30, 30, 40, 0.85)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        color: '#e2e2e2',
        cursor: isDragging ? 'grabbing' : 'default',
        zIndex: 1000,
        minWidth: '260px',
        maxWidth: '300px',
        maxHeight: '400px',
        overflowY: 'auto'
      }}
      onMouseDown={handleMouseDown}
    >
      <h3 
        className="font-medium text-lg mb-2 pb-1 border-b border-gray-600 select-none"
        style={{ cursor: 'grab', userSelect: 'none' }}
      >
        Загруженные модели
      </h3>
      
      <div className="flex flex-col gap-2 mb-3">
        {models.map(model => (
          <div 
            key={model.id} 
            className={`p-2 rounded cursor-pointer transition-colors ${
              selectedModelId === model.id 
                ? 'bg-blue-600/70 border border-blue-400' 
                : 'bg-gray-700/50 hover:bg-gray-600/70 border border-gray-600'
            }`}
            onClick={() => onSelectModel(model.id)}
          >
            <div className="text-sm font-medium truncate">{model.fileName}</div>
          </div>
        ))}
      </div>
      
      <label 
        className="block w-full px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded 
                 text-center text-sm cursor-pointer transition-colors"
      >
        Добавить модели
        <input 
          type="file" 
          accept=".glb,.gltf" 
          className="hidden" 
          onChange={onFileSelect}
          multiple
        />
      </label>
    </div>
  );
}
