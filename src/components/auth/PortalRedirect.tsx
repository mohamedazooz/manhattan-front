import { Navigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { LoadingSpinner } from '../ui/Badge';

export function PortalRedirect() {
  const { user, loading, role } = useAuth();

  if (loading) return <LoadingSpinner />;

  if (!user) return <Navigate to="/login" replace />;

  if (role === 'APPLICANT') return <Navigate to="/portal/applicant" replace />;

  return <Navigate to="/portal/parent" replace />;
}
