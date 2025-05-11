import React from 'react';

export function CourseDescription({ course }) {
    return (
        <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Об этом курсе</h2>
            <div
                className="text-gray-700"
                dangerouslySetInnerHTML={{ __html: course.longDescription }}
            />
        </div>
    );
}