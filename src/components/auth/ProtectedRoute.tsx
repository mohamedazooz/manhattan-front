import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { getAccessToken } from '../../api/client';
import { LoadingSpinner } from '../ui/Badge';

export function ProtectedRoute({
  permission,
  adminOnly,
}: {
  permission?: string;
  adminOnly?: boolean;
}) {
  const { user, loading, hasPermission, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner />;

  if (!user || !getAccessToken()) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    const loginPath = adminOnly ? `/admin/login?redirect=${redirect}` : `/login?redirect=${redirect}`;
    return <Navigate to={loginPath} replace />;
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
