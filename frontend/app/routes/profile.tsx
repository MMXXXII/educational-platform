import type { Route } from "./+types/profile";
import { UserProfile } from "../profile/UserProfile";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Editor" },
        { name: "description", content: "Edit your maps" },
    ];
}

export default function Profile() {
    return <UserProfile />;
}
