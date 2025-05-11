import type { Route } from "./+types/model-viewer";
import { ModelViewer } from "../model-viewer/ModelViewer";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Просмотр 3D‑моделей" },
        { name: "description", content: "Просматривайте .glb модели онлайн" },
    ];
}

export default function Viewer() {
    return <ModelViewer />;
}
