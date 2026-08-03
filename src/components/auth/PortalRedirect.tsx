import { Navigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { LoadingSpinner } from '../ui/Badge';
import { getPortalHomeForRole } from './RoleRoute';

export function PortalRedirect() {
  const { user, loading, role } = useAuth();

  if (loading) return <LoadingSpinner />;

  if (!user) return <Navigate to="/login" replace />;

  return <Navigate to={getPortalHomeForRole(role)} replace />;
}