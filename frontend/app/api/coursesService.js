import axios from 'axios';
import config from '../../config';

// Создаем экземпляр axios с базовыми настройками
const apiClient = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Функция для добавления токена авторизации к запросам
const setAuthHeader = (config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
};

// Перехватчик для установки заголовков авторизации
apiClient.interceptors.request.use(setAuthHeader);

// API для работы с курсами
export const coursesApi = {
  // Получение списка курсов с параметрами
  getCourses: async (params = {}) => {
    try {
      const response = await apiClient.get('/courses', { params });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // Создание нового курса
  createCourse: async (courseData, options = {}) => {
    try {
      // Создаем объект FormData для отправки файлов
      const formData = new FormData();

      // Добавляем текстовые поля
      formData.append('title', courseData.title);
      formData.append('description', courseData.description);
      formData.append('longdescription', courseData.longDescription);
      formData.append('difficulty', courseData.difficulty);
      formData.append('category_id', courseData.category_id);

      // Добавляем изображение, если оно есть
      if (courseData.image) {
        formData.append('image', courseData.image);
      }

      // Добавляем уроки, если они есть
      if (courseData.lessons && courseData.lessons.length > 0) {
        formData.append('lessons', JSON.stringify(courseData.lessons));
      }

      // Конфигурация для запроса
      const requestConfig = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };

      // Если передан токен в options, используем его напрямую
      if (options.token) {
        requestConfig.headers['Authorization'] = `Bearer ${options.token}`;
      }

      // Отправляем запрос на endpoint, который принимает FormData
      const response = await apiClient.post('/courses/form', formData, requestConfig);

      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // Получение данных о конкретном курсе
  getCourseById: async (courseId) => {
    try {
      const response = await apiClient.get(`/courses/${courseId}`);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // Получение данных о курсе вместе с уроками
  getCourseWithLessons: async (courseId) => {
    try {
      const response = await apiClient.get(`/courses/${courseId}/with-lessons`);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // Получение популярных курсов
  getPopularCourses: async (limit = 5) => {
    try {
      const response = await apiClient.get('/courses/popular', { params: { limit } });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // Получение недавних курсов
  getRecentCourses: async (limit = 5) => {
    try {
      const response = await apiClient.get('/courses/recent', { params: { limit } });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // Получение рекомендованных курсов
  getRecommendedCourses: async (limit = 5) => {
    try {
      const response = await apiClient.get('/courses/recommended', { params: { limit } });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // Запись на курс
  enrollInCourse: async (courseId) => {
    try {
      const response = await apiClient.post('/courses/enroll', { course_id: courseId });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // Получение записей пользователя на курсы
  getUserEnrollments: async () => {
    try {
      const response = await apiClient.get('/courses/enrollments');
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // Получение курсов пользователя с пагинацией
  getMyCourses: async (page = 1, size = 10) => {
    try {
      const response = await apiClient.get('/courses/my-courses', { params: { page, size } });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // Обновление прогресса прохождения курса
  updateEnrollment: async (enrollmentId, data) => {
    try {
      const response = await apiClient.put(`/courses/enrollments/${enrollmentId}`, data);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // Отмена записи на курс
  unenrollFromCourse: async (enrollmentId) => {
    try {
      await apiClient.delete(`/courses/enrollments/${enrollmentId}`);
      return true;
    } catch (error) {
      handleError(error);
    }
  },

  // Получение прогресса по курсу
  getCourseProgress: async (courseId) => {
    try {
      const response = await apiClient.get(`/courses/${courseId}/progress`);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }
};

// API для работы с категориями
export const categoriesApi = {
  // Получение всех категорий
  getCategories: async () => {
    try {
      const response = await apiClient.get('/courses/categories');
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // Получение категории по ID
  getCategoryById: async (categoryId) => {
    try {
      const response = await apiClient.get(`/courses/categories/${categoryId}`);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }
};

// Функция обработки ошибок
const handleError = (error) => {
  let errorMessage = 'Произошла ошибка при обращении к API';

  if (error.response) {
    // Ответ от сервера был получен с кодом ошибки
    const { status, data } = error.response;

    // Обработка ошибок валидации
    if (status === 422 && data.detail) {
      if (Array.isArray(data.detail)) {
        // Форматируем ошибки валидации в читаемый вид
        errorMessage = data.detail.map(err =>
          `${err.loc.join('.')}: ${err.msg}`
        ).join('; ');
      } else {
        errorMessage = data.detail;
      }
    } else {
      errorMessage = data.detail || `Ошибка сервера: ${status}`;
    }

    // Специфичные сообщения по кодам ошибок
    if (status === 401) {
      errorMessage = 'Требуется авторизация. Пожалуйста, войдите в систему.';
    } else if (status === 403) {
      errorMessage = 'Недостаточно прав для выполнения этой операции.';
    }

    console.error('API Error Response:', status, data);
  } else if (error.request) {
    // Запрос был сделан, но ответ не получен
    errorMessage = 'Нет ответа от сервера. Проверьте подключение к интернету.';
  }

  // Создаем и выбрасываем ошибку с деталями
  const customError = new Error(errorMessage);
  customError.originalError = error;
  throw customError;
};

// Экспорт сгруппированных API
export default {
  courses: coursesApi,
  categories: categoriesApi
};