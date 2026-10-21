import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Activity } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('patient' | 'doctor')[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading, role } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-4">
        <div className="relative flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-center shadow-lg shadow-cyan-500/10 mb-4">
            <BrandLogo variant="icon" size="md" className="animate-pulse" />
          </div>
          <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            Verifying DocTalk session...
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Restoring encrypted credentials
          </p>
        </div>
      </div>
    );
  }

  // If unauthenticated, redirect to login page with preserved destination
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If route is restricted by role and user's role is not authorized
  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 shadow-lg text-center">
        <div className="w-12 h-12 mx-auto rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
          <Activity className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          Clinical Credential Required
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          The doctor clinical workspace is restricted to accredited healthcare providers. Public accounts cannot self-assign doctor credentials.
        </p>
        <Navigate to="/dashboard" replace />
      </div>
    );
  }

  return <>{children}</>;
};
