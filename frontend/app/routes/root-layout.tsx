import { Outlet } from "react-router";
import { AuthProvider } from '../contexts/AuthContext';
import DynamicFavicon from '../common/DynamicFavicon';

export default function RootLayout() {
    return (
        <AuthProvider>
            <DynamicFavicon />
            <Outlet />
        </AuthProvider>
    );
}