import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Users,
  Briefcase,
  Shield,
  UserCheck,
  Plus,
  Mail,
  CheckCircle,
} from 'lucide-react';
import { usersApi, rolesApi } from '../../../api';
import { Button } from '../../../components/ui/Button';
import { Input, Select } from '../../../components/ui/Input';
import { DataTable, Modal } from '../../../components/ui/DataTable';
import { StatusBadge, PageHeader, LoadingSpinner } from '../../../components/ui/Badge';
import { formatDate } from '../../../lib/utils';
import { getApiErrorMessage } from '../../../lib/formData';
import { useAppLanguage } from '../../../i18n';

type UserTabType = 'parents' | 'applicants' | 'staff' | 'all';

export function AdminUsersPage() {
  const { t } = useTranslation();
  const lang = useAppLanguage();
  const qc = useQueryClient();

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.list().then((r) => (Array.isArray(r.data) ? r.data : [])),
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => rolesApi.list().then((r) => (Array.isArray(r.data) ? r.data : [])),
  });

  const [activeTab, setActiveTab] = useState<UserTabType>('parents');
  const [showCreate, setShowCreate] = useState(false);
  const [viewUser, setViewUser] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [form, setForm] = useState({ fullName: '', email: '', password: '', roleId: '' });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = users.length;
    const parents = users.filter((u: any) =>
      ['PARENT', 'STUDENT', 'CLIENT', 'GUEST'].includes(u.role?.name?.toUpperCase()),
    ).length;
    const applicants = users.filter(
      (u: any) => u.role?.name?.toUpperCase() === 'APPLICANT',
    ).length;
    const staff = users.filter(
      (u: any) =>
        !['PARENT', 'STUDENT', 'CLIENT', 'GUEST', 'APPLICANT'].includes(
          u.role?.name?.toUpperCase(),
        ),
    ).length;
    const active = users.filter((u: any) => u.status === 'ACTIVE').length;
    const suspended = users.filter((u: any) => u.status === 'SUSPENDED').length;

    return { total, parents, applicants, staff, active, suspended };
  }, [users]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.password || !form.roleId) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      await usersApi.create(form);
      setForm({ fullName: '', email: '', password: '', roleId: '' });
      setShowCreate(false);
      setSuccessMsg('تم إنشاء الحساب بنجاح.');
      setTimeout(() => setSuccessMsg(null), 4000);
      qc.invalidateQueries({ queryKey: ['users'] });
      qc.invalidateQueries({ queryKey: ['roles'] });
    } catch (err: unknown) {
      setErrorMsg(getApiErrorMessage(err, t('common.errorSave', 'فشل إنشاء الحساب')));
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u: any) => {
      const roleName = (u.role?.name || '').toUpperCase();

      if (activeTab === 'parents') {
        if (!['PARENT', 'STUDENT', 'CLIENT', 'GUEST'].includes(roleName)) return false;
      } else if (activeTab === 'applicants') {
        if (roleName !== 'APPLICANT') return false;
      } else if (activeTab === 'staff') {
        if (['PARENT', 'STUDENT', 'CLIENT', 'GUEST', 'APPLICANT'].includes(roleName)) return false;
      }

      const matchesSearch =
        (u.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter
        ? u.role?.id === roleFilter || u.role?.name === roleFilter
        : true;
      const matchesStatus = statusFilter ? u.status === statusFilter : true;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, activeTab, searchTerm, roleFilter, statusFilter]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-primary dark:text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>منظومة إدارة الحسابات والمستخدمين</span>
          </div>
          <PageHeader title={t('admin.users.title', 'إدارة المستخدمين والحسابات')} />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            استعراض وإدارة جميع حسابات أولياء الأمور والعملاء، المتقدمين للوظائف، والكادر التعليمي والإداري.
          </p>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          className="shadow-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>{t('admin.users.addNew', 'إضافة حساب جديد')}</span>
        </Button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div
          onClick={() => setActiveTab('parents')}
          className={`cursor-pointer p-4 rounded-2xl border transition-all ${
            activeTab === 'parents'
              ? 'bg-primary/5 border-primary dark:bg-amber-500/10 dark:border-amber-500/40 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold">أولياء الأمور والعملاء</span>
            <Users className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.parents}</div>
          <div className="text-[10px] text-slate-400 mt-1">حسابات التقديم والقبول</div>
        </div>

        <div
          onClick={() => setActiveTab('applicants')}
          className={`cursor-pointer p-4 rounded-2xl border transition-all ${
            activeTab === 'applicants'
              ? 'bg-primary/5 border-primary dark:bg-amber-500/10 dark:border-amber-500/40 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold">المتقدمون للوظائف</span>
            <Briefcase className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.applicants}</div>
          <div className="text-[10px] text-slate-400 mt-1">حسابات التوظيف والكفاءات</div>
        </div>

        <div
          onClick={() => setActiveTab('staff')}
          className={`cursor-pointer p-4 rounded-2xl border transition-all ${
            activeTab === 'staff'
              ? 'bg-primary/5 border-primary dark:bg-amber-500/10 dark:border-amber-500/40 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold">الكادر والإدارة</span>
            <Shield className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.staff}</div>
          <div className="text-[10px] text-slate-400 mt-1">المعلمون والمسؤولون</div>
        </div>

        <div
          onClick={() => setActiveTab('all')}
          className={`cursor-pointer p-4 rounded-2xl border transition-all ${
            activeTab === 'all'
              ? 'bg-primary/5 border-primary dark:bg-amber-500/10 dark:border-amber-500/40 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold">إجمالي الحسابات</span>
            <UserCheck className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.total}</div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">
            {stats.active} نشط · {stats.suspended} معطل
          </div>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 rounded-t-2xl gap-6 overflow-x-auto">
        <button
          onClick={() => {
            setActiveTab('parents');
            setRoleFilter('');
          }}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'parents'
              ? 'border-primary text-primary dark:border-amber-400 dark:text-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <span>👨‍👩‍👧 أولياء الأمور والعملاء</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {stats.parents}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('applicants');
            setRoleFilter('');
          }}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'applicants'
              ? 'border-primary text-primary dark:border-amber-400 dark:text-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <span>💼 المتقدمون للوظائف (Job Applicants)</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {stats.applicants}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('staff');
            setRoleFilter('');
          }}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'staff'
              ? 'border-primary text-primary dark:border-amber-400 dark:text-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <span>🛡️ فريق العمل والإدارة (Staff & Admins)</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {stats.staff}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('all');
            setRoleFilter('');
          }}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'all'
              ? 'border-primary text-primary dark:border-amber-400 dark:text-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <span>🌐 جميع الحسابات (All Accounts)</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {stats.total}
          </span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-b-2xl border border-t-0 border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="w-full sm:w-80">
          <Input
            placeholder="🔍 بحث بالاسم أو البريد الإلكتروني..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs w-full sm:w-44"
          >
            <option value="">كل الأدوار والصلاحيات</option>
            {roles.map((r: any) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </Select>

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs w-full sm:w-36"
          >
            <option value="">كل الحالات</option>
            <option value="ACTIVE">نشط (ACTIVE)</option>
            <option value="SUSPENDED">معطل (SUSPENDED)</option>
          </Select>
        </div>
      </div>

      {/* Main Users Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {usersLoading ? (
          <div className="p-12 text-center">
            <LoadingSpinner />
          </div>
        ) : (
          <DataTable
            data={filteredUsers}
            columns={[
              {
                key: 'name',
                header: t('admin.users.nameHeader', 'المستخدم والبريد الإلكتروني'),
                render: (r: any) => (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary dark:text-amber-400 font-bold flex items-center justify-center text-sm border border-primary/20 shrink-0">
                      {r.fullName ? r.fullName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <span>{r.fullName}</span>
                        {r.role?.name === 'APPLICANT' && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            متقدم لوظيفة
                          </span>
                        )}
                        {r.role?.name === 'PARENT' && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                            ولي أمر
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 font-mono">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{r.email}</span>
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                key: 'role',
                header: t('admin.users.roleHeader', 'الدور والصلاحيات'),
                render: (r: any) => (
                  <select
                    className="border rounded-xl px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
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
                header: t('common.status', 'حالة الحساب'),
                render: (r: any) => <StatusBadge status={r.status} />,
              },
              {
                key: 'createdAt',
                header: t('admin.date', 'تاريخ التسجيل'),
                render: (r: any) => (
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {r.createdAt ? formatDate(r.createdAt, lang) : '—'}
                  </span>
                ),
              },
              {
                key: 'actions',
                header: t('common.actions', 'إجراءات الحساب'),
                render: (r: any) => (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Button
                      variant="outline"
                      className="py-1 px-2.5 text-xs font-semibold"
                      onClick={() => setViewUser(r)}
                    >
                      {t('admin.view', 'عرض')}
                    </Button>

                    {/* Quick navigation for applicants */}
                    {r.role?.name === 'APPLICANT' && (
                      <Link
                        to="/admin/careers"
                        className="py-1 px-2 text-[11px] font-bold rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1"
                        title="عرض طلبات التوظيف للمتقدم"
                      >
                        <Briefcase className="w-3 h-3" />
                        <span>الطلبات</span>
                      </Link>
                    )}

                    {/* Quick navigation for parents */}
                    {r.role?.name === 'PARENT' && (
                      <Link
                        to="/admin/admissions"
                        className="py-1 px-2 text-[11px] font-bold rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-700 dark:text-sky-400 border border-sky-500/20 flex items-center gap-1"
                        title="عرض طلبات الالتحاق لولي الأمر"
                      >
                        <Users className="w-3 h-3" />
                        <span>التقديمات</span>
                      </Link>
                    )}

                    <Button
                      variant="secondary"
                      className="py-1 px-2 text-xs"
                      onClick={() =>
                        usersApi
                          .updateStatus(r.id, r.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE')
                          .then(() => qc.invalidateQueries({ queryKey: ['users'] }))
                      }
                    >
                      {r.status === 'ACTIVE' ? 'تعطيل' : 'تفعيل'}
                    </Button>

                    <Button
                      variant="secondary"
                      className="py-1 px-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-200 dark:border-red-900/40"
                      onClick={() => {
                        if (
                          confirm(
                            `هل أنت متأكد من رغبتك في حذف حساب ${r.fullName} نهائياً؟`,
                          )
                        ) {
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
        )}
      </div>

      {/* User Creation Modal */}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title={t('admin.users.createTitle', 'إنشاء حساب مستخدم جديد')}
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label={t('auth.fullName', 'الاسم الكامل')}
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            placeholder="مثال: د. أحمد محمود"
            required
          />
          <Input
            label={t('auth.email', 'البريد الإلكتروني')}
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="user@manhattanschool.net"
            required
          />
          <Input
            label={t('auth.password', 'كلمة المرور')}
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
            required
            minLength={6}
          />
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-800 dark:text-slate-200">
              {t('admin.users.role', 'الدور / الصلاحية')}
            </label>
            <select
              className="w-full border rounded-xl p-2.5 text-sm bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={form.roleId}
              onChange={(e) => setForm({ ...form, roleId: e.target.value })}
              required
            >
              <option value="">{t('admin.users.selectRole', 'اختر دور الحساب...')}</option>
              {roles.map((r: { id: string; name: string; description?: string }) => (
                <option key={r.id} value={r.id}>
                  {r.name} — {r.description || r.name}
                </option>
              ))}
            </select>
          </div>
          {errorMsg && (
            <p className="text-xs text-red-600 bg-red-50 dark:bg-red-950/30 p-2.5 rounded-xl border border-red-200 dark:border-red-900/40">
              {errorMsg}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
              {t('common.cancel', 'إلغاء')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('common.loading', 'جاري الحفظ...') : t('admin.users.saveUser', 'حفظ الحساب')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View User Details Modal */}
      {viewUser && (
        <Modal
          open={!!viewUser}
          onClose={() => setViewUser(null)}
          title={`بيانات الحساب: ${viewUser.fullName}`}
          wide
        >
          <div className="space-y-4 text-sm text-slate-800 dark:text-slate-200">
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary dark:text-amber-400 font-bold flex items-center justify-center text-xl border border-primary/20 shrink-0">
                {viewUser.fullName ? viewUser.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                  {viewUser.fullName}
                </h3>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {viewUser.email}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <StatusBadge status={viewUser.status} />
                  <span className="text-xs bg-slate-200 dark:bg-slate-700 px-2.5 py-0.5 rounded-full font-mono font-bold text-slate-700 dark:text-slate-300">
                    {viewUser.role?.name}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl space-y-2 text-xs">
                <h4 className="font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">
                  معلومات التسجيل
                </h4>
                <div>
                  <strong className="text-slate-700 dark:text-slate-300">معرف الحساب:</strong>{' '}
                  <span className="font-mono text-slate-500">{viewUser.id}</span>
                </div>
                <div>
                  <strong className="text-slate-700 dark:text-slate-300">تاريخ الإنشاء:</strong>{' '}
                  <span className="font-mono">{formatDate(viewUser.createdAt, lang)}</span>
                </div>
                <div>
                  <strong className="text-slate-700 dark:text-slate-300">حالة التفعيل:</strong>{' '}
                  <span>{viewUser.status === 'ACTIVE' ? 'نشط ومفعّل' : 'معطل ومحظور'}</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl space-y-2 text-xs">
                <h4 className="font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">
                  الوصول والروابط السريعة
                </h4>
                {viewUser.role?.name === 'APPLICANT' && (
                  <div className="space-y-2">
                    <p className="text-slate-600 dark:text-slate-400">
                      هذا الحساب مسجل كمتقدم لوظائف التدريس أو الكادر الإداري.
                    </p>
                    <Link
                      to="/admin/careers"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold hover:bg-amber-500/20 transition-all"
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>استعراض طلبات التوظيف</span>
                    </Link>
                  </div>
                )}
                {viewUser.role?.name === 'PARENT' && (
                  <div className="space-y-2">
                    <p className="text-slate-600 dark:text-slate-400">
                      هذا الحساب مسجل كولي أمر طالب لتقديم طلبات الالتحاق.
                    </p>
                    <Link
                      to="/admin/admissions"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 text-sky-700 dark:text-sky-300 font-bold hover:bg-sky-500/20 transition-all"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>استعراض طلبات الالتحاق</span>
                    </Link>
                  </div>
                )}
                {!['APPLICANT', 'PARENT'].includes(viewUser.role?.name) && (
                  <p className="text-slate-600 dark:text-slate-400">
                    حساب إداري داخلي يمتلك صلاحيات إدارة النظام.
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-700 gap-2">
              <Button
                variant="secondary"
                onClick={() =>
                  usersApi
                    .updateStatus(viewUser.id, viewUser.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE')
                    .then(() => {
                      qc.invalidateQueries({ queryKey: ['users'] });
                      setViewUser({
                        ...viewUser,
                        status: viewUser.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE',
                      });
                    })
                }
              >
                {viewUser.status === 'ACTIVE' ? 'تعطيل الحساب' : 'تفعيل الحساب'}
              </Button>
              <Button variant="outline" onClick={() => setViewUser(null)}>
                {t('common.close', 'إغلاق')}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
