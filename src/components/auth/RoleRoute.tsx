import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { getAccessToken } from '../../api/client';
import { LoadingSpinner } from '../ui/Badge';

type PortalRole = 'PARENT' | 'APPLICANT';

const ROLE_HOME: Record<PortalRole, string> = {
  PARENT: '/portal/parent',
  APPLICANT: '/portal/applicant',
};

const STAFF_ROLES = new Set(['ADMIN', 'SUPER_ADMIN', 'TEACHER', 'HR']);

export function isStaffRole(role: string | null | undefined): boolean {
  return !!role && STAFF_ROLES.has(role);
}

export function getPortalHomeForRole(role: string | null): string {
  if (isStaffRole(role)) return '/admin';
  if (role === 'APPLICANT') return '/portal/applicant';
  return '/portal/parent';
}

export function getPostLoginRedirect(role: string | null, from?: string): string {
  const home = getPortalHomeForRole(role);

  if (!from) return home;

  if (isStaffRole(role)) {
    if (from.startsWith('/admin')) return from;
    return home;
  }

  if (role === 'PARENT') {
    if (from.startsWith('/portal/applicant') || from.startsWith('/admin')) return home;
    return from;
  }

  if (role === 'APPLICANT') {
    if (from.startsWith('/portal/parent') || from.startsWith('/admin')) return home;
    return from;
  }

  return from;
}

export function RoleRoute({ requiredRole }: { requiredRole: PortalRole }) {
  const { user, loading, role } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner />;

  if (!user || !getAccessToken()) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  if (isStaffRole(role)) {
    return <Navigate to="/admin" replace />;
  }

  if (role !== requiredRole) {
    const redirectRole = role === 'APPLICANT' ? 'APPLICANT' : 'PARENT';
    return <Navigate to={ROLE_HOME[redirectRole]} replace />;
  }

  return <Outlet />;
}
