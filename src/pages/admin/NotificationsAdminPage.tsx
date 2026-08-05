import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { notificationsApi } from '../../api';
import { LoadingSpinner, PageHeader, StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { DataTable, Modal } from '../../components/ui/DataTable';
import { Input, Textarea, Select } from '../../components/ui/Input';
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
  const lang = useAppLanguage();
  const isAr = lang === 'ar';
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
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

  const filteredNotifications = notifications.filter((item) => {
    if (filterStatus === 'ALL') return true;
    return item.status === filterStatus;
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
          title={isAr ? 'التنبيهات والإشعارات' : 'Notifications & Alerts'}
          subtitle={
            isAr
              ? 'متابعة إشعارات النظام وتنبيهات طلبات القبول والتوظيف والاستفسارات الجديدة.'
              : 'Review in-app updates, applications, inquiries, and admin notices.'
          }
        />
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => notificationsApi.markAllRead().then(() => qc.invalidateQueries({ queryKey: ['notifications'] }))}
          >
            <CheckCheck className="w-4 h-4 me-1.5 inline-block" />
            {isAr ? 'تعليم الكل كمقروء' : 'Mark all read'}
          </Button>
          <Button onClick={() => setOpen(true)}>
            <Plus className="w-4 h-4 me-1.5 inline-block" />
            {isAr ? 'تنبيه جديد' : 'New notification'}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-neutral-200 pb-3">
        {[
          { key: 'ALL', label: isAr ? 'الكل' : 'All' },
          { key: 'UNREAD', label: isAr ? 'غير مقروء' : 'Unread' },
          { key: 'READ', label: isAr ? 'مقروء' : 'Read' },
          { key: 'ARCHIVED', label: isAr ? 'مؤرشف' : 'Archived' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              filterStatus === tab.key
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <DataTable
        data={filteredNotifications}
        columns={[
          {
            key: 'title',
            header: isAr ? 'الإشعار' : 'Notification',
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
            header: isAr ? 'النوع' : 'Type',
            render: (row: Notification) => <StatusBadge status={row.type} />,
          },
          {
            key: 'status',
            header: isAr ? 'الحالة' : 'Status',
            render: (row: Notification) => <StatusBadge status={row.status} />,
          },
          { key: 'createdAt', header: isAr ? 'التاريخ' : 'Created', render: (row: Notification) => formatDate(row.createdAt, lang) },
          {
            key: 'actions',
            header: isAr ? 'الإجراءات' : 'Actions',
            render: (row: Notification) => {
              const targetRoute = getNotificationTargetRoute(row);
              return (
                <div className="flex items-center gap-2">
                  {targetRoute && (
                    <Button variant="primary" className="py-1 px-2.5 text-xs flex items-center gap-1" onClick={() => handleView(row)}>
                      <Eye className="w-3.5 h-3.5" />
                      {isAr ? 'معاينة الطلب' : 'View Application'}
                    </Button>
                  )}
                  {row.status !== 'READ' && (
                    <Button variant="outline" className="py-1 px-2.5 text-xs flex items-center gap-1" onClick={() => updateStatus(row.id, 'READ')}>
                      <CheckCheck className="w-3.5 h-3.5" />
                      {isAr ? 'مقروء' : 'Mark Read'}
                    </Button>
                  )}
                  {row.status !== 'ARCHIVED' && (
                    <Button variant="secondary" className="py-1 px-2.5 text-xs flex items-center gap-1" onClick={() => updateStatus(row.id, 'ARCHIVED')}>
                      <Archive className="w-3.5 h-3.5" />
                      {isAr ? 'أرشفة' : 'Archive'}
                    </Button>
                  )}
                </div>
              );
            },
          },
        ]}
      />

      <Modal open={open} onClose={() => setOpen(false)} title={isAr ? 'إنشاء تنبيه جديد' : 'New notification'} wide>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate();
          }}
        >
          <Input label={isAr ? 'العنوان' : 'Title'} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Textarea label={isAr ? 'الرسالة' : 'Message'} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
          <Select label={isAr ? 'النوع' : 'Type'} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="INFO">Info</option>
            <option value="SUCCESS">Success</option>
            <option value="WARNING">Warning</option>
            <option value="ERROR">Error</option>
          </Select>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? (isAr ? 'جاري الإنشاء...' : 'Creating...') : isAr ? 'إنشاء' : 'Create'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
