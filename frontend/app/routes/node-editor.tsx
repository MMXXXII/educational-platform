import type { Route } from "./+types/editor";
import { NodeEditor } from "../node-editor/NodeEditor";
import { EditorProvider } from "../contexts/EditorContext";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Визуальная среда программирования" },
        { name: "description", content: "Редактор логических структур" },
    ];
}

export default function Editor() {
    return (
        <EditorProvider>
                <NodeEditor />
        </EditorProvider>
    );
}