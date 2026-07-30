import { useTranslation } from 'react-i18next';
import { ClipboardList, Briefcase, FileText, Users, Mail, Settings } from 'lucide-react';
import { formatDate } from '../../../lib/utils';
import { useAppLanguage } from '../../../i18n';

interface ActivityItem {
  id: string;
  action: string;
  actionLabel?: string;
  details?: string | null;
  createdAt: string;
  user?: { fullName: string; email: string } | null;
}

function activityIcon(action: string) {
  if (action.includes('admission')) return ClipboardList;
  if (action.includes('job') || action.includes('application')) return Briefcase;
  if (action.includes('blog') || action.includes('gallery') || action.includes('page')) return FileText;
  if (action.includes('user') || action.includes('role')) return Users;
  if (action.includes('contact') || action.includes('email')) return Mail;
  return Settings;
}

export function ActivityFeed({ activity }: { activity: ActivityItem[] }) {
  const { t } = useTranslation();
  const lang = useAppLanguage();

  if (activity.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-slate-500">
        {t('admin.noActivity', 'No recent activity recorded.')}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {activity.slice(0, 10).map((log) => {
        const Icon = activityIcon(log.action.toLowerCase());
        return (
          <div
            key={log.id}
            className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-800/50"
          >
            <div className="mt-0.5 rounded-md bg-white p-1.5 text-primary shadow-sm dark:bg-slate-900">
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-slate-800 dark:text-slate-100">
                {log.actionLabel || log.action}
              </div>
              <div className="text-xs text-slate-500">
                {log.user?.fullName || t('admin.system', 'System')} · {formatDate(log.createdAt, lang)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
