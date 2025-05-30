import type { Route } from "./+types/my-courses";
// @ts-ignore
import { MyCoursesPage } from '../my-courses/MyCoursesPage';

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Ваши курсы" },
        { name: "description", content: "Здесь вы можете просматривать и управлять своими курсами" },
    ];
}

export default function MyCoursesRoute() {
    return <MyCoursesPage />;
}