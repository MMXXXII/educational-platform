import { Outlet } from "react-router";
// @ts-ignore
import { Header } from '../layout/Header';
// @ts-ignore
import { Footer } from '../layout/Footer';
// @ts-ignore
import { useAuth } from '../contexts/AuthContext';

export default function ProjectLayout() {
    const { isLoading } = useAuth();

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
            <Header />
            <div className="flex-grow pt-[76px] bg-gray-50 dark:bg-gray-900">
                {isLoading ? (
                    <div></div>
                ) : (
                    <Outlet />
                )}
            </div>
            <Footer />
        </div>
    );
}