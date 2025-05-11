import React from 'react';

export function CourseAuthorInfo({ author, authorBio }) {
    return (
        <div className="border-t border-gray-200 pt-6">
            <h3 className="font-semibold text-gray-800 mb-3">Об авторе</h3>
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {author.substring(0, 1)}
                    </div>
                </div>
                <div className="ml-3">
                    <p className="font-medium text-gray-800">{author}</p>
                    <p className="text-sm text-gray-600 mt-1">{authorBio}</p>
                </div>
            </div>
        </div>
    );
}