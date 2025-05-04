import type { Route } from "./+types/profile";
import { UserProfile } from "../profile/UserProfile";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Профиль пользователя" },
        { name: "description", content: "Просматривайте и редактируйте данные своего профиля" },
    ];
}

export default function Profile() {
    return <UserProfile />;
}
