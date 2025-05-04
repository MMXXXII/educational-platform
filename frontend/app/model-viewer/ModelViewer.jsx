import { useEffect, useRef, useState } from 'react'
import * as BABYLON from '@babylonjs/core'
import * as MATERIALS from '@babylonjs/materials'
import { registerBuiltInLoaders } from '@babylonjs/loaders/dynamic'

// Регистрируем загрузчики моделей BabylonJS
registerBuiltInLoaders()


export function ModelViewer() {
  const canvasRef = useRef(null)
  const engineRef = useRef(null)
  const sceneRef = useRef(null)
  const [modelLoaded, setModelLoaded] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Инициализация сцены BabylonJS
  useEffect(() => {
    if (!canvasRef.current) return

    // Создаем движок и сцену
    const engine = new BABYLON.Engine(canvasRef.current, true)
    engineRef.current = engine
    
    const createScene = () => {
      const scene = new BABYLON.Scene(engine)
      
      // Настройка камеры
      const camera = new BABYLON.ArcRotateCamera(
        'camera', 
        -Math.PI / 2, 
        Math.PI / 2.5, 
        10, 
        new BABYLON.Vector3(0, 0, 0), 
        scene
      )
      camera.attachControl(canvasRef.current, true)
      camera.wheelDeltaPercentage = 0.01
      
      // Добавляем освещение
      const light1 = new BABYLON.HemisphericLight(
        'light1', 
        new BABYLON.Vector3(1, 1, 0), 
        scene
      )
      light1.intensity = 0.7
      
      const light2 = new BABYLON.DirectionalLight(
        'light2', 
        new BABYLON.Vector3(-1, -1, -1), 
        scene
      )
      light2.intensity = 0.5
      
      // Создаем сетку для пола (опционально)
      const ground = BABYLON.MeshBuilder.CreateGround(
        'ground', 
        { width: 10, height: 10 }, 
        scene
      )
      const groundMaterial = new MATERIALS.GridMaterial('groundMaterial', scene)
      groundMaterial.majorUnitFrequency = 5
      groundMaterial.minorUnitVisibility = 0.45
      groundMaterial.gridRatio = 1
      groundMaterial.mainColor = new BABYLON.Color3(0.2, 0.2, 0.2)
      groundMaterial.lineColor = new BABYLON.Color3(0.4, 0.4, 0.4)
      ground.material = groundMaterial
      
      return scene
    }
    
    const scene = createScene()
    sceneRef.current = scene
    
    // Запускаем рендеринг
    engine.runRenderLoop(() => {
      scene.render()
    })
    
    // Обработка изменения размера окна
    const resizeHandler = () => {
      engine.resize()
    }
    window.addEventListener('resize', resizeHandler)
    
    return () => {
      window.removeEventListener('resize', resizeHandler)
      engine.dispose()
    }
  }, [])

  // Загрузка модели .glb
  const loadModel = async (file) => {
    try {
      setErrorMessage('')
      if (!sceneRef.current) return

      // Очистка предыдущей модели если есть
      if (modelLoaded) {
        const meshes = sceneRef.current.meshes.slice()
        meshes.forEach(mesh => {
          if (mesh.name !== 'ground') {
            mesh.dispose()
          }
        })
      }

      // Создаем FileReader для чтения файла как ArrayBuffer
      const reader = new FileReader()
      
      reader.onload = async (event) => {
        try {
          if (!event.target?.result) {
            throw new Error("Не удалось прочитать файл")
          }
          
          // Преобразуем ArrayBuffer в массив uint8
          const content = new Uint8Array(event.target.result)
          const fileName = file.name
          
          // Используем встроенный метод для создания файла с правильным именем
          // это позволит BabylonJS определить тип файла
          const engineBinaryFile = new File([content], fileName, { type: "application/octet-stream" })
          
          // Загружаем модель из файла
          await BABYLON.SceneLoader.ImportMeshAsync(
            "",             // имена мешей (пустая строка = все меши) 
            "file:",        // rootUrl
            engineBinaryFile, // файл
            sceneRef.current // сцена
          )
          
          setModelLoaded(true)
          
          // Центрирование камеры на модели
          if (sceneRef.current.meshes.length > 1) {
            // Получаем все меши кроме земли
            const meshes = sceneRef.current.meshes.filter(mesh => mesh.name !== 'ground')
            if (meshes.length > 0) {
              const camera = sceneRef.current.cameras[0]
              if (camera instanceof BABYLON.ArcRotateCamera) {
                // Вычисляем центр модели
                let minX = Number.MAX_VALUE, minY = Number.MAX_VALUE, minZ = Number.MAX_VALUE
                let maxX = Number.MIN_VALUE, maxY = Number.MIN_VALUE, maxZ = Number.MIN_VALUE
                
                meshes.forEach(mesh => {
                  const boundingBox = mesh.getBoundingInfo().boundingBox
                  minX = Math.min(minX, boundingBox.minimum.x)
                  minY = Math.min(minY, boundingBox.minimum.y)
                  minZ = Math.min(minZ, boundingBox.minimum.z)
                  maxX = Math.max(maxX, boundingBox.maximum.x)
                  maxY = Math.max(maxY, boundingBox.maximum.y)
                  maxZ = Math.max(maxZ, boundingBox.maximum.z)
                })
                
                const center = new BABYLON.Vector3(
                  (minX + maxX) / 2,
                  (minY + maxY) / 2,
                  (minZ + maxZ) / 2
                )
                
                // Устанавливаем целевую точку камеры
                camera.target = center
                
                // Устанавливаем расстояние камеры
                const radius = Math.max(maxX - minX, maxY - minY, maxZ - minZ) * 1.5
                camera.radius = radius
              }
            }
          }
        } catch (error) {
          console.error("Error loading model:", error)
          setErrorMessage('Ошибка загрузки модели. Убедитесь, что это корректный GLB файл.')
        }
      }
      
      reader.onerror = () => {
        setErrorMessage('Ошибка чтения файла.')
      }
      
      // Читаем файл как ArrayBuffer
      reader.readAsArrayBuffer(file)
    } catch (error) {
      console.error("Fatal error:", error)
      setErrorMessage('Произошла непредвиденная ошибка.')
    }
  }

  // Обработчики событий перетаскивания
  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      // Проверка типа файла
      if (file.name.toLowerCase().endsWith('.glb')) {
        loadModel(file)
      } else {
        setErrorMessage('Пожалуйста, загрузите файл формата .glb')
      }
    }
  }

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      if (file.name.toLowerCase().endsWith('.glb')) {
        loadModel(file)
      } else {
        setErrorMessage('Пожалуйста, загрузите файл формата .glb')
      }
    }
  }

  return (
    <div className="flex flex-col items-center w-full h-full">
      <div 
        className={`relative w-full h-96 border-2 border-dashed rounded-lg mb-4
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full"
        />
        
        {!modelLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="text-lg font-medium text-gray-500">
              Перетащите .glb файл сюда
            </div>
            <div className="text-sm text-gray-400 mt-2">
              или
            </div>
            <label className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer pointer-events-auto">
              Выбрать файл
              <input 
                type="file" 
                accept=".glb" 
                className="hidden" 
                onChange={handleFileSelect}
              />
            </label>
          </div>
        )}
        
        {errorMessage && (
          <div className="absolute bottom-2 left-0 right-0 mx-auto text-center text-red-500 bg-red-50 p-2 rounded max-w-md">
            {errorMessage}
          </div>
        )}
      </div>
      
      {modelLoaded && (
        <div className="w-full max-w-md">
          <div className="text-sm text-gray-500 text-center">
            Используйте мышь для вращения модели, колесо для масштабирования
          </div>
          <div className="mt-4 flex justify-center">
            <label className="px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer">
              Загрузить другую модель
              <input 
                type="file" 
                accept=".glb" 
                className="hidden" 
                onChange={handleFileSelect}
              />
            </label>
          </div>
        </div>
      )}
    </div>
  )
}
