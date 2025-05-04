import type { Route } from "./+types/profile";
import { FileManager } from "../fileManager/FileManager";
import { ProtectedRoute } from '../components/ProtectedRoute';

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Файловый менеджер" },
        { name: "description", content: "Создавайте, редактируйте и организуйте проекты в удобном файловом менеджере." },
    ];
}

export default function Profile() {
    return (
        <ProtectedRoute requiredRoles={['admin']}>
            <FileManager />
        </ProtectedRoute>
    );
}