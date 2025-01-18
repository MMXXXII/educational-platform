import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getAccessToken } from '../utils/auth';

// Component to protect routes that require authentication
const ProtectedRoute = ({ children }) => {
    const location = useLocation();
    const accessToken = getAccessToken();

    // Redirect to the login page if the token is missing
    if (!accessToken) {
        return <Navigate to="/sign-in" state={{ from: location }} replace />;
    }

    // Render the protected component if the token exists
    return children;
};

// Component to protect routes that require admin privileges
const AdminRoute = ({ children }) => {
    const location = useLocation();
    const accessToken = getAccessToken();

    // Retrieve user data from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = user.role === 'admin';

    if (!accessToken) {
        return <Navigate to="/sign-in" state={{ from: location }} replace />;
    }

    if (!isAdmin) {
        return <Navigate to="/profile" state={{ from: location }} replace />;
    }

    return children;
};

export { ProtectedRoute, AdminRoute };