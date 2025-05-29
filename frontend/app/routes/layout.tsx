import { Outlet } from "react-router";
import { Header } from '../layout/Header';
import { Footer } from '../layout/Footer';

export default function ProjectLayout() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
            <Header />
            <div className="flex-grow pt-[76px] bg-gray-50 dark:bg-gray-900">
                <Outlet />
            </div>
            <Footer />
        </div>
    );
}