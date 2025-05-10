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
  const token = localStorage.getItem('accessToken');
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

  // Получение данных о конкретном курсе
  getCourseById: async (courseId) => {
    try {
      const response = await apiClient.get(`/courses/${courseId}`);
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
    errorMessage = data.detail || `Ошибка сервера: ${status}`;
  } else if (error.request) {
    // Запрос был сделан, но ответ не получен
    errorMessage = 'Нет ответа от сервера';
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