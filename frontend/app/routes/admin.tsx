import type { Route } from "./+types/admin";
// @ts-ignore
import AdminPanelComponent from "../admin/AdminPanel";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Панель администратора" },
        { name: "description", content: "Управление пользователями системы" },
    ];
}

export default function Admin() {
    return <AdminPanelComponent />;
}