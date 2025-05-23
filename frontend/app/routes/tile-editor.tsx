import type { Route } from "./+types/editor";
import TileEditorPage from "../tile-editor/EditorPanel.jsx";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Редактор" },
        { name: "description", content: "Создавайте свои карты" },
    ];
}

export default function Editor() {
    return (
        <TileEditorPage />
    );
}
