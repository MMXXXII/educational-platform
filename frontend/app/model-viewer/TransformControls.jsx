// Компонент управления трансформацией модели
export function TransformControls({ model, onChange }) {
  if (!model) return null;
  
  const handleChange = (property, axis, value) => {
    const newValue = parseFloat(value);
    if (isNaN(newValue)) return;
    
    const updatedTransform = {
      ...model.transform,
      [property]: {
        ...model.transform[property],
        [axis]: newValue
      }
    };
    
    onChange(model.id, 'transform', updatedTransform);
  };
  
  return (
    <div className="bg-white p-4 border rounded-lg shadow-md">
      <h3 className="font-medium text-lg mb-2">{model.fileName}</h3>
      
      {/* Позиция */}
      <div className="mb-4">
        <h4 className="font-medium">Позиция</h4>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-sm text-gray-600">X</label>
            <input 
              type="number" 
              value={model.transform.position.x} 
              onChange={(e) => handleChange('position', 'x', e.target.value)} 
              step="0.1"
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Y</label>
            <input 
              type="number" 
              value={model.transform.position.y} 
              onChange={(e) => handleChange('position', 'y', e.target.value)} 
              step="0.1"
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Z</label>
            <input 
              type="number" 
              value={model.transform.position.z} 
              onChange={(e) => handleChange('position', 'z', e.target.value)} 
              step="0.1"
              className="w-full border rounded px-2 py-1"
            />
          </div>
        </div>
      </div>
      
      {/* Вращение */}
      <div className="mb-4">
        <h4 className="font-medium">Вращение (градусы)</h4>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-sm text-gray-600">X</label>
            <input 
              type="number" 
              value={model.transform.rotation.x} 
              onChange={(e) => handleChange('rotation', 'x', e.target.value)} 
              step="15"
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Y</label>
            <input 
              type="number" 
              value={model.transform.rotation.y} 
              onChange={(e) => handleChange('rotation', 'y', e.target.value)} 
              step="15"
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Z</label>
            <input 
              type="number" 
              value={model.transform.rotation.z} 
              onChange={(e) => handleChange('rotation', 'z', e.target.value)} 
              step="15"
              className="w-full border rounded px-2 py-1"
            />
          </div>
        </div>
      </div>
      
      {/* Масштаб */}
      <div className="mb-4">
        <h4 className="font-medium">Масштаб</h4>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-sm text-gray-600">X</label>
            <input 
              type="number" 
              value={model.transform.scaling.x} 
              onChange={(e) => handleChange('scaling', 'x', e.target.value)} 
              step="0.1"
              min="0.1"
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Y</label>
            <input 
              type="number" 
              value={model.transform.scaling.y} 
              onChange={(e) => handleChange('scaling', 'y', e.target.value)} 
              step="0.1"
              min="0.1"
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Z</label>
            <input 
              type="number" 
              value={model.transform.scaling.z} 
              onChange={(e) => handleChange('scaling', 'z', e.target.value)} 
              step="0.1"
              min="0.1"
              className="w-full border rounded px-2 py-1"
            />
          </div>
        </div>
      </div>
      
      {/* Кнопка удаления */}
      <div className="mt-4">
        <button 
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          onClick={() => onChange(model.id, 'delete')}
        >
          Удалить модель
        </button>
      </div>
    </div>
  );
}
