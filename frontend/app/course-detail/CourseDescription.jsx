export function CourseDescription({ course }) {
    // В API longdescription вместо longDescription
    const longDescription = course.longDescription || course.longdescription;

    // Если нет длинного описания, не отображаем секцию
    if (!longDescription) {
        return null;
    }

    return (
        <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">Об этом курсе</h2>
            <div
                className="text-gray-700 dark:text-gray-300"
                dangerouslySetInnerHTML={{ __html: longDescription }}
            />
        </div>
    );
}