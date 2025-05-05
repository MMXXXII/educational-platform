import { useState, useRef, useEffect } from 'react';

export function TransformControls({ model, onChange }) {
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const controlsRef = useRef(null);
  const activeInputRef = useRef(null);

  if (!model) return null;

  // Функция для безопасного преобразования и округления чисел
  const safeFloat = (value, precision = 6) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : parseFloat(num.toFixed(precision));
  };

  const handleInputClick = (e) => {
    e.target.select();
  };

  const handleChange = (property, axis, value) => {
    const newValue = safeFloat(value);
    const updatedTransform = {
      ...model.transform,
      [property]: {
        ...model.transform[property],
        [axis]: newValue
      }
    };
    onChange(model.id, 'transform', updatedTransform);
  };

  // Обработчик колеса мыши с округлением
  const handleWheel = (e, property, axis) => {
    if (document.activeElement !== e.target) return;
    e.preventDefault();
    
    const step = safeFloat(e.target.step || 1);
    const delta = e.deltaY > 0 ? -step : step;
    const currentValue = safeFloat(e.target.value);
    let newValue = currentValue + delta;
    
    // Ограничения для масштаба
    if (property === 'scaling') {
      newValue = Math.max(0.1, safeFloat(newValue));
    }
    
    // Для вращения нормализуем угол (0-360)
    if (property === 'rotation') {
      newValue = ((newValue % 360) + 360) % 360;
    }
    
    handleChange(property, axis, newValue.toString());
  };

  // Обработчики перетаскивания
  const handleMouseDown = (e) => {
    if (e.target.tagName === 'INPUT') {
      activeInputRef.current = e.target;
      return;
    }
    
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

  // Создаем общий стиль для инпутов
  const inputStyle = "w-full bg-gray-700 border border-gray-600 rounded px-1.5 py-0.5 text-white text-sm focus:border-blue-400 focus:outline-none";
  const inputContainerStyle = "flex items-center space-x-1";

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
        minWidth: '260px'
      }}
      onMouseDown={handleMouseDown}
    >
      <h3 
        className="font-medium text-lg mb-1 pb-1 border-b border-gray-600 select-none"
        style={{ cursor: 'grab', userSelect: 'none' }}
      >
        {model.fileName}
      </h3>
      
      {/* Позиция */}
      <div className="mb-3">
        <h4 className="font-medium text-sm mb-1">Позиция</h4>
        <div className="grid grid-cols-3 gap-1">
          {['x', 'y', 'z'].map((axis) => (
            <div key={`position-${axis}`} className={inputContainerStyle}>
              <label className="block text-xs text-gray-300 mb-0.5 w-4">{axis.toUpperCase()}</label>
              <input 
                type="number" 
                value={model.transform.position[axis]} 
                onChange={(e) => handleChange('position', axis, e.target.value)} 
                onWheel={(e) => handleWheel(e, 'position', axis)}
                onClick={handleInputClick}
                onFocus={handleInputClick}
                step="0.1"
                className={inputStyle}
                style={{ maxWidth: '70px' }}
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Вращение */}
      <div className="mb-3">
        <h4 className="font-medium text-sm mb-1">Вращение</h4>
        <div className="grid grid-cols-3 gap-1">
          {['x', 'y', 'z'].map((axis) => (
            <div key={`rotation-${axis}`} className={inputContainerStyle}>
              <label className="block text-xs text-gray-300 mb-0.5 w-4">{axis.toUpperCase()}</label>
              <input 
                type="number" 
                value={model.transform.rotation[axis]} 
                onChange={(e) => handleChange('rotation', axis, e.target.value)} 
                onWheel={(e) => handleWheel(e, 'rotation', axis)}
                onClick={handleInputClick}
                onFocus={handleInputClick}
                step="15"
                className={inputStyle}
                style={{ maxWidth: '70px' }}
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Масштаб */}
      <div className="mb-3">
        <h4 className="font-medium text-sm mb-1">Масштаб</h4>
        <div className="grid grid-cols-3 gap-1">
          {['x', 'y', 'z'].map((axis) => (
            <div key={`scaling-${axis}`} className={inputContainerStyle}>
              <label className="block text-xs text-gray-300 mb-0.5 w-4">{axis.toUpperCase()}</label>
              <input 
                type="number" 
                value={model.transform.scaling[axis]} 
                onChange={(e) => handleChange('scaling', axis, e.target.value)} 
                onWheel={(e) => handleWheel(e, 'scaling', axis)}
                onClick={handleInputClick}
                onFocus={handleInputClick}
                step="0.1"
                min="0.1"
                className={inputStyle}
                style={{ maxWidth: '70px' }}
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Кнопка удаления */}
      <div className="mt-3 pt-2 border-t border-gray-600">
        <button 
          className="px-2 py-0.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
          onClick={() => onChange(model.id, 'delete')}
        >
          Удалить модель
        </button>
      </div>
    </div>
  );
}
