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
            image, // File объект сохраняется напрямую
            timestamp: Date.now(),
            mode,
            courseId
        };

        await store.put(dataToSave);
        console.log('Course data saved to IndexedDB');
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
                    console.log('Course data loaded from IndexedDB');
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

// Удаление данных из IndexedDB
export const deleteCourseDataFromDB = async (mode = 'create', courseId = null) => {
    try {
        const db = await openDB();
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        const key = mode === 'create' ? 'courseFormBackup' : `editCourseFormBackup_${courseId}`;

        await store.delete(key);
        console.log('Course data deleted from IndexedDB');
        return true;
    } catch (error) {
        console.error('Error deleting from IndexedDB:', error);
        return false;
    }
};

// Очистка старых данных (старше 24 часов)
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
                    resolve();
                }
            };

            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error('Error cleaning up IndexedDB:', error);
    }
};