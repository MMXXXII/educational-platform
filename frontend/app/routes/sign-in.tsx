import type { Route } from "./+types/profile";
import { SignIn } from "../auth/SignIn";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Авторизация" },
        { name: "description", content: "Войдите в свой аккаунт" },
    ];
}

export default function Profile() {
    return <SignIn />;
}
