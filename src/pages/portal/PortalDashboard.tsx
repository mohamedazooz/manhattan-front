import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { admissionsApi } from '../../api';
import { Button } from '../../components/ui/Button';
import { StatusBadge, LoadingSpinner, PageHeader } from '../../components/ui/Badge';
import { formatDate } from '../../lib/utils';
import { useAppLanguage } from '../../i18n';

export function PortalDashboard() {
  const { t } = useTranslation();
  const lang = useAppLanguage();
  const { data: admissions = [], isLoading } = useQuery({
    queryKey: ['my-admissions'],
    queryFn: () => admissionsApi.myStatus().then((r) => r.data),
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <PageHeader title={t('portal.title')} subtitle={t('portal.myApplications')} />
        <Button to="/portal/admissions/new">{t('portal.newApplication')}</Button>
      </div>
      <div className="space-y-4">
        {admissions.map((a) => (
          <Link key={a.id} to={`/portal/admissions/${a.id}`} className="block rounded-lg border p-4 hover:bg-neutral-light">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold">{a.studentFirstName} {a.studentLastName}</div>
                <div className="text-sm text-neutral-medium">{a.gradeLevel}{a.createdAt ? ` · ${formatDate(a.createdAt, lang)}` : ''}</div>
              </div>
              <StatusBadge status={a.status} />
            </div>
          </Link>
        ))}
        {!admissions.length && (
          <p className="text-neutral-medium text-center py-8">No applications yet. Start your first application.</p>
        )}
      </div>
    </div>
  );
}
