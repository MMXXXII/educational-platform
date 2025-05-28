import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import config from '../../config';

const CourseFormFields = ({
    course,
    errors,
    categories,
    imagePreview,
    existingImageUrl,
    onCourseChange,
    onImageChange,
    onRemoveImage
}) => {
    const [displayImageUrl, setDisplayImageUrl] = useState('');
    const [isDragging, setIsDragging] = useState(false);

    // Получение URL сервера API из config
    const apiBaseUrl = config.apiUrl || '';

    // Обработка URL изображения
    useEffect(() => {
        if (imagePreview) {
            // Изображение для предварительного просмотра из объекта File (URL blob)
            setDisplayImageUrl(imagePreview);
        } else if (existingImageUrl) {
            // Обработка существующего URL изображения из backend
            let imageUrl = existingImageUrl;

            // Для URL, начинающихся с /static, мы должны получить их через API
            if (imageUrl.startsWith('/static/')) {
                imageUrl = `${apiBaseUrl}/api${imageUrl}`;
            }
            // Для других URL, начинающихся с /, добавитьбазовый URL API
            else if (imageUrl.startsWith('/')) {
                imageUrl = `${apiBaseUrl}${imageUrl}`;
            }

            console.log("CourseFormFields: Using image URL:", imageUrl);
            setDisplayImageUrl(imageUrl);
        } else {
            setDisplayImageUrl('');
        }
    }, [imagePreview, existingImageUrl, apiBaseUrl]);

    // Обработчики для drag-and-drop
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            // Создаем синтетическое событие для обработчика onImageChange
            const event = { target: { files: [file] } };
            onImageChange(event);
        }
    };

    return (
        <>
            {/* Основная информация о курсе */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Информация о курсе</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Название курса */}
                    <div className="col-span-2">
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                            Название курса*
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={course.title}
                            onChange={onCourseChange}
                            className={`w-full px-3 py-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.title && (
                            <p className="mt-1 text-sm text-red-500">{errors.title}</p>
                        )}
                    </div>

                    {/* Краткое описание */}
                    <div className="col-span-2">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Краткое описание*
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={course.description}
                            onChange={onCourseChange}
                            rows="2"
                            placeholder="Краткое описание будет отображаться в каталоге курсов"
                            className={`w-full px-3 py-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.description ? 'border-red-500' : 'border-gray-300'} placeholder-gray-400`}
                        />
                        {errors.description && (
                            <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                        )}
                    </div>

                    {/* Подробное описание */}
                    <div className="col-span-2">
                        <label htmlFor="longDescription" className="block text-sm font-medium text-gray-700 mb-1">
                            Подробное описание*
                        </label>
                        <textarea
                            id="longDescription"
                            name="longDescription"
                            value={course.longDescription}
                            onChange={onCourseChange}
                            rows="6"
                            placeholder="Подробно опишите ваш курс, чему научатся студенты, какие навыки приобретут"
                            className={`w-full px-3 py-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.longDescription ? 'border-red-500' : 'border-gray-300'} placeholder-gray-400`}
                        />
                        {errors.longDescription && (
                            <p className="mt-1 text-sm text-red-500">{errors.longDescription}</p>
                        )}
                    </div>

                    {/* Селекты с уровнем сложности и категорией в колонку на мобильных */}
                    <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Уровень сложности */}
                        <div>
                            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
                                Уровень сложности*
                            </label>
                            <select
                                id="difficulty"
                                name="difficulty"
                                value={course.difficulty}
                                onChange={onCourseChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.difficulty ? 'border-red-500' : 'border-gray-300'} text-black bg-white`}
                            >
                                <option value="" className="text-black">Выберите уровень сложности</option>
                                <option value="начинающий" className="text-black">Начинающий</option>
                                <option value="средний" className="text-black">Средний</option>
                                <option value="продвинутый" className="text-black">Продвинутый</option>
                            </select>
                            {errors.difficulty && (
                                <p className="mt-1 text-sm text-red-500">{errors.difficulty}</p>
                            )}
                        </div>

                        {/* Категория */}
                        <div>
                            <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-2">
                                Категория*
                            </label>
                            <select
                                id="category_id"
                                name="category_id"
                                value={course.category_id}
                                onChange={onCourseChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.category_id ? 'border-red-500' : 'border-gray-300'} text-black bg-white`}
                            >
                                <option value="" className="text-black">Выберите категорию</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id} className="text-black">
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                            {errors.category_id && (
                                <p className="mt-1 text-sm text-red-500">{errors.category_id}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Загрузка изображения */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Изображение курса</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Обложка курса
                        </label>
                        <div
                            className={`w-full px-3 py-6 border-2 border-dashed rounded-lg text-center ${errors.image ? 'border-red-500' : isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                            onDragOver={handleDragOver}
                            onDragEnter={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <input
                                type="file"
                                id="image"
                                name="image"
                                accept="image/*"
                                onChange={onImageChange}
                                className="hidden"
                            />
                            <label htmlFor="image" className="cursor-pointer">
                                <div className="space-y-2">
                                    <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
                                        <PlusIcon className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div className="text-gray-600">
                                        <span className="text-blue-600 font-medium">Нажмите для загрузки</span> или перетащите изображение
                                    </div>
                                    <p className="text-xs text-gray-500">PNG, JPG, GIF до 10MB</p>
                                </div>
                            </label>
                        </div>
                        {errors.image && (
                            <p className="mt-1 text-sm text-red-500">{errors.image}</p>
                        )}
                    </div>

                    {/* Предпросмотр изображения */}
                    <div>
                        {displayImageUrl ? (
                            <div className="relative">
                                <img
                                    src={displayImageUrl}
                                    alt="Предпросмотр"
                                    className="w-full h-64 object-cover rounded-lg"
                                    onError={(e) => {
                                        console.error("Failed to load image:", displayImageUrl);
                                        e.target.style.display = 'none';
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={onRemoveImage}
                                    className="absolute top-2 right-2 bg-white p-1 rounded-full shadow-md"
                                >
                                    <XMarkIcon className="h-5 w-5 text-gray-600" />
                                </button>
                            </div>
                        ) : (
                            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                                <p className="text-gray-500">Предпросмотр изображения</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default CourseFormFields;