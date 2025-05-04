import type { Route } from "./+types/editor";
import { EditorPanel } from "../editor/EditorPanel";
import { ProtectedRoute } from '../components/ProtectedRoute';

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Редактор" },
        { name: "description", content: "Создавайте свои карты" },
    ];
}

export default function Editor() {
    return (
        <ProtectedRoute requiredRoles={['admin']}>
            <EditorPanel />
        </ProtectedRoute>
    );
}