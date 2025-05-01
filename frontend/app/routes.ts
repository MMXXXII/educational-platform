import { 
    type RouteConfig,
    index,
    route,
    layout,
    prefix,
} from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("editor", "./routes/editor.tsx"),
    route("profile", "./routes/profile.tsx"),
] satisfies RouteConfig;
