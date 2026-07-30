import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from '../../ui/Badge';
import { formatDate } from '../../../lib/utils';
import { useAppLanguage } from '../../../i18n';

interface RecentJobApplication {
  id: string;
  status: string;
  fullName: string;
  email: string;
  createdAt: string;
  job?: { id: string; title: string; titleAr?: string };
}

export function CareersSnapshot({ applications }: { applications: RecentJobApplication[] }) {
  const { t } = useTranslation();
  const lang = useAppLanguage();
  const isAr = lang === 'ar';

  if (applications.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-slate-500">
        {t('admin.dashboardNoApplications', 'No job applications yet.')}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs uppercase tracking-wide text-slate-500">
            <th className="pb-2 pr-4">{t('admin.candidate', 'Candidate')}</th>
            <th className="pb-2 pr-4">{t('admin.position', 'Position')}</th>
            <th className="pb-2 pr-4">{t('admin.status', 'Status')}</th>
            <th className="pb-2">{t('admin.applied', 'Applied')}</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr key={app.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
              <td className="py-3 pr-4">
                <div className="font-medium text-slate-800 dark:text-slate-100">{app.fullName}</div>
                <div className="text-xs text-slate-400">{app.email}</div>
              </td>
              <td className="py-3 pr-4">
                {app.job ? (
                  <Link to={`/admin/careers/${app.job.id}/applications`} className="text-primary hover:underline">
                    {isAr && app.job.titleAr ? app.job.titleAr : app.job.title}
                  </Link>
                ) : (
                  '—'
                )}
              </td>
              <td className="py-3 pr-4">
                <StatusBadge status={app.status} />
              </td>
              <td className="py-3 text-slate-500">{formatDate(app.createdAt, lang)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
