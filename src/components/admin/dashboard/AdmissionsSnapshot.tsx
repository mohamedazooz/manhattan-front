import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from '../../ui/Badge';
import { formatDate } from '../../../lib/utils';
import { useAppLanguage } from '../../../i18n';

interface RecentAdmission {
  id: string;
  studentFirstName: string;
  studentLastName: string;
  gradeLevel: string;
  status: string;
  parentEmail: string;
  updatedAt: string;
}

export function AdmissionsSnapshot({ admissions }: { admissions: RecentAdmission[] }) {
  const { t } = useTranslation();
  const lang = useAppLanguage();

  if (admissions.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-slate-500">
        {t('admin.dashboardNoPendingAdmissions', 'No pending admission applications.')}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs uppercase tracking-wide text-slate-500">
            <th className="pb-2 pr-4">{t('admin.student', 'Student')}</th>
            <th className="pb-2 pr-4">{t('admin.grade', 'Grade')}</th>
            <th className="pb-2 pr-4">{t('admin.status', 'Status')}</th>
            <th className="pb-2">{t('admin.updated', 'Updated')}</th>
          </tr>
        </thead>
        <tbody>
          {admissions.map((admission) => (
            <tr key={admission.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
              <td className="py-3 pr-4">
                <Link
                  to={`/admin/admissions/${admission.id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {admission.studentFirstName} {admission.studentLastName}
                </Link>
                <div className="text-xs text-slate-400">{admission.parentEmail}</div>
              </td>
              <td className="py-3 pr-4">{admission.gradeLevel}</td>
              <td className="py-3 pr-4">
                <StatusBadge status={admission.status} />
              </td>
              <td className="py-3 text-slate-500">{formatDate(admission.updatedAt, lang)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
