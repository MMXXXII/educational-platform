import type { Route } from "./+types/tile-editor-scene";
// @ts-ignore
import TileEditorPage from "../tile-editor/TileEditorPage.jsx";

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