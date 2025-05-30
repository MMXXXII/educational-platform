import type { Route } from "./+types/profile";
// @ts-ignore
import { SignUp } from "../auth/SignUp";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Регистрация" },
        { name: "description", content: "Создайте новый аккаунт" },
    ];
}

export default function Profile() {
    return <SignUp />;
}
