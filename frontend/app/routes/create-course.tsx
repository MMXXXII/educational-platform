import type { Route } from "./+types/create-course";
import { CreateCoursePage } from "../create-course/CreateCoursePage";
import { ProtectedRoute } from '../auth/ProtectedRoute';

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Создание курса" },
        { name: "description", content: "Создайте свой образовательный курс" },
    ];
}

export default function Courses() {
    return (
        <ProtectedRoute requiredRoles={['admin', 'teacher']}>
            <CreateCoursePage />
        </ProtectedRoute>
    );
}