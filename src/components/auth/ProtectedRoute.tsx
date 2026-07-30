import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { LoadingSpinner } from '../ui/Badge';

export function ProtectedRoute({
  permission,
  adminOnly,
}: {
  permission?: string;
  adminOnly?: boolean;
}) {
  const { user, loading, hasPermission, isAdmin } = useAuth();

  if (loading) return <LoadingSpinner />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/portal/parent" replace />;
  }

  if (permission && !hasPermission(permission)) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}

export function PermissionGuard({
  permission,
  children,
  fallback = null,
}: {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { hasPermission } = useAuth();
  if (!hasPermission(permission)) return <>{fallback}</>;
  return <>{children}</>;
}
