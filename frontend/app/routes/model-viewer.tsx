import type { Route } from "./+types/model-viewer";
import { ModelViewer } from "../model-viewer/ModelViewer";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Model Viewer component" },
        { name: "description", content: "View .glb models" },
    ];
}

export default function Viewer() {
    return <ModelViewer />;
}
