import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi, rolesApi } from '../../../api';
import { Button } from '../../../components/ui/Button';
import { Input, Select } from '../../../components/ui/Input';
import { DataTable, Modal } from '../../../components/ui/DataTable';
import { StatusBadge, PageHeader } from '../../../components/ui/Badge';
import { getApiErrorMessage } from '../../../lib/formData';
import { useAppLanguage } from '../../../i18n';
import { ROLE_ARABIC_NAMES } from '../ops/opsAdminShared';

export function AdminRolesPage() {
  const { t } = useTranslation();
  const lang = useAppLanguage();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: roles = [] } = useQuery({ queryKey: ['roles'], queryFn: () => rolesApi.list().then((r) => r.data) });
  const { data: permissions = [] } = useQuery({ queryKey: ['all-permissions'], queryFn: () => rolesApi.permissions().then((r) => r.data) });
  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: () => usersApi.list().then((r) => r.data) });

  const [activeTab, setActiveTab] = useState<'matrix' | 'members'>('matrix');
  const [selectedRoleForMembers, setSelectedRoleForMembers] = useState<string>('all');
  const [searchMember, setSearchMember] = useState('');

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [targetRoleIdForUser, setTargetRoleIdForUser] = useState<string>('');
  const [userForm, setUserForm] = useState({ fullName: '', email: '', password: '' });
  const [addUserError, setAddUserError] = useState<string | null>(null);

  const handleDeleteRole = async (roleId: string, roleName: string) => {
    if (confirm(`${t('common.confirmDelete', 'Delete role')} "${roleName}"?`)) {
      try {
        await rolesApi.delete(roleId);
        qc.invalidateQueries({ queryKey: ['roles'] });
      } catch (err: unknown) {
        alert(getApiErrorMessage(err, 'Cannot delete role'));
      }
    }
  };

  const handleAddUserToRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.fullName || !userForm.email || !userForm.password || !targetRoleIdForUser) return;
    setAddUserError(null);
    try {
      await usersApi.create({
        fullName: userForm.fullName,
        email: userForm.email,
        password: userForm.password,
        roleId: targetRoleIdForUser,
      });
      setShowAddUserModal(false);
      setUserForm({ fullName: '', email: '', password: '' });
      qc.invalidateQueries({ queryKey: ['users'] });
      qc.invalidateQueries({ queryKey: ['roles'] });
    } catch (err: unknown) {
      setAddUserError(getApiErrorMessage(err, t('common.errorSave', 'Failed to add user to role')));
    }
  };

  const filteredMembers = users.filter((u: any) => {
    const matchesRole =
      selectedRoleForMembers === 'all'
        ? true
        : u.role?.id === selectedRoleForMembers || u.role?.name === selectedRoleForMembers;
    const matchesSearch =
      (u.fullName || '').toLowerCase().includes(searchMember.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchMember.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div>
          <PageHeader title={t('admin.roles.title', 'Roles & Permissions')} />
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('admin.roles.subtitle', 'Define custom roles and set fine-grained system permissions.')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => navigate('/admin/roles/new')} className="shadow-sm text-xs">
            {t('admin.roles.addNew', '+ Add New Role')}
          </Button>
          <Button
            onClick={() => {
              setTargetRoleIdForUser(roles[0]?.id || '');
              setShowAddUserModal(true);
            }}
            variant="outline"
            className="shadow-2xs text-xs"
          >
            {t('admin.users.addNew', '+ Add New User')}
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('admin.roles.totalRoles', 'Total Roles')}</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{roles.length}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('admin.users.activeUsers', 'Active Users')}</div>
          <div className="text-2xl font-bold text-primary mt-1">{users.length}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('admin.roles.sysAdmins', 'System Administrators')}</div>
          <div className="text-2xl font-bold text-purple-700 dark:text-purple-400 mt-1">
            {users.filter((u: any) => u.role?.name === 'ADMIN').length}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('admin.roles.sysPerms', 'System Permissions')}</div>
          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">{permissions.length}</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 rounded-t-xl gap-6">
        <button
          onClick={() => setActiveTab('matrix')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'matrix'
              ? 'border-primary text-primary dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
          }`}
        >
          🛡️ {t('admin.roles.title', 'Roles Matrix')}
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'members'
              ? 'border-primary text-primary dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
          }`}
        >
          👥 {t('admin.roles.usersAssigned', 'Users Assigned')} ({users.length})
        </button>
      </div>

      {/* Tab 1: Roles Matrix */}
      {activeTab === 'matrix' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roles.map((role: any) => {
              const roleMeta = ROLE_ARABIC_NAMES[role.name] || { ar: role.name, badge: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700' };
              const isCoreRole = ['ADMIN', 'TEACHER', 'PARENT', 'APPLICANT', 'STUDENT', 'GUEST'].includes(role.name);

              return (
                <div key={role.id} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">{role.name}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${roleMeta.badge}`}>
                            {lang === 'ar' ? roleMeta.ar : role.name}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{role.description || '—'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 font-semibold">
                          👥 {role._count?.users ?? 0} {t('admin.navUsers', 'Users')}
                        </span>
                        {!isCoreRole && (
                          <button
                            type="button"
                            onClick={() => handleDeleteRole(role.id, role.name)}
                            className="text-xs text-red-600 hover:text-red-800 p-1"
                            title={t('common.delete', 'Delete')}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        {t('admin.roles.permissions', 'Permissions')} ({role.rolePermissions?.length || 0}):
                      </div>
                      <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto pr-1">
                        {role.rolePermissions && role.rolePermissions.length > 0 ? (
                          role.rolePermissions.map((rp: any) => (
                            <span
                              key={rp.permission?.name}
                              className="text-[11px] bg-primary/10 dark:bg-blue-950/40 text-primary dark:text-blue-400 px-2 py-0.5 rounded font-mono border border-primary/20"
                            >
                              {rp.permission?.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">{t('admin.noPermissions', 'بدون صلاحيات نظامية')}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      className="text-xs text-primary dark:text-blue-400 font-semibold hover:underline"
                      onClick={() => {
                        setSelectedRoleForMembers(role.id);
                        setActiveTab('members');
                      }}
                    >
                      عرض الأعضاء ({role._count?.users ?? 0}) ➔
                    </button>

                    <Button variant="outline" className="py-1 px-3 text-xs" onClick={() => navigate(`/admin/roles/${role.id}/edit`)}>
                      {lang === 'ar' ? 'تعديل الصلاحيات والدور' : 'Edit Role & Permissions'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Members Breakdown Table */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="w-full sm:w-80">
              <Input
                placeholder="🔍 بحث باسم العضو أو البريد..."
                value={searchMember}
                onChange={(e) => setSearchMember(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">تصفية بالدور:</span>
              <Select
                value={selectedRoleForMembers}
                onChange={(e) => setSelectedRoleForMembers(e.target.value)}
                className="w-full sm:w-56 text-xs"
              >
                <option value="all">جميع الأدوار ({users.length})</option>
                {roles.map((r: any) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r._count?.users ?? 0})
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <DataTable
              data={filteredMembers}
              columns={[
                {
                  key: 'name',
                  header: 'المستخدم / العضو',
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
                  header: 'الدور الحالي (Reassign Role)',
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
                        <option key={ro.id} value={ro.id}>
                          {ro.name}
                        </option>
                      ))}
                    </select>
                  ),
                },
                {
                  key: 'status',
                  header: 'حالة الحساب',
                  render: (r: any) => <StatusBadge status={r.status} />,
                },
                {
                  key: 'actions',
                  header: 'إجراءات',
                  render: (r: any) => (
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        className="py-1 px-2.5 text-xs"
                        onClick={() =>
                          usersApi
                            .updateStatus(r.id, r.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE')
                            .then(() => qc.invalidateQueries({ queryKey: ['users'] }))
                        }
                      >
                        {r.status === 'ACTIVE' ? 'تعطيل الحساب' : 'تفعيل'}
                      </Button>
                      <Button
                        variant="secondary"
                        className="py-1 px-2.5 text-xs text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => {
                          if (confirm(`حذف حساب ${r.fullName}؟`)) {
                            usersApi.delete(r.id).then(() => {
                              qc.invalidateQueries({ queryKey: ['users'] });
                              qc.invalidateQueries({ queryKey: ['roles'] });
                            });
                          }
                        }}
                      >
                        حذف
                      </Button>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </div>
      )}

      {/* Modal: Add User to Role */}
      <Modal open={showAddUserModal} onClose={() => setShowAddUserModal(false)} title="إضافة مستخدم جديد وتعيين دوره الوظيفي">
        <form onSubmit={handleAddUserToRole} className="space-y-4">
          <Input label="الاسم بالكامل" value={userForm.fullName} onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })} required />
          <Input label="البريد الإلكتروني" type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} required />
          <Input label="كلمة المرور" type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} required minLength={6} />
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-800">{t('admin.customRole', 'الدور الوظيفي المخصص')}</label>
            <Select value={targetRoleIdForUser} onChange={(e) => setTargetRoleIdForUser(e.target.value)} required>
              {roles.map((r: any) => (
                <option key={r.id} value={r.id}>
                  {r.name} — ({r.description || r.name})
                </option>
              ))}
            </Select>
          </div>

          {addUserError && (
            <p className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">{addUserError}</p>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button type="button" variant="outline" onClick={() => setShowAddUserModal(false)}>
              إلغاء
            </Button>
            <Button type="submit">حفظ وإنشاء المستخدم</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
