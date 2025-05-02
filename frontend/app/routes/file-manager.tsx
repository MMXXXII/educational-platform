import type { Route } from "./+types/profile";
import { FileManager } from "../fileManager/FileManager";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Файловый менеджер" },
        { name: "description", content: "Создавайте, редактируйте и организуйте проекты в удобном файловом менеджере." },
    ];
}

export default function Profile() {
    return <FileManager />;
}
