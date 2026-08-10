import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { notificationsApi } from '../../api';
import { LoadingSpinner, PageHeader, StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/DataTable';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { AdminDataTable } from '../../components/admin/AdminDataTable';
import { AdminListToolbar, AdminStatusChip } from '../../components/admin/AdminListToolbar';
import { AdminOpsCounters } from '../../components/admin/AdminOpsCounters';
import { formatDate } from '../../lib/utils';
import { getNotificationTargetRoute } from '../../lib/notification-routes';
import { useAppLanguage } from '../../i18n';
import type { Notification } from '../../types';
import { Eye, CheckCheck, Archive, Plus, Bell } from 'lucide-react';

const emptyForm = {
  title: '',
  message: '',
  type: 'INFO',
};

export function NotificationsAdminPage() {
  const { t } = useTranslation();
  const lang = useAppLanguage();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState(emptyForm);

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list().then((r) => r.data as Notification[]),
    refetchInterval: 30000,
  });

  const createMutation = useMutation({
    mutationFn: () => notificationsApi.create(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      setForm(emptyForm);
      setOpen(false);
    },
  });

  const updateStatus = (id: string, status: Notification['status']) =>
    notificationsApi.updateStatus(id, status).then(() => qc.invalidateQueries({ queryKey: ['notifications'] }));

  const counts = {
    total: notifications.length,
    unread: notifications.filter((n) => n.status === 'UNREAD').length,
    read: notifications.filter((n) => n.status === 'READ').length,
    archived: notifications.filter((n) => n.status === 'ARCHIVED').length,
  };

  const filteredNotifications = notifications.filter((item) => {
    if (filterStatus !== 'ALL' && item.status !== filterStatus) return false;
    const search = searchTerm.trim().toLowerCase();
    if (!search) return true;
    return (
      item.title.toLowerCase().includes(search) ||
      item.message.toLowerCase().includes(search)
    );
  });

  const handleView = (row: Notification) => {
    if (row.status === 'UNREAD') {
      updateStatus(row.id, 'READ');
    }
    const route = getNotificationTargetRoute(row);
    if (route) {
      navigate(route);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title={t('admin.notificationsCrud.title', 'System Notifications')}
          subtitle={t(
            'admin.notificationsCrud.subtitle',
            'View administrative alerts, new student applications, and inquiries.',
          )}
        />
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => notificationsApi.markAllRead().then(() => qc.invalidateQueries({ queryKey: ['notifications'] }))}
          >
            <CheckCheck className="w-4 h-4 me-1.5 inline-block" />
            {t('admin.notificationsCrud.markAllRead', 'Mark all read')}
          </Button>
          <Button onClick={() => setOpen(true)}>
            <Plus className="w-4 h-4 me-1.5 inline-block" />
            {t('admin.notificationsCrud.newNotification', 'New notification')}
          </Button>
        </div>
      </div>

      <AdminOpsCounters
        items={[
          {
            id: 'unread',
            label: t('admin.notificationsCrud.unread', 'Unread'),
            value: counts.unread,
            highlight: counts.unread > 0,
            onClick: () => setFilterStatus('UNREAD'),
          },
          { id: 'read', label: t('admin.notificationsCrud.read', 'Read'), value: counts.read, onClick: () => setFilterStatus('READ') },
          {
            id: 'archived',
            label: t('admin.notificationsCrud.archived', 'Archived'),
            value: counts.archived,
            onClick: () => setFilterStatus('ARCHIVED'),
          },
          { id: 'total', label: t('admin.notificationsCrud.all', 'All'), value: counts.total, onClick: () => setFilterStatus('ALL') },
        ]}
      />

      <AdminListToolbar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder={t('admin.notificationsCrud.searchPlaceholder', 'Search notifications…')}
        resultCount={filteredNotifications.length}
        totalCount={notifications.length}
        filters={
          <>
            <AdminStatusChip
              label={t('admin.notificationsCrud.all', 'All')}
              active={filterStatus === 'ALL'}
              onClick={() => setFilterStatus('ALL')}
              count={counts.total}
            />
            <AdminStatusChip
              label={t('admin.notificationsCrud.unread', 'Unread')}
              active={filterStatus === 'UNREAD'}
              onClick={() => setFilterStatus('UNREAD')}
              count={counts.unread}
              variant="warning"
            />
            <AdminStatusChip
              label={t('admin.notificationsCrud.read', 'Read')}
              active={filterStatus === 'READ'}
              onClick={() => setFilterStatus('READ')}
              count={counts.read}
            />
            <AdminStatusChip
              label={t('admin.notificationsCrud.archived', 'Archived')}
              active={filterStatus === 'ARCHIVED'}
              onClick={() => setFilterStatus('ARCHIVED')}
              count={counts.archived}
            />
          </>
        }
      />

      <AdminDataTable
        isLoading={isLoading}
        data={filteredNotifications}
        emptyTitle={t('admin.notificationsCrud.noNotifications', 'No notifications')}
        emptyDescription={t('admin.notificationsCrud.noNotificationsHint', 'Alerts from admissions, careers, and inquiries will appear here.')}
        columns={[
          {
            key: 'title',
            header: t('admin.notificationsCrud.notification', 'Notification'),
            render: (row: Notification) => (
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg mt-0.5 ${row.status === 'UNREAD' ? 'bg-amber-100 text-amber-700' : 'bg-neutral-100 text-neutral-500'}`}>
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-neutral-dark flex items-center gap-2">
                    {row.title}
                    {row.status === 'UNREAD' && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 inline-block animate-pulse" />
                    )}
                  </div>
                  <div className="text-xs text-neutral-medium line-clamp-2 mt-0.5">{row.message}</div>
                </div>
              </div>
            ),
          },
          {
            key: 'type',
            header: t('admin.notificationsCrud.type', 'Type'),
            render: (row: Notification) => <StatusBadge status={row.type} />,
          },
          {
            key: 'status',
            header: t('admin.notificationsCrud.status', 'Status'),
            render: (row: Notification) => <StatusBadge status={row.status} />,
          },
          {
            key: 'createdAt',
            header: t('admin.notificationsCrud.created', 'Created'),
            render: (row: Notification) => formatDate(row.createdAt, lang),
          },
          {
            key: 'actions',
            header: t('admin.notificationsCrud.actions', 'Actions'),
            render: (row: Notification) => {
              const targetRoute = getNotificationTargetRoute(row);
              return (
                <div className="flex items-center gap-2">
                  {targetRoute && (
                    <Button variant="primary" className="py-1 px-2.5 text-xs flex items-center gap-1" onClick={() => handleView(row)}>
                      <Eye className="w-3.5 h-3.5" />
                      {t('admin.notificationsCrud.viewTarget', 'View')}
                    </Button>
                  )}
                  {row.status !== 'READ' && (
                    <Button variant="outline" className="py-1 px-2.5 text-xs flex items-center gap-1" onClick={() => updateStatus(row.id, 'READ')}>
                      <CheckCheck className="w-3.5 h-3.5" />
                      {t('admin.notificationsCrud.markRead', 'Mark read')}
                    </Button>
                  )}
                  {row.status !== 'ARCHIVED' && (
                    <Button variant="secondary" className="py-1 px-2.5 text-xs flex items-center gap-1" onClick={() => updateStatus(row.id, 'ARCHIVED')}>
                      <Archive className="w-3.5 h-3.5" />
                      {t('admin.notificationsCrud.archive', 'Archive')}
                    </Button>
                  )}
                </div>
              );
            },
          },
        ]}
      />

      <Modal open={open} onClose={() => setOpen(false)} title={t('admin.notificationsCrud.createTitle', 'New notification')} wide>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate();
          }}
        >
          <Input label={t('admin.notificationsCrud.formTitle', 'Title')} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Textarea label={t('admin.notificationsCrud.formMessage', 'Message')} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
          <Select label={t('admin.notificationsCrud.type', 'Type')} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="INFO">Info</option>
            <option value="SUCCESS">Success</option>
            <option value="WARNING">Warning</option>
            <option value="ERROR">Error</option>
          </Select>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? t('admin.notificationsCrud.creating', 'Creating…') : t('admin.notificationsCrud.create', 'Create')}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
