import type { Route } from "./+types/home";
// @ts-ignore
import { Main } from "../home/MainPage";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Образовательная платформа" },
        { name: "description", content: "Проходи и управляй образовательными курсами" },
    ];
}

export default function Home() {
    return <Main />;
}
