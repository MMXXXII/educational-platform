import React, { useState, useRef, useEffect } from 'react';
import {
    Engine,
    Scene,
    Vector3,
    ArcRotateCamera,
    HemisphericLight,
    MeshBuilder,
    DirectionalLight,
    Color3,
    StandardMaterial,
    Texture,
    ActionManager,
    ExecuteCodeAction,
    PointerEventTypes,
    HighlightLayer,
    UtilityLayerRenderer,
} from '@babylonjs/core';
import * as MATERIALS from '@babylonjs/materials'

// Конфигурация редактора
const GRID_SIZE = 20; // Размер сетки
const CELL_SIZE = 1; // Размер клетки сетки
const SAVE_PREFIX = 'level_editor_'; // Префикс для сохранения сцен в localStorage

// ==== ADDED FOR TILE EDITOR INTEGRATION ==== 
// Singleton для хранения текущей сцены и её доступа из внешних компонентов
let currentSceneInstance = null;
// ===========================================

export function EditorPanel({ initialSceneData = null }) { // old: export function EditorPanel (){
    // Состояния
    const [selectedAsset, setSelectedAsset] = useState('cube'); // Куб по умолчанию
    const selectedAssetRef = useRef('cube'); // Ref для доступа к текущему значению в обработчиках событий

    const [assetList, setAssetList] = useState([
        { id: 'cube', type: 'primitive', name: 'Куб' },
        { id: 'sphere', type: 'primitive', name: 'Сфера' },
        { id: 'cylinder', type: 'primitive', name: 'Цилиндр' },
        { id: 'player', type: 'special', name: 'Игрок' },
        { id: 'exit', type: 'special', name: 'Выход' }
    ]);
    const [savedLevels, setSavedLevels] = useState([]);
    const [currentLevelName, setCurrentLevelName] = useState('');
    const [notification, setNotification] = useState(null);
    const [editMode, setEditMode] = useState('place'); // 'place', 'move', 'rotate', 'delete'

    // Ссылки
    const canvasRef = useRef(null);
    const engineRef = useRef(null);
    const sceneRef = useRef(null);
    const gridRef = useRef(null);
    const selectedMeshRef = useRef(null);
    const editModeRef = useRef('place');

    const highlightLayerRef = useRef(null);
    const ghostMeshRef = useRef(null);
    const utilLayerRef = useRef(null);
    const placementBoxRef = useRef(null);

    // Показать уведомление
    const showNotification = (message, type = 'info') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    // Инициализация сцены
    useEffect(() => {
        if (!canvasRef.current) return;

        // Создание движка и сцены
        const engine = new Engine(canvasRef.current, true, { preserveDrawingBuffer: true, stencil: true });
        engineRef.current = engine;

        const scene = new Scene(engine);
        sceneRef.current = scene;

        // ==== ADDED FOR TILE EDITOR INTEGRATION ====
        // Сохраняем текущую сцену для статичного доступа
        currentSceneInstance = {
            scene,
            serializeScene,
            clearScene
        };

        // Сделать сцену доступной глобально для TileEditorPage
        if (typeof window !== 'undefined') {
            window.currentSceneInstance = currentSceneInstance;
        }
        // ===========================================

        // Настройка камеры
        const camera = new ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 3, 20, new Vector3(GRID_SIZE / 2, 0, GRID_SIZE / 2), scene);
        camera.attachControl(canvasRef.current, true);
        camera.lowerRadiusLimit = 5;
        camera.upperRadiusLimit = 40;
        camera.setTarget(new Vector3(0, 0, 0));

        // Создание освещения
        const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
        light.intensity = 0.7;

        const dirLight = new DirectionalLight("dirLight", new Vector3(-1, -2, -1), scene);
        dirLight.position = new Vector3(GRID_SIZE, 10, GRID_SIZE);
        dirLight.intensity = 0.5;

        // Создание сетки
        createGrid(scene);

        // Создание слоя подсветки для граней
        const highlightLayer = new HighlightLayer("highlightLayer", scene);
        highlightLayerRef.current = highlightLayer;

        // Создание утилитарного слоя для призрачных объектов
        const utilLayer = new UtilityLayerRenderer(scene);
        utilLayerRef.current = utilLayer;

        // Создаем видимый бокс для отображения места размещения
        createPlacementBox(scene);

        // Создание плоскости для позиционирования
        const positioningPlane = MeshBuilder.CreateGround("positioningPlane", { width: GRID_SIZE, height: GRID_SIZE }, scene);
        positioningPlane.visibility = 0.0; // Невидимый, но с коллизиями
        positioningPlane.isPickable = true;

        // Обработка движения указателя для подсветки граней
        scene.onPointerObservable.add((pointerInfo) => {
            // При движении мыши
            //console.log(editModeRef.current);
            if (pointerInfo.type === PointerEventTypes.POINTERMOVE && editModeRef.current === 'place') {
                updatePlacementIndicator(scene, pointerInfo);
            }

            // При клике
            if (pointerInfo.type === PointerEventTypes.POINTERDOWN) {
                // Если видимый индикатор размещения существует и мы в режиме размещения
                if (placementBoxRef.current && placementBoxRef.current.isVisible && editModeRef.current === 'place') {
                    placeAssetAtIndicatorPosition();
                    return;
                }
            }
        });

        // Создание skybox
        createSkybox(scene);

        // Загрузка сохраненных уровней
        loadSavedLevelList();

        // ==== ADDED FOR TILE EDITOR INTEGRATION ====
        // Если есть начальные данные сцены, загружаем их
        if (initialSceneData) {
            try {
                deserializeScene(initialSceneData);
            } catch (e) {
                console.error("Error loading initial scene data:", e);
            }
        }
        // ===========================================

        // Цикл рендеринга
        engine.runRenderLoop(() => {
            scene.render();
        });

        // Обработка изменения размера окна
        window.addEventListener('resize', () => {
            engine.resize();
        });

        return () => {
            window.removeEventListener('resize', () => {
                engine.resize();
            });
            // ==== ADDED FOR TILE EDITOR INTEGRATION ====
            currentSceneInstance = null; // При размонтировании очищаем singleton
            // ===========================================
            engine.dispose();
        };
        // ADDED FOR TILE EDITOR INTEGRATION, old:   }, []);
    }, [initialSceneData]);

    useEffect(() => {
        editModeRef.current = editMode;
    }, [editMode]);


    // Создание сетки
    const createGrid = (scene) => {
        const grid = MeshBuilder.CreateGround("grid", { width: GRID_SIZE, height: GRID_SIZE }, scene);
        grid.position.x -= 0.5;
        grid.position.y -= 0.5;
        grid.position.z -= 0.5;

        const gridMaterial = new MATERIALS.GridMaterial('gridMaterial', scene);
        gridMaterial.majorUnitFrequency = 5
        gridMaterial.minorUnitVisibility = 0.45
        gridMaterial.gridRatio = 1
        gridMaterial.mainColor = new Color3(0.6, 0.6, 0.6)
        gridMaterial.lineColor = new Color3(0.8, 0.8, 0.8)
        gridMaterial.opacity = 0.98
        grid.material = gridMaterial;
        grid.receiveShadows = true;

        grid.position.y -= 0.01; // Немного опускаем сетку, чтобы избежать z-fighting

        gridRef.current = grid;

        return grid;
    };

    // Создание индикатора размещения (подсвечиваемый контуром куб)
    const createPlacementBox = (scene) => {
        // Создаем прозрачный куб для отображения места размещения
        const placementBox = MeshBuilder.CreateBox("placementBox", { size: CELL_SIZE }, scene);

        // Создаем материал для рамки размещения
        const boxMaterial = new StandardMaterial("placementBoxMaterial", scene);
        boxMaterial.diffuseColor = new Color3(0.2, 0.8, 0.2);
        boxMaterial.alpha = 0.3; // Прозрачный куб
        boxMaterial.emissiveColor = new Color3(0.1, 0.6, 0.1); // Светится
        boxMaterial.wireframe = false;
        placementBox.material = boxMaterial;

        // Скрываем его изначально
        placementBox.isVisible = false;

        // Добавляем его в ссылку
        placementBoxRef.current = placementBox;

        return placementBox;
    };

    // Обновление индикатора размещения при движении мыши
    const updatePlacementIndicator = (scene, pointerInfo) => {
        if (!scene || editModeRef.current !== 'place' || !selectedAssetRef.current) return;

        // Выполняем пикинг для определения, на что наведен курсор
        const pickResult = scene.pick(scene.pointerX, scene.pointerY);

        if (!pickResult.hit) {
            // Если не попали ни по чему, скрываем индикатор
            if (placementBoxRef.current) {
                placementBoxRef.current.isVisible = false;
            }
            return;
        }

        const pickedMesh = pickResult.pickedMesh;
        const hitPoint = pickResult.pickedPoint;

        if (pickedMesh.name === "skybox") {
            placementBoxRef.current.isVisible = false;
        }

        // Кликнули на плоскость или на другой объект
        if (pickedMesh && pickedMesh.name === "positioningPlane") {
            // Размещение на базовой плоскости
            const x = Math.floor(hitPoint.x / CELL_SIZE + 0.5) * CELL_SIZE;
            const z = Math.floor(hitPoint.z / CELL_SIZE + 0.5) * CELL_SIZE;

            // Показываем куб на позиции размещения
            if (placementBoxRef.current) {
                placementBoxRef.current.position = new Vector3(x, 0, z);
                placementBoxRef.current.isVisible = true;
            }
        }
        // Размещение рядом с существующим объектом
        else if (pickedMesh && !["grid", "positioningPlane", "skybox", "placementBox"].includes(pickedMesh.name)) {
            // Получаем нормаль к поверхности в точке клика
            const normal = pickResult.getNormal(true);

            if (normal) {
                // Определяем доминирующую ось нормали для выравнивания по сетке
                const roundedNormal = new Vector3(
                    Math.abs(normal.x) > 0.5 ? Math.sign(normal.x) : 0,
                    Math.abs(normal.y) > 0.5 ? Math.sign(normal.y) : 0,
                    Math.abs(normal.z) > 0.5 ? Math.sign(normal.z) : 0
                );

                // Получаем позицию кликнутого объекта
                const clickedObjectPos = pickedMesh.position.clone();

                // Вычисляем позицию для индикатора размещения
                // Начинаем с позиции объекта и добавляем смещение по нормали
                const newPos = clickedObjectPos.clone();

                // Добавляем смещение по нормали
                newPos.x += roundedNormal.x * CELL_SIZE;
                newPos.y += roundedNormal.y * CELL_SIZE;
                newPos.z += roundedNormal.z * CELL_SIZE;

                // Выравниваем по сетке
                const x = Math.round(newPos.x / CELL_SIZE) * CELL_SIZE;
                const y = Math.round(newPos.y / CELL_SIZE) * CELL_SIZE;
                const z = Math.round(newPos.z / CELL_SIZE) * CELL_SIZE;

                // Обновляем позицию индикатора
                if (placementBoxRef.current) {
                    placementBoxRef.current.position = new Vector3(x, y, z);
                    placementBoxRef.current.isVisible = true;

                    // Изменяем цвет в зависимости от типа грани
                    const boxMaterial = placementBoxRef.current.material;
                    if (roundedNormal.y === 1) {
                        // Верхняя грань - зеленый
                        boxMaterial.diffuseColor = new Color3(0.2, 0.8, 0.2);
                        boxMaterial.emissiveColor = new Color3(0.1, 0.6, 0.1);
                    } else if (roundedNormal.y === -1) {
                        // Нижняя грань - красный
                        boxMaterial.diffuseColor = new Color3(0.8, 0.2, 0.2);
                        boxMaterial.emissiveColor = new Color3(0.6, 0.1, 0.1);
                    } else {
                        // Боковая грань - синий
                        boxMaterial.diffuseColor = new Color3(0.2, 0.2, 0.8);
                        boxMaterial.emissiveColor = new Color3(0.1, 0.1, 0.6);
                    }
                }

                // Подсвечиваем выбранную грань
                highlightFace(pickedMesh, normal);
            }
        }
    };

    // Подсветка выбранной грани объекта
    const highlightFace = (mesh, normal) => {
        // Очищаем предыдущую подсветку
        if (highlightLayerRef.current) {
            highlightLayerRef.current.removeAllMeshes();
        }

        // Если нет нормали или это не объект сцены, выходим
        if (!normal || !mesh || ["grid", "positioningPlane", "skybox", "placementBox"].includes(mesh.name)) {
            return;
        }

        // Подсвечиваем весь объект с меньшей интенсивностью
        highlightLayerRef.current.addMesh(mesh, new Color3(0.3, 0.3, 1.0), false);
    };

    // Размещение объекта на позиции индикатора
    const placeAssetAtIndicatorPosition = () => {
        if (!placementBoxRef.current || !placementBoxRef.current.isVisible) return;

        const position = placementBoxRef.current.position.clone();
        placeAsset(position.x, position.y, position.z);

        // Скрываем индикатор после размещения
        placementBoxRef.current.isVisible = false;
    };

    // Создание skybox
    const createSkybox = (scene) => {
        const skybox = MeshBuilder.CreateBox("skybox", { size: 1000 }, scene);
        const skyboxMaterial = new StandardMaterial("skyboxMaterial", scene);
        skyboxMaterial.backFaceCulling = false;

        skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
        skyboxMaterial.specularColor = new Color3(0, 0, 0);
        skyboxMaterial.emissiveColor = new Color3(0.2, 0.5, 0.8);

        skybox.material = skyboxMaterial;

        return skybox;
    };

    // Размещение выбранного ассета на сцене
    const placeAsset = (x, y, z) => {
        // Используем ref для получения актуального значения
        const currentAsset = selectedAssetRef.current;

        //console.log("Функция placeAsset вызвана с параметрами:", { x, y, z, selectedAsset: currentAsset });

        if (!currentAsset) {
            console.error("Ассет не выбран!");
            showNotification("Сначала выберите объект для размещения", "error");
            return;
        }

        if (!sceneRef.current) {
            console.error("Сцена не инициализирована!");
            return;
        }

        let mesh;

        try {
            // Создание различных примитивов
            switch (currentAsset) {
                case 'cube':
                    mesh = MeshBuilder.CreateBox("cube_" + Date.now(), { size: CELL_SIZE }, sceneRef.current);
                    mesh.material = new StandardMaterial("cubeMaterial", sceneRef.current);
                    mesh.material.diffuseColor = new Color3(0.4, 0.4, 0.8);
                    break;
                case 'sphere':
                    mesh = MeshBuilder.CreateSphere("sphere_" + Date.now(), { diameter: CELL_SIZE }, sceneRef.current);
                    mesh.material = new StandardMaterial("sphereMaterial", sceneRef.current);
                    mesh.material.diffuseColor = new Color3(0.8, 0.4, 0.4);
                    break;
                case 'cylinder':
                    mesh = MeshBuilder.CreateCylinder("cylinder_" + Date.now(), { diameter: CELL_SIZE, height: CELL_SIZE }, sceneRef.current);
                    mesh.material = new StandardMaterial("cylinderMaterial", sceneRef.current);
                    mesh.material.diffuseColor = new Color3(0.4, 0.8, 0.4);
                    break;
                case 'player':
                    // Уникальный игровой объект, удаляем предыдущего игрока, если он есть
                    const existingPlayer = sceneRef.current.getMeshByName("player");
                    if (existingPlayer) {
                        existingPlayer.dispose();
                    }

                    mesh = MeshBuilder.CreateSphere("player", { diameter: 0.8 }, sceneRef.current);
                    const playerMaterial = new StandardMaterial("playerMaterial", sceneRef.current);
                    playerMaterial.diffuseColor = new Color3(0, 0, 1); // Синий цвет для игрока
                    mesh.material = playerMaterial;

                    // Добавляем маркер, чтобы показать направление движения игрока
                    const playerDirection = MeshBuilder.CreateCylinder("playerDirection", { diameter: 0.2, height: 0.5 }, sceneRef.current);
                    playerDirection.parent = mesh;
                    playerDirection.position.x = 0.4;

                    const directionMaterial = new StandardMaterial("directionMaterial", sceneRef.current);
                    directionMaterial.diffuseColor = new Color3(1, 0, 0); // Красный маркер направления
                    playerDirection.material = directionMaterial;
                    break;
                case 'exit':
                    // Уникальный объект выхода, удаляем предыдущий выход, если он есть
                    const existingExit = sceneRef.current.getMeshByName("exit");
                    if (existingExit) {
                        existingExit.dispose();
                    }

                    mesh = MeshBuilder.CreateBox("exit", { size: CELL_SIZE }, sceneRef.current);
                    const exitMaterial = new StandardMaterial("exitMaterial", sceneRef.current);
                    exitMaterial.diffuseColor = new Color3(0, 1, 0); // Зеленый цвет для выхода
                    exitMaterial.alpha = 0.7; // Прозрачность
                    mesh.material = exitMaterial;
                    break;
                default:
                    console.error(`Неизвестный тип ассета: ${currentAsset}`);
                    showNotification(`Неизвестный тип ассета: ${currentAsset}`, "error");
                    return;
            }

            // Устанавливаем позицию
            mesh.position = new Vector3(x, y, z);

            // Добавляем метаданные для сериализации
            mesh.metadata = {
                type: currentAsset,
                isInteractable: currentAsset === 'player' || currentAsset === 'exit'
            };

            // Делаем объект выбираемым
            mesh.isPickable = true;

            // Добавляем обработчик для выбора объекта
            mesh.actionManager = new ActionManager(sceneRef.current);
            mesh.actionManager.registerAction(
                new ExecuteCodeAction(
                    ActionManager.OnPickTrigger,
                    (evt) => {
                        if (editModeRef.current !== 'place') {
                            handleObjectPick(mesh);
                        }
                    }
                )
            );

            //console.log(`Объект ${currentAsset} размещен на позиции:`, mesh.position);
            //showNotification(`Объект ${currentAsset} размещен`, "success");

            // Скрываем индикатор размещения
            if (placementBoxRef.current) {
                placementBoxRef.current.isVisible = false;
            }

            return mesh;
        } catch (error) {
            //console.error("Ошибка при размещении объекта:", error);
            //showNotification("Ошибка при размещении объекта", "error");
            return null;
        }
    };

    // Обработка выбора объекта
    const handleObjectPick = (mesh) => {
        // Если режим удаления, удаляем объект
        if (editModeRef.current === 'delete') {
            deleteObject(mesh);
            return;
        }

        // Снимаем выделение с предыдущего объекта
        if (selectedMeshRef.current) {
            if (selectedMeshRef.current.material) {
                selectedMeshRef.current.material.emissiveColor = new Color3(0, 0, 0);
            }
            if (highlightLayerRef.current) {
                highlightLayerRef.current.removeMesh(selectedMeshRef.current);
            }
        }

        // Выделяем новый объект
        selectedMeshRef.current = mesh;

        if (mesh && mesh.material) {
            // Подсветка выбранного объекта
            mesh.material.emissiveColor = new Color3(0.5, 0.5, 0.5);

            // Добавляем объект в слой подсветки
            if (highlightLayerRef.current) {
                highlightLayerRef.current.addMesh(mesh, new Color3(1, 0.6, 0.1));
            }
        }
    };


    // Удаление объекта
    const deleteObject = (mesh) => {
        if (!mesh || mesh.name === "grid" || mesh.name === "positioningPlane" || mesh.name === "skybox") return;

        if (selectedMeshRef.current === mesh) {
            selectedMeshRef.current = null;
        }

        // Удаляем подсветку, если она есть
        if (highlightLayerRef.current) {
            highlightLayerRef.current.removeMesh(mesh);
        }

        mesh.dispose();
    };

    // Сериализация сцены
    const serializeScene = () => {
        if (!sceneRef.current) return null;

        const serializedObjects = [];

        sceneRef.current.meshes.forEach(mesh => {
            // Пропускаем служебные объекты
            if (mesh.name === "grid" || mesh.name === "positioningPlane" || mesh.name === "skybox" || mesh.name === "placementBox") {
                return;
            }

            // Сериализуем только основные данные объекта
            const objectData = {
                id: 'map_' + mesh.name,
                type: mesh.metadata?.type || 'unknown',
                metadata: mesh.metadata || {},
                transform: {
                    position: {
                        x: mesh.position.x,
                        y: mesh.position.y,
                        z: mesh.position.z
                    },
                    rotation: {
                        x: mesh.rotation.x,
                        y: mesh.rotation.y,
                        z: mesh.rotation.z
                    },
                    scaling: {
                        x: mesh.scaling.x,
                        y: mesh.scaling.y,
                        z: mesh.scaling.z
                    },
                },
            };

            serializedObjects.push(objectData);
        });

        return {
            version: "1.0",
            timestamp: Date.now(),
            //gridSize: GRID_SIZE,
            //cellSize: CELL_SIZE,
            models: serializedObjects,
        };
    };

    // Десериализация сцены
    const deserializeScene = (data) => {
        if (!sceneRef.current || !data || !data.models) return;

        // Очищаем сцену перед загрузкой
        clearScene();

        // Устанавливаем размер сетки, если он указан
        if (data.gridSize && data.gridSize !== GRID_SIZE) {
            // В реальном приложении здесь нужно перестроить сетку с новым размером
            //console.log(`Размер сетки в файле (${data.gridSize}) отличается от текущего (${GRID_SIZE})`);
        }

        // Загружаем объекты
        data.models.forEach(obj => {
            let mesh;
            //console.log(obj);

            // Создаем объект на основе его типа
            switch (obj.type) {
                case 'cube':
                    mesh = MeshBuilder.CreateBox(obj.id, { size: CELL_SIZE }, sceneRef.current);
                    const cubeMaterial = new StandardMaterial("cubeMaterial", sceneRef.current);
                    cubeMaterial.diffuseColor = new Color3(0.4, 0.4, 0.8);
                    mesh.material = cubeMaterial;
                    break;
                case 'sphere':
                    mesh = MeshBuilder.CreateSphere(obj.id, { diameter: CELL_SIZE }, sceneRef.current);
                    const sphereMaterial = new StandardMaterial("sphereMaterial", sceneRef.current);
                    sphereMaterial.diffuseColor = new Color3(0.8, 0.4, 0.4);
                    mesh.material = sphereMaterial;
                    break;
                case 'cylinder':
                    mesh = MeshBuilder.CreateCylinder(obj.id, { diameter: CELL_SIZE, height: CELL_SIZE }, sceneRef.current);
                    const cylinderMaterial = new StandardMaterial("cylinderMaterial", sceneRef.current);
                    cylinderMaterial.diffuseColor = new Color3(0.4, 0.8, 0.4);
                    mesh.material = cylinderMaterial;
                    break;
                case 'player':
                    mesh = MeshBuilder.CreateSphere(obj.id, { diameter: 0.8 }, sceneRef.current);

                    const playerMaterial = new StandardMaterial("playerMaterial", sceneRef.current);
                    playerMaterial.diffuseColor = new Color3(0, 0, 1);
                    mesh.material = playerMaterial;

                    // Добавляем маркер направления
                    const playerDirection = MeshBuilder.CreateCylinder("playerDirection", { diameter: 0.2, height: 0.5 }, sceneRef.current);
                    playerDirection.parent = mesh;
                    playerDirection.position.x = 0.4;

                    const directionMaterial = new StandardMaterial("directionMaterial", sceneRef.current);
                    directionMaterial.diffuseColor = new Color3(1, 0, 0);
                    playerDirection.material = directionMaterial;
                    break;
                case 'exit':
                    mesh = MeshBuilder.CreateBox(obj.id, { size: CELL_SIZE }, sceneRef.current);

                    const exitMaterial = new StandardMaterial("exitMaterial", sceneRef.current);
                    exitMaterial.diffuseColor = new Color3(0, 1, 0);
                    exitMaterial.alpha = 0.7;
                    mesh.material = exitMaterial;
                    break;
                default:
                    console.warn(`Неизвестный тип объекта: ${obj.type}`);
                    return;
            }

            // Устанавливаем позицию и поворот
            if (obj.transform.position) {
                mesh.position = new Vector3(obj.transform.position.x, obj.transform.position.y, obj.transform.position.z);
            }

            if (obj.transform.rotation) {
                mesh.rotation = new Vector3(obj.transform.rotation.x, obj.transform.rotation.y, obj.transform.rotation.z);
            }

            if (obj.transform.scaling) {
                mesh.scaling = new Vector3(obj.transform.scaling.x, obj.transform.scaling.y, obj.transform.scaling.z);
            }

            mesh.metadata = obj.metadata;

            // Делаем объект выбираемым
            mesh.isPickable = true;

            // Добавляем обработчик выбора
            mesh.actionManager = new ActionManager(sceneRef.current);
            mesh.actionManager.registerAction(
                new ExecuteCodeAction(
                    ActionManager.OnPickTrigger,
                    (evt) => {
                        handleObjectPick(mesh);
                    }
                )
            );
        });

        showNotification("Уровень успешно загружен", "success");
    };

    // Очистка сцены
    const clearScene = () => {
        if (!sceneRef.current) return;

        // Находим все объекты, кроме служебных
        const meshesToRemove = sceneRef.current.meshes.filter(mesh =>
            mesh.name !== "grid" &&
            mesh.name !== "positioningPlane" &&
            mesh.name !== "skybox" &&
            mesh.name !== "placementBox"
        );

        // Удаляем все найденные объекты
        meshesToRemove.forEach(mesh => {
            mesh.dispose();
        });

        selectedMeshRef.current = null;

        // Очищаем подсветку
        if (highlightLayerRef.current) {
            highlightLayerRef.current.removeAllMeshes();
        }

        // Скрываем индикатор размещения
        if (placementBoxRef.current) {
            placementBoxRef.current.isVisible = false;
        }
    };

    // Сохранение текущего уровня
    const saveCurrentLevel = () => {
        if (!currentLevelName) {
            showNotification("Укажите имя уровня для сохранения", "error");
            return;
        }

        try {
            const serializedScene = serializeScene();
            if (!serializedScene) {
                showNotification("Ошибка сериализации сцены", "error");
                return;
            }

            const key = SAVE_PREFIX + currentLevelName;
            localStorage.setItem(key, JSON.stringify(serializedScene));

            showNotification(`Уровень "${currentLevelName}" успешно сохранен`, "success");
            loadSavedLevelList();
        } catch (error) {
            console.error("Ошибка сохранения уровня:", error);
            showNotification("Не удалось сохранить уровень", "error");
        }
    };

    // Загрузка списка сохраненных уровней
    const loadSavedLevelList = () => {
        const levels = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);

            if (key.startsWith(SAVE_PREFIX)) {
                try {
                    const levelData = JSON.parse(localStorage.getItem(key));
                    const levelName = key.substring(SAVE_PREFIX.length);

                    levels.push({
                        name: levelName,
                        timestamp: levelData.timestamp || 0,
                        objectCount: levelData.objects?.length || 0
                    });
                } catch (error) {
                    console.warn(`Ошибка при загрузке данных уровня ${key}:`, error);
                }
            }
        }

        // Сортировка по времени создания (сначала новые)
        levels.sort((a, b) => b.timestamp - a.timestamp);

        setSavedLevels(levels);
    };

    // Загрузка выбранного уровня
    const loadLevel = (levelName) => {
        try {
            const key = SAVE_PREFIX + levelName;
            const levelDataString = localStorage.getItem(key);

            if (!levelDataString) {
                showNotification(`Уровень "${levelName}" не найден`, "error");
                return;
            }

            const levelData = JSON.parse(levelDataString);
            deserializeScene(levelData);

            setCurrentLevelName(levelName);
        } catch (error) {
            console.error("Ошибка загрузки уровня:", error);
            showNotification("Не удалось загрузить уровень", "error");
        }
    };

    // Удаление выбранного уровня
    const deleteLevel = (levelName) => {
        if (window.confirm(`Вы действительно хотите удалить уровень "${levelName}"?`)) {
            try {
                const key = SAVE_PREFIX + levelName;
                localStorage.removeItem(key);

                showNotification(`Уровень "${levelName}" удален`, "info");
                loadSavedLevelList();

                if (currentLevelName === levelName) {
                    setCurrentLevelName('');
                }
            } catch (error) {
                console.error("Ошибка удаления уровня:", error);
                showNotification("Не удалось удалить уровень", "error");
            }
        }
    };

    // Экспорт уровня в файл
    const exportLevelToFile = () => {
        try {
            const serializedScene = serializeScene();
            if (!serializedScene) {
                showNotification("Ошибка сериализации сцены", "error");
                return;
            }

            const fileName = (currentLevelName || "level") + ".json";
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(serializedScene, null, 2));

            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", fileName);
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();

            showNotification(`Уровень экспортирован в файл ${fileName}`, "success");
        } catch (error) {
            console.error("Ошибка экспорта уровня:", error);
            showNotification("Не удалось экспортировать уровень", "error");
        }
    };

    // Загрузка уровня из файла
    const importLevelFromFile = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const levelData = JSON.parse(e.target.result);
                deserializeScene(levelData);

                // Устанавливаем имя уровня из имени файла
                const fileName = file.name.replace(/\.[^/.]+$/, ""); // Удаляем расширение
                setCurrentLevelName(fileName);

                showNotification(`Уровень успешно импортирован из файла ${file.name}`, "success");
            } catch (error) {
                console.error("Ошибка импорта уровня:", error);
                showNotification("Не удалось импортировать уровень. Проверьте формат файла", "error");
            }
        };

        reader.readAsText(file);

        // Сбрасываем значение input, чтобы можно было выбрать тот же файл снова
        event.target.value = null;
    };

    // Функция для рендеринга панели инструментов
    const renderToolbar = () => {
        return (
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 shadow-sm mb-2 flex flex-wrap items-center">
                <div className="flex items-center gap-2 flex-grow sm:flex-grow-0">
                    <button
                        className={`px-3 py-1.5 rounded-md ${editMode === 'place' ? 'bg-blue-600 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white'}`}
                        onClick={() => setEditMode('place') & console.log(editMode)}
                    >
                        Размещение
                    </button>
                    <button
                        className={`px-3 py-1.5 rounded-md ${editMode === 'delete' ? 'bg-red-600 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white'}`}
                        onClick={() => setEditMode('delete') & console.log(editMode)}
                    >
                        Удаление
                    </button>
                </div>

                <div className="ml-auto">
                    <button
                        className="px-4 py-1.5 rounded-md bg-red-600 text-white w-full sm:w-auto min-w-[150px] flex items-center justify-center"
                        onClick={() => {
                            if (window.confirm("Вы действительно хотите очистить сцену?")) {
                                clearScene();
                            }
                        }}
                    >
                        <span>Очистить сцену</span>
                    </button>
                </div>
            </div>
        );
    };

    // Функция для рендеринга панели выбора ассетов
    const renderAssetPanel = () => {
        //console.log("Текущий выбранный ассет:", selectedAsset);

        // Функция для выбора ассета
        const selectAsset = (assetId) => {
            //console.log("Выбираем ассет:", assetId);
            setSelectedAsset(assetId);
            selectedAssetRef.current = assetId; // Обновляем ref для доступа в обработчиках событий
            setEditMode('place');
            showNotification(`Выбран объект: ${assetId}. Наведите на сетку или объект, чтобы увидеть позицию размещения.`, "info");
        };

        return (
            <div className="w-full md:w-64 h-64 md:h-auto overflow-y-auto bg-gray-100 dark:bg-gray-800 p-2 rounded">
                <h3 className="text-lg font-bold mb-2 text-gray-800 dark:text-white">Ассеты</h3>
                <div className="text-yellow-600 dark:text-yellow-300 text-sm mb-3">
                    Выберите объект для размещения:
                </div>
                <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
                    {assetList.map(asset => (
                        <button
                            key={asset.id}
                            className={`p-2 text-left rounded flex items-center
                ${selectedAsset === asset.id
                                    ? 'bg-blue-600 border-2 border-white dark:border-white text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white'}`}
                            onClick={() => selectAsset(asset.id)}
                        >
                            <div className="w-6 h-6 mr-2 flex-shrink-0 bg-blue-800 rounded flex items-center justify-center text-white">
                                {asset.id.charAt(0).toUpperCase()}
                            </div>
                            <span>{asset.name}</span>
                        </button>
                    ))}
                </div>
                <div className="mt-4 p-2 bg-gray-200 dark:bg-gray-700 rounded text-gray-800 dark:text-white">
                    <strong>Текущий выбор:</strong> {selectedAsset ? assetList.find(a => a.id === selectedAsset)?.name || selectedAsset : 'Не выбран'}
                </div>
            </div>
        );
    };

    // Функция для рендеринга панели сохранения/загрузки
    const renderSaveLoadPanel = () => {
        return (
            <div className="w-full md:w-64 bg-gray-100 dark:bg-gray-800 p-2 rounded">
                <h3 className="text-lg font-bold mb-2 text-gray-800 dark:text-white">Сохранение и загрузка</h3>

                <div className="mb-4">
                    <div className="gap-2 flex flex-col mb-2">
                        <input
                            type="text"
                            className="flex-1 px-2 py-1 bg-white dark:bg-gray-700 text-center rounded text-gray-800 dark:text-white"
                            placeholder="Имя уровня"
                            value={currentLevelName}
                            onChange={(e) => setCurrentLevelName(e.target.value)}
                        />
                        <button
                            className="px-3 py-1 bg-green-600 rounded text-white"
                            onClick={saveCurrentLevel}
                        >
                            Сохранить
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <button
                            className="flex-1 px-3 py-1 bg-blue-600 rounded text-white"
                            onClick={exportLevelToFile}
                        >
                            Экспорт
                        </button>

                        <label className="flex-1">
                            <input
                                type="file"
                                accept=".json"
                                className="hidden"
                                onChange={importLevelFromFile}
                            />
                            <span className="block px-3 py-1 bg-blue-600 rounded text-center cursor-pointer text-white">
                                Импорт
                            </span>
                        </label>
                    </div>
                </div>

                <h4 className="font-bold mb-1 text-gray-800 dark:text-white">Сохраненные уровни:</h4>
                {savedLevels.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Нет сохраненных уровней</p>
                ) : (
                    <div className="max-h-40 overflow-y-auto">
                        {savedLevels.map(level => (
                            <div key={level.name} className="flex items-center mb-1">
                                <button
                                    className="flex-1 text-left px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-l hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white"
                                    onClick={() => loadLevel(level.name)}
                                >
                                    {level.name}
                                    <span className="block text-xs text-gray-500 dark:text-gray-400">
                                        {new Date(level.timestamp).toLocaleDateString()} · {level.objectCount} об.
                                    </span>
                                </button>
                                <button
                                    className="px-2 py-1 bg-red-600 rounded-r hover:bg-red-700 text-white"
                                    onClick={() => deleteLevel(level.name)}
                                >
                                    X
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    // Функция для рендеринга уведомления
    const renderNotification = () => {
        if (!notification) return null;

        const bgColor = {
            'info': 'bg-blue-600',
            'success': 'bg-green-600',
            'error': 'bg-red-600',
            'warning': 'bg-yellow-600'
        }[notification.type] || 'bg-blue-600';

        return (
            <div className={`fixed top-4 right-4 px-4 py-2 rounded shadow-lg ${bgColor}`}>
                {notification.message}
            </div>
        );
    };

    // ==== ADDED FOR TILE EDITOR INTEGRATION ====
    return (
        <div className="flex flex-col w-full h-screen overflow-hidden bg-white dark:bg-gray-900">
            {/* Верхняя панель инструментов */}
            {renderToolbar()}

            {/* Основная область */}
            <div className="flex flex-col md:flex-row flex-1 gap-2 overflow-hidden px-3 pb-3">
                {/* Панель выбора ассетов */}
                <div className="md:flex md:flex-col md:w-64 gap-2 overflow-y-auto">
                    {renderAssetPanel()}
                    {renderSaveLoadPanel()}
                </div>

                {/* Область 3D-отображения */}
                <div className="flex-1 bg-gray-200 dark:bg-gray-900 rounded overflow-hidden relative">
                    <canvas ref={canvasRef} className="w-full h-full" />
                </div>
            </div>

            {/* Инструкции по размещению и уведомления должны быть вне основного потока страницы */}
            {renderNotification()}
        </div>
    );
};

// Статический метод для экспорта текущей сцены
EditorPanel.exportScene = () => {
    if (currentSceneInstance && currentSceneInstance.scene) {
        // Вызываем serializeScene через наш singleton
        return currentSceneInstance.serializeScene();
    }
    return null;
};

// Статический метод для очистки сцены
EditorPanel.clearScene = () => {
    if (currentSceneInstance && currentSceneInstance.clearScene) {
        currentSceneInstance.clearScene();
    }
};

export default EditorPanel;
// ===========================================