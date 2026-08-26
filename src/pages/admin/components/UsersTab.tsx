import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi, rolesApi } from '../../../api';
import { Button } from '../../../components/ui/Button';
import { Input, Select } from '../../../components/ui/Input';
import { DataTable, Modal } from '../../../components/ui/DataTable';
import { StatusBadge, PageHeader } from '../../../components/ui/Badge';
import { formatDate } from '../../../lib/utils';
import { getApiErrorMessage } from '../../../lib/formData';
import { useAppLanguage } from '../../../i18n';

export function AdminUsersPage() {
  const { t } = useTranslation();
  const lang = useAppLanguage();
  const qc = useQueryClient();
  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: () => usersApi.list().then((r) => r.data) });
  const { data: roles = [] } = useQuery({ queryKey: ['roles'], queryFn: () => rolesApi.list().then((r) => r.data) });

  const [showCreate, setShowCreate] = useState(false);
  const [activeTab, setActiveTab] = useState<'staff' | 'external'>('staff');
  const [viewUser, setViewUser] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [form, setForm] = useState({ fullName: '', email: '', password: '', roleId: '' });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.password || !form.roleId) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      await usersApi.create(form);
      setForm({ fullName: '', email: '', password: '', roleId: '' });
      setShowCreate(false);
      qc.invalidateQueries({ queryKey: ['users'] });
      qc.invalidateQueries({ queryKey: ['roles'] });
    } catch (err: unknown) {
      setErrorMsg(getApiErrorMessage(err, t('common.errorSave', 'Failed to create user')));
    } finally {
      setLoading(false);
    }
  };

  const externalRoles = ['PARENT', 'STUDENT', 'APPLICANT', 'GUEST'];
  const filteredUsers = users.filter((u: any) => {
    const isExternal = externalRoles.includes(u.role?.name);
    if (activeTab === 'staff' && isExternal) return false;
    if (activeTab === 'external' && !isExternal) return false;

    const matchesSearch =
      (u.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter ? u.role?.id === roleFilter || u.role?.name === roleFilter : true;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <PageHeader title={t('admin.users.title', 'User Management')} />
          <p className="text-sm text-slate-500 mt-1">
            {t('admin.users.subtitle', 'Create admin accounts, assign roles, and manage system access.')}
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="shadow-sm">
          {t('admin.users.addNew', '+ Add New User')}
        </Button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-4 pt-3 rounded-t-xl gap-6">
        <button
          onClick={() => setActiveTab('staff')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'staff'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          👨‍🏫 {t('admin.users.staffTab', 'Staff & Management')}
        </button>
        <button
          onClick={() => setActiveTab('external')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'external'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          🌐 {t('admin.users.externalTab', 'External Users')}
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-b-xl border border-t-0 border-slate-200 shadow-2xs mb-4">
        <div className="w-full sm:w-80">
          <Input
            placeholder={t('admin.users.searchPlaceholder', '🔍 Search user name or email...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">{t('admin.users.filterRole', 'Filter by Role:')}</span>
          <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="w-full sm:w-48 text-xs">
            <option value="">{t('admin.users.allRoles', 'All Roles')} ({filteredUsers.length})</option>
            {roles
              .filter((r: any) => (activeTab === 'staff' ? !externalRoles.includes(r.name) : externalRoles.includes(r.name)))
              .map((r: any) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* User Creation Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title={t('admin.users.createTitle', 'Add New User')}>
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label={t('auth.fullName', 'Full Name')} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
          <Input label={t('auth.email', 'Email')} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input label={t('auth.password', 'Password')} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-800">{t('admin.users.role', 'Role')}</label>
            <select
              className="w-full border rounded-lg p-2 text-sm bg-white border-slate-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={form.roleId}
              onChange={(e) => setForm({ ...form, roleId: e.target.value })}
              required
            >
              <option value="">{t('admin.users.selectRole', 'Select Role...')}</option>
              {roles.map((r: { id: string; name: string; description?: string }) => (
                <option key={r.id} value={r.id}>
                  {r.name} — {r.description || r.name}
                </option>
              ))}
            </select>
          </div>
          {errorMsg && <p className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">{errorMsg}</p>}
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>{t('common.cancel', 'Cancel')}</Button>
            <Button type="submit" disabled={loading}>{loading ? t('common.loading', 'Loading...') : t('admin.users.saveUser', 'Save User')}</Button>
          </div>
        </form>
      </Modal>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <DataTable data={filteredUsers} columns={[
          {
            key: 'name',
            header: t('admin.users.nameHeader', 'Name & User'),
            render: (r: any) => (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm border border-primary/20">
                  {r.fullName ? r.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <div className="font-semibold text-slate-900">{r.fullName}</div>
                  <div className="text-xs text-slate-500">{r.email}</div>
                </div>
              </div>
            ),
          },
          {
            key: 'role',
            header: t('admin.users.roleHeader', 'Role'),
            render: (r: any) => (
              <select
                className="border rounded-md px-2 py-1 text-xs bg-slate-50 border-slate-300 font-semibold text-slate-800"
                value={r.role?.id}
                onChange={(e) =>
                  usersApi.updateRole(r.id, e.target.value).then(() => {
                    qc.invalidateQueries({ queryKey: ['users'] });
                    qc.invalidateQueries({ queryKey: ['roles'] });
                  })
                }
              >
                {roles.map((ro: any) => (
                  <option key={ro.id} value={ro.id}>{ro.name}</option>
                ))}
              </select>
            ),
          },
          {
            key: 'status',
            header: t('common.status', 'Status'),
            render: (r: any) => <StatusBadge status={r.status} />,
          },
          {
            key: 'createdAt',
            header: t('admin.date', 'Date'),
            render: (r: any) => (
              <span className="text-xs text-slate-500">
                {r.createdAt ? formatDate(r.createdAt, lang) : '—'}
              </span>
            ),
          },
          {
            key: 'actions',
            header: t('common.actions', 'Actions'),
            render: (r: any) => (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="py-1 px-2.5 text-xs font-semibold"
                  onClick={() => setViewUser(r)}
                >
                  {t('admin.view', 'View')}
                </Button>
                <Button
                  variant="secondary"
                  className="py-1 px-2.5 text-xs"
                  onClick={() =>
                    usersApi
                      .updateStatus(r.id, r.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE')
                      .then(() => qc.invalidateQueries({ queryKey: ['users'] }))
                  }
                >
                  {r.status === 'ACTIVE' ? t('status.SUSPENDED', 'Suspend') : t('status.ACTIVE', 'Activate')}
                </Button>
                <Button
                  variant="secondary"
                  className="py-1 px-2.5 text-xs text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => {
                    if (confirm(`${t('common.confirmDelete', 'Delete user account')} ${r.fullName}?`)) {
                      usersApi.delete(r.id).then(() => {
                        qc.invalidateQueries({ queryKey: ['users'] });
                        qc.invalidateQueries({ queryKey: ['roles'] });
                      });
                    }
                  }}
                >
                  {t('common.delete', 'Delete')}
                </Button>
              </div>
            ),
          },
        ]} />
      </div>

      {/* View User Modal */}
      {viewUser && (
        <Modal open={!!viewUser} onClose={() => setViewUser(null)} title={`تفاصيل الحساب: ${viewUser.fullName}`} wide>
          <div className="space-y-4 text-sm text-slate-800">
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-2xl border border-primary/20">
                {viewUser.fullName ? viewUser.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h3 className="font-bold text-lg">{viewUser.fullName}</h3>
                <div className="text-slate-500">{viewUser.email}</div>
                <div className="mt-1 flex items-center gap-2">
                  <StatusBadge status={viewUser.status} />
                  <span className="text-xs bg-slate-200 px-2 py-0.5 rounded font-mono font-medium">{viewUser.role?.name}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200 p-4 rounded-xl">
                <h4 className="font-bold text-xs uppercase text-slate-500 mb-2">{t('common.moreInfo', 'معلومات إضافية')}</h4>
                <div className="space-y-1 text-sm">
                  <div><strong className="font-medium text-slate-700">تاريخ التسجيل:</strong> {new Date(viewUser.createdAt).toLocaleString('ar-EG')}</div>
                  <div><strong className="font-medium text-slate-700">معرف الحساب (ID):</strong> <span className="font-mono text-xs">{viewUser.id}</span></div>
                  <div><strong className="font-medium text-slate-700">الدور الحالي:</strong> {viewUser.role?.name || 'غير محدد'}</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t gap-2">
              <Button variant="secondary" onClick={() => usersApi.updateStatus(viewUser.id, viewUser.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE').then(() => { qc.invalidateQueries({ queryKey: ['users'] }); setViewUser({ ...viewUser, status: viewUser.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' }); })}>
                {viewUser.status === 'ACTIVE' ? 'تعطيل الحساب' : 'تفعيل الحساب'}
              </Button>
              <Button variant="outline" onClick={() => setViewUser(null)}>{t('common.close', 'إغلاق')}</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
