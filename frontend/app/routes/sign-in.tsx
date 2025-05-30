import type { Route } from "./+types/profile";
// @ts-ignore
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
