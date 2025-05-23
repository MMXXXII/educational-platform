import {
    type RouteConfig,
    index,
    route,
    layout,
    prefix,
} from "@react-router/dev/routes";

export default [
    layout("./routes/root-layout.tsx", [
        layout("./routes/layout.tsx", [
            index("routes/home.tsx"),
            route("courses", "./routes/courses.tsx"),
            route("courses/:id", "./routes/course-detail.tsx"),
            route("profile", "./routes/profile.tsx"),
            route("file-manager", "./routes/file-manager.tsx"),
            route("create-course", "./routes/create-course.tsx"),
        ]),
        route("node-editor", "routes/node-editor.tsx"),
        route("tile-editor", "./routes/tile-editor.tsx"),
        route("tile-editor-old", "./routes/tile-editor-old.tsx"),
        route("tile-editor-scene", "./routes/tile-editor-scene.tsx"),
        route("sign-in", "./routes/sign-in.tsx"),
        route("sign-up", "./routes/sign-up.tsx"),
        route("viewer", "./routes/model-viewer.tsx"),
        route("level-walkthrough", "./routes/level-walkthrough.tsx"),
    ]),
] satisfies RouteConfig;
