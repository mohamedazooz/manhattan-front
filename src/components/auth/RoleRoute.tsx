import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { LoadingSpinner } from '../ui/Badge';

type PortalRole = 'PARENT' | 'APPLICANT';

const ROLE_HOME: Record<PortalRole, string> = {
  PARENT: '/portal/parent',
  APPLICANT: '/portal/applicant',
};

export function RoleRoute({ requiredRole }: { requiredRole: PortalRole }) {
  const { user, loading, role } = useAuth();

  if (loading) return <LoadingSpinner />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role === 'ADMIN' || role === 'TEACHER' || role === 'HR') {
    return <Navigate to="/admin" replace />;
  }

  if (role !== requiredRole) {
    const redirectRole = role === 'APPLICANT' ? 'APPLICANT' : 'PARENT';
    return <Navigate to={ROLE_HOME[redirectRole]} replace />;
  }

  return <Outlet />;
}

export function getPortalHomeForRole(role: string | null): string {
  if (role === 'ADMIN' || role === 'TEACHER' || role === 'HR') return '/admin';
  if (role === 'APPLICANT') return '/portal/applicant';
  return '/portal/parent';
}
