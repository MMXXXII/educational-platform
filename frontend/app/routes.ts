import {
    type RouteConfig,
    index,
    route,
    layout,
    prefix,
} from "@react-router/dev/routes";

export default [
    layout("./routes/layout.tsx", [
        index("routes/home.tsx"),
        route("courses", "./routes/courses.tsx"),
        route("courses/:id", "./routes/course-detail.tsx"),
        route("profile", "./routes/profile.tsx"),
        route("file-manager", "./routes/file-manager.tsx"),
    ]),
    route("node-editor", "routes/node-editor.tsx"),
    route("editor", "./routes/editor.tsx"),
    route("sign-in", "./routes/sign-in.tsx"),
    route("sign-up", "./routes/sign-up.tsx"),
    route("viewer", "./routes/model-viewer.tsx"),
] satisfies RouteConfig;
