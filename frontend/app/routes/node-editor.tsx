import type { Route } from "./+types/node-editor";
// @ts-ignore
import { NodeEditor } from "../node-editor/NodeEditor";
// @ts-ignore
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