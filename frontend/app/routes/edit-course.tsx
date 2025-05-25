import type { Route } from "./+types/edit-course";
import { EditCoursePage } from "../create-course/EditCoursePage";
import { ProtectedRoute } from '../auth/ProtectedRoute';

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Редактирование курса" },
        { name: "description", content: "Редактирование курса и уроков" },
    ];
}

export default function Courses() {
    return (
        <ProtectedRoute requiredRoles={['admin', 'teacher']}>
            <EditCoursePage />
        </ProtectedRoute>
    );
}