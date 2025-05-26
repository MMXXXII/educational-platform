// Утилиты для работы с IndexedDB
const DB_NAME = 'CourseEditorDB';
const DB_VERSION = 1;
const STORE_NAME = 'courseData';

// Проверка поддержки IndexedDB
const isIndexedDBSupported = () => {
    return 'indexedDB' in window;
};


// Открытие/создание базы данных
const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
    });
};

// Сохранение данных курса с изображением
export const saveCourseDataToDB = async (courseData, image, mode = 'create', courseId = null) => {
    if (!isIndexedDBSupported()) {
        console.warn('IndexedDB not supported, data will not be saved');
        return false;
    }
    try {
        const db = await openDB();
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        const key = mode === 'create' ? 'courseFormBackup' : `editCourseFormBackup_${courseId}`;

        const dataToSave = {
            id: key,
            courseData,
            image,
            timestamp: Date.now(),
            mode,
            courseId
        };

        await store.put(dataToSave);
        return true;
    } catch (error) {
        console.error('Error saving to IndexedDB:', error);
        return false;
    }
};

// Загрузка данных курса с изображением
export const loadCourseDataFromDB = async (mode = 'create', courseId = null) => {
    try {
        const db = await openDB();
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);

        const key = mode === 'create' ? 'courseFormBackup' : `editCourseFormBackup_${courseId}`;

        return new Promise((resolve, reject) => {
            const request = store.get(key);

            request.onsuccess = () => {
                const result = request.result;
                if (result) {
                    resolve({
                        courseData: result.courseData,
                        image: result.image,
                        timestamp: result.timestamp
                    });
                } else {
                    resolve(null);
                }
            };

            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error('Error loading from IndexedDB:', error);
        return null;
    }
};

// Сохранение данных сцены
export const saveSceneDataToDB = async (sceneData, lessonIndex = null, mode = 'create', courseId = null) => {
    if (!isIndexedDBSupported()) {
        console.warn('IndexedDB not supported, scene data will not be saved');
        return false;
    }

    try {
        const db = await openDB();
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        // Создаем уникальный ключ для данных сцены
        const key = mode === 'create'
            ? `sceneData${lessonIndex !== null ? `_lesson_${lessonIndex}` : ''}`
            : `editSceneData_${courseId}${lessonIndex !== null ? `_lesson_${lessonIndex}` : ''}`;

        const dataToSave = {
            id: key,
            sceneData,
            lessonIndex,
            mode,
            courseId,
            timestamp: Date.now()
        };

        await store.put(dataToSave);
        return true;
    } catch (error) {
        console.error('Error saving scene data to IndexedDB:', error);
        return false;
    }
};

// Загрузка данных сцены
export const loadSceneDataFromDB = async (lessonIndex = null, mode = 'create', courseId = null) => {
    if (!isIndexedDBSupported()) {
        return null;
    }

    try {
        const db = await openDB();
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);

        const key = mode === 'create'
            ? `sceneData${lessonIndex !== null ? `_lesson_${lessonIndex}` : ''}`
            : `editSceneData_${courseId}${lessonIndex !== null ? `_lesson_${lessonIndex}` : ''}`;

        return new Promise((resolve, reject) => {
            const request = store.get(key);

            request.onsuccess = () => {
                const result = request.result;
                if (result) {
                    resolve({
                        sceneData: result.sceneData,
                        lessonIndex: result.lessonIndex,
                        timestamp: result.timestamp
                    });
                } else {
                    resolve(null);
                }
            };

            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error('Error loading scene data from IndexedDB:', error);
        return null;
    }
};

// Удаление данных сцены
export const deleteSceneDataFromDB = async (lessonIndex = null, mode = 'create', courseId = null) => {
    try {
        const db = await openDB();
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        const key = mode === 'create'
            ? `sceneData${lessonIndex !== null ? `_lesson_${lessonIndex}` : ''}`
            : `editSceneData_${courseId}${lessonIndex !== null ? `_lesson_${lessonIndex}` : ''}`;

        await store.delete(key);
        return true;
    } catch (error) {
        console.error('Error deleting scene data from IndexedDB:', error);
        return false;
    }
};

// Загрузка данных сцены с поддержкой обратной совместимости (localStorage + IndexedDB)
export const loadSceneDataWithFallback = async (lessonIndex = null, mode = 'create', courseId = null) => {
    try {
        const indexedDBData = await loadSceneDataFromDB(lessonIndex, mode, courseId);
        if (indexedDBData) {
            return indexedDBData.sceneData;
        }

        try {
            const localStorageData = localStorage.getItem('savedSceneData');
            if (localStorageData) {
                const parsedData = JSON.parse(localStorageData);

                await saveSceneDataToDB(parsedData, lessonIndex, mode, courseId);

                localStorage.removeItem('savedSceneData');

                return parsedData;
            }
        } catch (error) {
            console.error('Error reading from localStorage during fallback:', error);
        }

        return null;
    } catch (error) {
        console.error('Error in loadSceneDataWithFallback:', error);
        
        try {
            const localStorageData = localStorage.getItem('savedSceneData');
            if (localStorageData) {
                return JSON.parse(localStorageData);
            }
        } catch (e) {
            console.error('Error in localStorage fallback:', e);
        }
        
        return null;
    }
};

// Очистка всех данных сцен (включая localStorage для полной очистки)
export const cleanupAllSceneData = async (mode = 'create', courseId = null) => {
    try {
        const db = await openDB();
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        return new Promise((resolve, reject) => {
            const request = store.openCursor();

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    const data = cursor.value;
                    const isSceneData = data.id.startsWith('sceneData') || data.id.startsWith('editSceneData');

                    // Удаляем данные сцен для указанного режима
                    if (isSceneData && data.mode === mode &&
                        (mode === 'create' || data.courseId === courseId)) {
                        cursor.delete();
                    }
                    cursor.continue();
                } else {
                    // Дополнительно очищаем localStorage
                    localStorage.removeItem('savedSceneData');
                    resolve();
                }
            };

            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error('Error cleaning up scene data:', error);
        // В случае ошибки всё равно очищаем localStorage
        localStorage.removeItem('savedSceneData');
    }
};

// Удаление данных из IndexedDB
export const deleteCourseDataFromDB = async (mode = 'create', courseId = null) => {
    try {
        const db = await openDB();
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        const key = mode === 'create' ? 'courseFormBackup' : `editCourseFormBackup_${courseId}`;

        await store.delete(key);
        return true;
    } catch (error) {
        console.error('Error deleting from IndexedDB:', error);
        return false;
    }
};

// Очистка старых данных
export const cleanupOldData = async () => {
    try {
        const db = await openDB();
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 часа назад

        return new Promise((resolve, reject) => {
            const request = store.openCursor();

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    const data = cursor.value;
                    if (data.timestamp < cutoffTime) {
                        cursor.delete();
                    }
                    cursor.continue();
                } else {
                    // Дополнительно очищаем старые данные из localStorage
                    const itemsToCheck = ['savedSceneData', 'allLessonsBackup', 'currentEditingLesson',
                        'editAllLessonsBackup', 'editCurrentEditingLesson'];

                    itemsToCheck.forEach(item => {
                        const stored = localStorage.getItem(item);
                        if (stored) {
                            try {
                                const parsed = JSON.parse(stored);
                                if (parsed.timestamp && parsed.timestamp < cutoffTime) {
                                    localStorage.removeItem(item);
                                }
                            } catch (e) {
                                // Если не удается парсить или нет timestamp, удаляем для безопасности
                                localStorage.removeItem(item);
                            }
                        }
                    });

                    resolve();
                }
            };

            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error('Error cleaning up IndexedDB:', error);
    }
};