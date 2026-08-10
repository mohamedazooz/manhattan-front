import { Navigate, useParams } from 'react-router-dom';
import { AdminAdmissionDetailPage } from './OpsAdminPages';

export function AdminAdmissionDetailRoute() {
  const { id } = useParams<{ id: string }>();
  if (!id) return null;
  return <AdminAdmissionDetailPage id={id} />;
}

export function AdminJobApplicationsRoute() {
  const { id } = useParams<{ id: string }>();
  if (!id) return null;
  return <Navigate to={`/admin/careers?jobId=${encodeURIComponent(id)}`} replace />;
}
