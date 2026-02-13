import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Protected route props
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * Protected route component
 * Redirects to login page if user is not authenticated
 */
export function ProtectedRoute({
  children,
  redirectTo = '/login',
}: ProtectedRouteProps): JSX.Element {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Render children if authenticated
  return <>{children}</>;
}

/**
 * Public route component
 * Redirects to dashboard if user is already authenticated
 * Useful for login/register pages
 */
interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function PublicRoute({
  children,
  redirectTo = '/dashboard',
}: PublicRouteProps): JSX.Element {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Render children if not authenticated
  return <>{children}</>;
}
