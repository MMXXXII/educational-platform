import { Outlet } from "react-router";
// @ts-ignore
import { AuthProvider } from '../contexts/AuthContext';
import DynamicFavicon from '../common/DynamicFavicon';
import '../common/theme.css';

export default function RootLayout() {
    return (
        <AuthProvider>
            <DynamicFavicon />
            <Outlet />
        </AuthProvider>
    );
}