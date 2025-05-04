import { TransformControls } from './TransformControls.jsx'

// Компонент списка моделей
export function ModelsList({ models, selectedModelId, onSelectModel, onModelChange }) {
  if (models.length === 0) return null;
  
  return (
    <div className="w-full">
      <h3 className="font-medium text-lg mb-2">Загруженные модели</h3>
      <div className="flex flex-wrap gap-2">
        {models.map(model => (
          <div 
            key={model.id} 
            className={`p-2 border rounded cursor-pointer ${
              selectedModelId === model.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
            onClick={() => onSelectModel(model.id)}
          >
            <div className="text-sm font-medium">{model.fileName}</div>
          </div>
        ))}
      </div>
      
      {selectedModelId && (
        <div className="mt-4">
          <TransformControls 
            model={models.find(m => m.id === selectedModelId)} 
            onChange={onModelChange} 
          />
        </div>
      )}
    </div>
  );
}

