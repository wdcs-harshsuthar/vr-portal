import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if we have a token in localStorage as a fallback
  const token = localStorage.getItem('token');
  
  if (!isAuthenticated && !token) {
    return <Navigate to="/login" replace />;
  }

  // If we have a token but user is null, it might be a temporary issue
  // Let the component render and it will handle the retry logic
  return <>{children}</>;
};

export default ProtectedRoute;