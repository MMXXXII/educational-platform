import type { Route } from "./+types/tile-editor-old";
// @ts-ignore
import { EditorPanelOld } from "../tile-editor/EditorPanelOld.jsx";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Редактор" },
        { name: "description", content: "Создавайте свои карты" },
    ];
}

export default function Editor() {
    return (
        <EditorPanelOld />
    );
}
