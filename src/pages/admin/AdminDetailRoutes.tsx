import { useParams } from 'react-router-dom';
import { AdminAdmissionDetailPage, AdminJobApplicationsPage } from './OpsAdminPages';

export function AdminAdmissionDetailRoute() {
  const { id } = useParams<{ id: string }>();
  if (!id) return null;
  return <AdminAdmissionDetailPage id={id} />;
}

export function AdminJobApplicationsRoute() {
  const { id } = useParams<{ id: string }>();
  if (!id) return null;
  return <AdminJobApplicationsPage jobId={id} />;
}
