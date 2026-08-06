import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token, loading } = useAuth();

  // Show a professional cyber-themed loader while validating sessions
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cyber-bg text-cyber-accent font-mono">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-t-2 border-cyber-border border-t-cyber-accent shadow-glow-cyan"></div>
          <div className="text-xs uppercase tracking-widest animate-pulse text-cyber-accent">
            Validating Security Credentials...
          </div>
        </div>
      </div>
    );
  }

  // Redirect to login if user is unauthenticated
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Enforce role checks (RBAC) if roles are defined
  if (allowedRoles && user) {
    const userRole = user.role?.role_name;
    if (!allowedRoles.includes(userRole)) {
      toast.error(`Access Restricted: Requiring role (${allowedRoles.join(' or ')})`, { id: 'rbac-error' });
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;

