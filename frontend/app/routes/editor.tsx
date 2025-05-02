import type { Route } from "./+types/editor";
import { EditorPanel } from "../editor/EditorPanel";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Editor" },
        { name: "description", content: "Edit your maps" },
    ];
}

export default function Editor() {
    return <EditorPanel />;
}
