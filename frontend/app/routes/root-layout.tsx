import { Outlet } from "react-router";
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