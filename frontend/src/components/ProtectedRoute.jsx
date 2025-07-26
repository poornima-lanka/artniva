// frontend/src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom'; // Outlet is for nested routes
import { useUser } from '../context/UserContext'; // Import your user context

const ProtectedRoute = ({ allowedRoles }) => {
  const { userInfo, isLoggedIn } = useUser();

  // If user is not logged in, redirect to login page
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // If allowedRoles are specified, check if user's role is among them
  if (allowedRoles && !allowedRoles.includes(userInfo?.role)) {
    // If logged in but not authorized, redirect to home or an unauthorized page
    return <Navigate to="/" replace />; // Or a specific /unauthorized page
  }

  // If logged in and authorized, render the child routes/components
  return <Outlet />;
};

export default ProtectedRoute;