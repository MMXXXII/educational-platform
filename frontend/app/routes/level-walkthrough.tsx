import type { Route } from "./+types/level-walkthrough";
// @ts-ignore
import LevelWalkthrough from '../level-walkthrough/LevelWalkthrough';
// @ts-ignore
import { EditorProvider } from '../contexts/EditorContext';

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Образовательная платформа" },
        { name: "description", content: "Проходи и управляй образовательными курсами" },
    ];
}

export default function LevelEditor3DRoute() {
    return (
        <EditorProvider>
            <LevelWalkthrough />
        </EditorProvider>
    );
}
