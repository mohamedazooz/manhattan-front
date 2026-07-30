import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import type { DashboardStats } from '../../types';
import { formatDate } from '../../lib/utils';
import { useAppLanguage } from '../../i18n';
import { StatusBadge } from '../ui/Badge';

interface Props {
  stats: DashboardStats;
}

export function DashboardActionQueue({ stats }: Props) {
  const { t } = useTranslation();
  const lang = useAppLanguage();
  const { hasPermission } = useAuth();

  const items: Array<{
    key: string;
    title: string;
    count: number;
    link: string;
    visible: boolean;
    children?: ReactNode;
  }> = [];

  if (hasPermission('VIEW_ALL_ADMISSIONS') && stats.admissions?.recent?.length) {
    items.push({
      key: 'admissions',
      title: t('admin.admissionsOps'),
      count: (stats.admissions.submitted ?? 0) + (stats.admissions.underReview ?? 0),
      link: '/admin/admissions',
      visible: true,
      children: (
        <ul className="space-y-2 mt-2">
          {stats.admissions.recent.map((a) => (
            <li key={a.id} className="flex items-center justify-between text-sm border-b pb-2">
              <div>
                <div className="font-medium">
                  {a.studentFirstName} {a.studentLastName}
                  {a.referenceNumber && (
                    <span className="text-xs text-neutral-medium ms-2">({a.referenceNumber})</span>
                  )}
                </div>
                <div className="text-xs text-neutral-medium">{a.gradeLevel}</div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={a.status} />
                <Link to={`/admin/admissions/${a.id}`} className="text-primary text-xs hover:underline">
                  {t('admin.review', 'Review')}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      ),
    });
  }

  if (hasPermission('MANAGE_JOBS') && stats.jobs?.recentApplications?.length) {
    items.push({
      key: 'jobs',
      title: t('admin.careersOps'),
      count: stats.jobs.totalApplications ?? 0,
      link: '/admin/careers',
      visible: true,
      children: (
        <ul className="space-y-2 mt-2">
          {stats.jobs.recentApplications.map((app) => (
            <li key={app.id} className="flex items-center justify-between text-sm border-b pb-2">
              <div>
                <div className="font-medium">{app.fullName}</div>
                <div className="text-xs text-neutral-medium">{app.job?.title}</div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={app.status} />
                <span className="text-xs text-neutral-medium">{formatDate(app.createdAt, lang)}</span>
              </div>
            </li>
          ))}
        </ul>
      ),
    });
  }

  if (hasPermission('VIEW_DASHBOARD') && (stats.inquiries?.new ?? 0) > 0) {
    items.push({
      key: 'inquiries',
      title: t('admin.newInquiries'),
      count: stats.inquiries!.new,
      link: '/admin/inquiries',
      visible: true,
    });
  }

  if (hasPermission('UPDATE_BLOG') && (stats.blog?.pendingComments ?? 0) > 0) {
    items.push({
      key: 'comments',
      title: t('admin.pendingComments'),
      count: stats.blog!.pendingComments,
      link: '/admin/blog',
      visible: true,
    });
  }

  if (hasPermission('MANAGE_EMAIL_TEMPLATES') && (stats.email?.failedLogs ?? 0) > 0) {
    items.push({
      key: 'email',
      title: t('admin.failedEmails'),
      count: stats.email!.failedLogs,
      link: '/admin/email',
      visible: true,
    });
  }

  if (hasPermission('VIEW_DASHBOARD') && (stats.notifications?.unread ?? 0) > 0) {
    items.push({
      key: 'notifications',
      title: t('admin.unreadNotifications'),
      count: stats.notifications!.unread,
      link: '/admin/notifications',
      visible: true,
    });
  }

  const visibleItems = items.filter((i) => i.visible);
  if (visibleItems.length === 0) return null;

  return (
    <div className="bg-white rounded-lg border p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="h-5 w-5 text-accent" />
        <h2 className="text-lg font-bold text-neutral-dark">{t('admin.actionQueue', 'Action Queue')}</h2>
      </div>
      <div className="space-y-6">
        {visibleItems.map((item) => (
          <div key={item.key}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-neutral-dark">
                {item.title}
                <span className="ms-2 text-sm font-normal text-neutral-medium">({item.count})</span>
              </h3>
              <Link to={item.link} className="text-sm text-primary hover:underline flex items-center gap-1">
                {t('admin.manageAll')} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {item.children}
          </div>
        ))}
      </div>
    </div>
  );
}
