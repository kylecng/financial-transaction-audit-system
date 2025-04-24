import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow'; // Import useShallow
import { useAuthStore, AuthState } from '@/stores/authStore';

interface AuthGuardProps {
  allowedRoles?: ('auditor' | 'transactor')[];
}

const AuthGuard: React.FC<AuthGuardProps> = ({ allowedRoles }) => {
  // Use the useShallow hook for the selector
  const { user, isLoading } = useAuthStore(
    useShallow((state: AuthState) => ({
      user: state.user,
      isLoading: state.isLoading,
    }))
  );
  const location = useLocation();

  if (isLoading) {
    // Optional: Show a loading spinner or similar while checking auth state
    return <div>Loading...</div>;
  }

  if (!user) {
    // User not logged in, redirect to login page, saving the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // User logged in but does not have the required role, redirect to a default page
    // Redirecting to /transactions might be a sensible default
    console.warn(
      `AuthGuard: User role '${user.role}' not allowed for path '${location.pathname}'. Redirecting.`
    );
    return <Navigate to="/transactions" replace />;
  }

  // User is authenticated and has the required role (if specified)
  return <Outlet />; // Render the nested routes/component
};

export default AuthGuard;
