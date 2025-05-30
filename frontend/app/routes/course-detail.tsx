import type { Route } from "./+types/course-detail";
import { useParams } from "react-router";
// @ts-ignore
import { CourseDetailPage } from "../course-detail/CourseDetailPage";

export function meta({ params }: Route.MetaArgs) {
    return [
        { title: `Курс ${params.id}` },
        { name: "description", content: "Подробная информация о курсе" },
    ];
}

export default function CourseDetailRoute() {
    const { id } = useParams();
    return <CourseDetailPage courseId={id} />;
}