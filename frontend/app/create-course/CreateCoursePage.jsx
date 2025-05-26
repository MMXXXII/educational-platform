import { Link } from 'react-router';
import { ArrowLeftIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

import { useCourseForm } from '../hooks/useCourseForm';
import LessonsManager from './LessonsManager';
import CourseFormFields from './CourseFormFields';

export function CreateCoursePage() {
    const {
        // Состояния
        course,
        errors,
        loading,
        categories,
        lessons,
        imagePreview,

        // Обработчики
        handleCourseChange,
        handleImageChange,
        handleRemoveImage,
        handleLessonsUpdate,
        handleSubmit,
        saveCourseDataToStorage
    } = useCourseForm('create');

    return (
        <div className="container mx-auto px-4 sm:px-6 py-8">
            {/* Навигация и заголовок */}
            <div className="flex items-center mb-6">
                <Link to="/" className="mr-4 text-blue-600 hover:text-blue-800">
                    <ArrowLeftIcon className="h-5 w-5" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-800">Создание нового курса</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
                <CourseFormFields
                    course={course}
                    errors={errors}
                    categories={categories}
                    imagePreview={imagePreview}
                    existingImageUrl={null}
                    onCourseChange={handleCourseChange}
                    onImageChange={handleImageChange}
                    onRemoveImage={handleRemoveImage}
                />

                {/* Управление уроками */}
                <div className="mb-8">
                    <LessonsManager
                        initialLessons={lessons}
                        courseId={course.id}
                        onChange={handleLessonsUpdate}
                        onNavigateToEditor={saveCourseDataToStorage}  // обновить здесь
                    />
                    {errors.lessons && (
                        <p className="mt-2 text-sm text-red-500">{errors.lessons}</p>
                    )}
                </div>

                {/* Кнопки действий */}
                <div className="flex flex-col sm:flex-row justify-center sm:justify-end space-y-2 sm:space-y-0 sm:space-x-4">
                    <Link
                        to="/courses"
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-center"
                    >
                        Отмена
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''
                            }`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                                Сохранение...
                            </span>
                        ) : (
                            'Создать курс'
                        )}
                    </button>
                </div>

                {/* Общая ошибка при отправке */}
                {errors.submit && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                        {errors.submit}
                    </div>
                )}
            </form>
        </div>
    );
}