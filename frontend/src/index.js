import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './components/home/LandingPage';
import SignUp from './components/auth/SignUp';
import SignIn from './components/auth/SignIn';
import AdminPanel from './components/admin/AdminPanel';
import UserProfile from './components/profile/UserProfile';
import ConstructorPanel from './components/constructor/ConstructorPanel';
import EditorPanel from './components/editor/EditorPanel';

import { ProtectedRoute, AdminRoute } from './routes';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <Router>
        <Routes>
            {/* Публичные маршруты */}
            <Route path="/" 
                element={<LandingPage />} 
            />

            <Route path="/sign-up" 
                element={<SignUp />} 
            />

            <Route path="/sign-in" 
                element={<SignIn />} 
            />

            <Route path="/constructor" element={
                <ConstructorPanel />
            } />

            <Route path="/editor" element={
                <EditorPanel />
            } />
            
            {/* Защищенные маршруты (требуют авторизации) */}
            <Route path="/profile" element={
                <ProtectedRoute>
                    <UserProfile />
                </ProtectedRoute>
            } />
            {/* Маршруты только для администраторов */}
            <Route path="/admin" element={
                <AdminRoute>
                    <AdminPanel />
                </AdminRoute>
            } />
        </Routes>
    </Router>
);
