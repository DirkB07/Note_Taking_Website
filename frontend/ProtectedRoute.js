import { Navigate, Outlet } from 'react-router-dom';

function isTokenValid(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiration = payload.exp * 1000; 
        const now = Date.now();
        if (now > expiration) return false; 
        return true;
    } catch (e) {
        return false;
    }
}

function ProtectedRoute() {
    const token = localStorage.getItem("jwtToken");
    // If token is not present or invalid, redirect to login
    if (!token || !isTokenValid(token)) {
        return <Navigate to="/login" />;
    }

    // If token is valid, render the protected component
    return <Outlet />;
}

export default ProtectedRoute;
