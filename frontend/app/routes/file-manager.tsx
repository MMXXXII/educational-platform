import type { Route } from "./+types/file-manager";
// @ts-ignore
import { FileManager } from "../fileManager/FileManager";
// @ts-ignore
import { ProtectedRoute } from '../auth/ProtectedRoute';

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Файловый менеджер" },
        { name: "description", content: "Создавайте, редактируйте и организуйте проекты в удобном файловом менеджере" },
    ];
}

export default function Profile() {
    return (
        <ProtectedRoute requiredRoles={['admin', 'teacher']}>
            <FileManager />
        </ProtectedRoute>
    );
}