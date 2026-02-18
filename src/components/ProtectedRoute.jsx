import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role-based protection (optional)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Normalize role check: treat "student" as "learner"
    const normalizedRole = user.role === 'student' ? 'learner' : user.role;
    
    if (!allowedRoles.includes(normalizedRole)) {
      // Redirect to correct dashboard based on user role
      if (normalizedRole === 'tutor') {
        return <Navigate to="/dashboard-tutor" replace />;
      } else if (normalizedRole === 'learner') {
        return <Navigate to="/dashboard-learner" replace />;
      } else {
        return <Navigate to="/login" replace />;
      }
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;