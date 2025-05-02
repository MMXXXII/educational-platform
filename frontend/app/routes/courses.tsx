import type { Route } from "./+types/profile";
import { CoursesPage } from "../courses/CoursesPage";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Каталог курсов" },
        { name: "description", content: "Выбери подходящий курс и начни обучение программированию прямо сейчас" },
    ];
}

export default function Courses() {
    return <CoursesPage />;
}