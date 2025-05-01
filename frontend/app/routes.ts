import { 
    type RouteConfig,
    index,
    route,
    layout,
    prefix,
} from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("node-editor", "routes/node-editor.tsx"),
    route("editor", "./routes/editor.tsx"),
    route("profile", "./routes/profile.tsx"),
    route("file-manager", "./routes/file-manager.tsx"),
    route("sign-in", "./routes/sign-in.tsx"),
    route("sign-up", "./routes/sign-up.tsx")
    
] satisfies RouteConfig;
