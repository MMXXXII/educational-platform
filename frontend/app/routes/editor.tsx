import type { Route } from "./+types/editor";
import { EditorPanel } from "../editor/EditorPanel";
import { ProtectedRoute } from '../components/ProtectedRoute';

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Editor" },
        { name: "description", content: "Edit your maps" },
    ];
}

export default function Editor() {
    return (
        <ProtectedRoute requiredRoles={['admin']}>
            <EditorPanel />
        </ProtectedRoute>
    );
}