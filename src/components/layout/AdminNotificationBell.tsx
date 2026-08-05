import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bell } from 'lucide-react';
import { notificationsApi } from '../../api';
import { getNotificationTargetRoute } from '../../lib/notification-routes';
import { formatDate } from '../../lib/utils';
import { useAppLanguage } from '../../i18n';
import type { Notification } from '../../types';
import { cn } from '../../lib/utils';

const POLL_INTERVAL_MS = 30000;

export function AdminNotificationBell() {
  const { t } = useTranslation();
  const lang = useAppLanguage();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: unreadData } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationsApi.unreadCount().then((r) => r.data as { count: number }),
    refetchInterval: POLL_INTERVAL_MS,
  });

  const { data: recentNotifications = [] } = useQuery({
    queryKey: ['notifications', 'recent-unread'],
    queryFn: () =>
      notificationsApi.list('UNREAD', 5).then((r) => {
        const items = r.data as Notification[];
        return items.filter((item) => !item.userId);
      }),
    enabled: open,
    refetchInterval: open ? POLL_INTERVAL_MS : false,
  });

  const unreadCount = unreadData?.count ?? 0;

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleNotificationClick = async (notification: Notification) => {
    if (notification.status === 'UNREAD') {
      await notificationsApi.updateStatus(notification.id, 'READ');
      qc.invalidateQueries({ queryKey: ['notifications'] });
    }

    setOpen(false);
    const route = getNotificationTargetRoute(notification);
    if (route) {
      navigate(route);
    } else {
      navigate('/admin/notifications');
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs"
        title={t('admin.notificationBell', 'Notifications')}
        aria-label={t('admin.notificationBell', 'Notifications')}
        aria-expanded={open}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -end-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute end-0 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {t('admin.unreadNotifications')}
            </h3>
            {unreadCount > 0 && (
              <span className="text-xs text-slate-500 dark:text-slate-400">{unreadCount}</span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {recentNotifications.length === 0 ? (
              <p className="px-4 py-6 text-sm text-center text-slate-500 dark:text-slate-400">
                {t('admin.noUnreadNotifications', 'No unread notifications.')}
              </p>
            ) : (
              <ul>
                {recentNotifications.map((notification) => (
                  <li key={notification.id}>
                    <button
                      type="button"
                      onClick={() => handleNotificationClick(notification)}
                      className={cn(
                        'w-full text-start px-4 py-3 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors',
                        notification.status === 'UNREAD' && 'bg-amber-50/50 dark:bg-amber-950/20',
                      )}
                    >
                      <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 line-clamp-1">
                        {notification.title}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                        {notification.message}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                        {formatDate(notification.createdAt, lang)}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate('/admin/notifications');
              }}
              className="w-full text-center text-xs font-semibold text-primary hover:underline py-1"
            >
              {t('admin.viewAllNotifications', 'View all notifications')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
