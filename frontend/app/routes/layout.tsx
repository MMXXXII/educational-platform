import { Outlet } from "react-router";
import { Header } from '../layout/Header';
import { Footer } from '../layout/Footer';

export default function ProjectLayout() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <div className="flex-grow">
                <Outlet />
            </div>
            <Footer />
        </div>
    );
}