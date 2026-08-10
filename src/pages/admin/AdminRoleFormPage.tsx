import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { rolesApi, usersApi } from '../../api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { LoadingSpinner, PageHeader, StatusBadge } from '../../components/ui/Badge';
import { useAppLanguage } from '../../i18n';
import { getApiErrorMessage } from '../../lib/formData';
import { ArrowLeft, CheckSquare, Square, Shield, Users, Search, CheckCircle, Info } from 'lucide-react';

interface PermissionItem {
  id?: string;
  name: string;
  description?: string;
}

interface CategoryGroup {
  key: string;
  titleAr: string;
  titleEn: string;
  icon: string;
  prefixes: string[];
  exactNames?: string[];
}

const CATEGORIES: CategoryGroup[] = [
  {
    key: 'blog',
    titleAr: '📰 المدونة والأخبار',
    titleEn: 'Blog & News',
    icon: '📰',
    prefixes: ['VIEW_BLOG', 'CREATE_BLOG', 'UPDATE_BLOG', 'DELETE_BLOG', 'PUBLISH_BLOG', 'APPROVE_COMMENTS'],
  },
  {
    key: 'admissions',
    titleAr: '📝 التسجيل والقبول',
    titleEn: 'Admissions',
    icon: '📝',
    prefixes: ['VIEW_ALL_ADMISSIONS', 'CREATE_ADMISSION', 'UPDATE_ADMISSION_STATUS', 'ADD_ADMISSION_NOTE', 'DELETE_ADMISSION', 'MANAGE_ADMISSION_REQUIREMENTS', 'VIEW_OWN_ADMISSION'],
  },
  {
    key: 'jobs',
    titleAr: '💼 التوظيف والوظائف',
    titleEn: 'Careers & Hiring',
    icon: '💼',
    prefixes: ['MANAGE_JOBS', 'VIEW_APPLICATIONS', 'EVALUATE_APPLICATION', 'UPDATE_JOB_STATUS', 'DELETE_JOB_APPLICATION', 'CREATE_JOB_APPLICATION', 'VIEW_OWN_JOB_APPLICATION'],
  },
  {
    key: 'education',
    titleAr: '🎓 البرامج والأكاديميات',
    titleEn: 'Academics & Education',
    icon: '🎓',
    prefixes: ['VIEW_EDUCATION', 'MANAGE_EDUCATION'],
  },
  {
    key: 'gallery',
    titleAr: '🖼️ معرض الصور والألبوم',
    titleEn: 'Photo Gallery',
    icon: '🖼️',
    prefixes: ['VIEW_GALLERY', 'MANAGE_GALLERY'],
  },
  {
    key: 'users_roles',
    titleAr: '👥 المستخدمين والأدوار',
    titleEn: 'Users & Roles',
    icon: '👥',
    prefixes: ['VIEW_USERS', 'MANAGE_USERS', 'MANAGE_ROLES'],
  },
  {
    key: 'cms',
    titleAr: '🌐 محتوى الموقع والصفحات',
    titleEn: 'CMS & Pages',
    icon: '🌐',
    prefixes: ['MANAGE_LANDING', 'MANAGE_ABOUT_US', 'UPDATE_SYSTEM_CONFIG'],
  },
  {
    key: 'system',
    titleAr: '⚙️ لوحة التحكم والإشعارات والنظام',
    titleEn: 'System & Notifications',
    icon: '⚙️',
    prefixes: ['VIEW_DASHBOARD', 'MANAGE_EMAIL_TEMPLATES', 'MANAGE_NOTIFICATIONS', 'VIEW_AUDIT_LOGS'],
  },
];

export function AdminRoleFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const lang = useAppLanguage();
  const isAr = lang === 'ar';
  const qc = useQueryClient();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch all system permissions
  const { data: allPermissions = [], isLoading: permsLoading } = useQuery({
    queryKey: ['all-permissions'],
    queryFn: () => rolesApi.permissions().then((r) => r.data as PermissionItem[]),
  });

  // Fetch role if edit mode
  const { data: roleData, isLoading: roleLoading } = useQuery({
    queryKey: ['role-detail', id],
    queryFn: () => rolesApi.get(id!).then((r) => r.data),
    enabled: isEdit,
  });

  // Fetch all roles for user re-assignment list
  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => rolesApi.list().then((r) => r.data),
  });

  useEffect(() => {
    if (roleData) {
      setName(roleData.name || '');
      setDescription(roleData.description || '');
      if (roleData.rolePermissions) {
        setSelectedPerms(roleData.rolePermissions.map((rp: any) => rp.permission?.name || rp.permissionName));
      } else if (roleData.permissions) {
        setSelectedPerms(roleData.permissions.map((p: any) => typeof p === 'string' ? p : p.name));
      }
    }
  }, [roleData]);

  const isCoreRole = useMemo(() => {
    return ['ADMIN', 'TEACHER', 'HR', 'PARENT', 'APPLICANT', 'STUDENT', 'GUEST'].includes(name.toUpperCase());
  }, [name]);

  // Group permissions into categories
  const categorizedPermissions = useMemo(() => {
    const matched = new Set<string>();
    const groups = CATEGORIES.map((cat) => {
      const items = allPermissions.filter((p) => {
        const matchesPrefix = cat.prefixes.some((pref) => p.name === pref || p.name.startsWith(pref));
        if (matchesPrefix) {
          matched.add(p.name);
          return true;
        }
        return false;
      });
      return { ...cat, items };
    });

    // Uncategorized
    const remaining = allPermissions.filter((p) => !matched.has(p.name));
    if (remaining.length > 0) {
      groups.push({
        key: 'other',
        titleAr: '🧩 صلاحيات أخرى',
        titleEn: 'Other Permissions',
        icon: '🧩',
        prefixes: [],
        items: remaining,
      });
    }

    return groups.filter((g) => g.items.length > 0);
  }, [allPermissions]);

  // Filtered by search
  const filteredGroups = useMemo(() => {
    if (!searchTerm.trim()) return categorizedPermissions;
    const term = searchTerm.toLowerCase();
    return categorizedPermissions
      .map((group) => {
        const items = group.items.filter(
          (p) =>
            p.name.toLowerCase().includes(term) ||
            (p.description || '').toLowerCase().includes(term),
        );
        return { ...group, items };
      })
      .filter((g) => g.items.length > 0);
  }, [categorizedPermissions, searchTerm]);

  const togglePermission = (permName: string) => {
    setSelectedPerms((prev) =>
      prev.includes(permName) ? prev.filter((p) => p !== permName) : [...prev, permName],
    );
  };

  const toggleCategory = (catItems: PermissionItem[]) => {
    const catNames = catItems.map((i) => i.name);
    const allSelected = catNames.every((n) => selectedPerms.includes(n));
    if (allSelected) {
      setSelectedPerms((prev) => prev.filter((n) => !catNames.includes(n)));
    } else {
      setSelectedPerms((prev) => Array.from(new Set([...prev, ...catNames])));
    }
  };

  const selectAllSystemPerms = () => {
    setSelectedPerms(allPermissions.map((p) => p.name));
  };

  const clearAllSystemPerms = () => {
    setSelectedPerms([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setErrorMsg(null);
    try {
      if (isEdit && id) {
        await rolesApi.update(id, {
          name: isCoreRole ? undefined : name.trim(),
          description: description.trim(),
          permissionNames: selectedPerms,
        });
      } else {
        await rolesApi.create({
          name: name.trim().toUpperCase(),
          description: description.trim(),
          permissionNames: selectedPerms,
        });
      }
      qc.invalidateQueries({ queryKey: ['roles'] });
      qc.invalidateQueries({ queryKey: ['all-permissions'] });
      navigate('/admin/roles');
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err, isAr ? 'فشل حفظ الدور والصلاحيات' : 'Failed to save role'));
    } finally {
      setSaving(false);
    }
  };

  if (permsLoading || (isEdit && roleLoading)) return <LoadingSpinner />;

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              to="/admin/roles"
              className="text-xs text-slate-500 hover:text-primary dark:text-slate-400 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
              <span>{isAr ? 'الرجوع لجدول الأدوار' : 'Back to Roles'}</span>
            </Link>
          </div>
          <PageHeader
            title={
              isEdit
                ? isAr
                  ? `تعديل الدور والصلاحيات: ${name}`
                  : `Edit Role: ${name}`
                : isAr
                ? 'إنشاء دور جديد وتحديد الصلاحيات'
                : 'Create New Custom Role'
            }
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isAr
              ? 'قم بتحديد اسم الدور الإداري وتعيين كافة الصلاحيات الدقيقة لكل شاشة أو إجراء بالموقع.'
              : 'Specify the role title and assign granular permissions for every page and action.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" type="button" onClick={() => navigate('/admin/roles')}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={saving}>
            {saving
              ? t('common.loading', 'Loading...')
              : isEdit
              ? isAr
                ? 'حفظ التعديلات'
                : 'Save Changes'
              : isAr
              ? 'إنشاء الدور'
              : 'Create Role'}
          </Button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-sm text-red-700 dark:text-red-300">
          ⚠️ {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Role Information Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-slate-900 dark:text-white">
              {isAr ? 'البيانات الأساسية للدور' : 'Basic Role Information'}
            </h3>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Input
                label={isAr ? 'اسم الدور (باللغة الإنجليزية) *' : 'Role Identifier Name *'}
                placeholder="e.g. ACADEMIC_COORDINATOR"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isEdit && isCoreRole}
                required
              />
              {isCoreRole && isEdit && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" />
                  {isAr ? 'دور أساسي بالنظام لا يمكن تغيير اسمه' : 'Core system role identifier cannot be renamed'}
                </p>
              )}
            </div>

            <div>
              <Input
                label={isAr ? 'المسمى الوظيفي أو الوصف (بالعربي)' : 'Display Name / Description'}
                placeholder={isAr ? 'مثال: منسق الشئون الأكاديمية والأنشطة' : 'e.g. Academic Affairs Coordinator'}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Permissions Selection Grid */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 dark:text-white">
                  {isAr ? 'صلاحيات الدور والإجراءات بالموقع' : 'Permissions & Action Controls'}
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isAr
                  ? `تم تحديد (${selectedPerms.length}) من أصل (${allPermissions.length}) صلاحية نظامية.`
                  : `Selected (${selectedPerms.length}) of (${allPermissions.length}) total permissions.`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="outline" className="py-1 px-3 text-xs" onClick={selectAllSystemPerms}>
                <CheckSquare className="w-3.5 h-3.5 me-1 text-emerald-600" />
                {isAr ? 'تحديد كافة الصلاحيات' : 'Select All Permissions'}
              </Button>
              <Button type="button" variant="outline" className="py-1 px-3 text-xs text-slate-600" onClick={clearAllSystemPerms}>
                <Square className="w-3.5 h-3.5 me-1 text-slate-400" />
                {isAr ? 'إلغاء تحديد الكل' : 'Clear All'}
              </Button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 rtl:right-3 rtl:left-auto top-3" />
            <input
              type="text"
              placeholder={isAr ? '🔍 تصفية ابحث عن صلاحية محددة أو وصف...' : 'Search permissions by name or description...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full ps-9 pe-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Categorized Permissions Accordions/Cards */}
          <div className="space-y-5">
            {filteredGroups.map((group) => {
              const catNames = group.items.map((i) => i.name);
              const selectedInGroup = catNames.filter((n) => selectedPerms.includes(n));
              const isAllGroupSelected = catNames.length > 0 && selectedInGroup.length === catNames.length;

              return (
                <div
                  key={group.key}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-800/30"
                >
                  <div className="flex items-center justify-between bg-slate-100/80 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {isAr ? group.titleAr : group.titleEn}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                        {selectedInGroup.length} / {catNames.length}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleCategory(group.items)}
                      className="text-xs font-semibold text-primary dark:text-blue-400 hover:underline"
                    >
                      {isAllGroupSelected ? (isAr ? 'إلغاء المجموعة' : 'Deselect Category') : (isAr ? 'تحديد كافة المجموعة' : 'Select Category')}
                    </button>
                  </div>

                  <div className="p-4 grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {group.items.map((perm) => {
                      const isChecked = selectedPerms.includes(perm.name);
                      return (
                        <label
                          key={perm.name}
                          className={`flex items-start gap-2.5 p-3 rounded-xl border transition-all cursor-pointer ${
                            isChecked
                              ? 'bg-primary/5 dark:bg-blue-950/40 border-primary/40 dark:border-blue-700 shadow-2xs'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePermission(perm.name)}
                            className="mt-0.5 rounded border-slate-300 text-primary focus:ring-primary/20"
                          />
                          <div>
                            <div className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100">
                              {perm.name}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                              {perm.description || perm.name}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Assigned Users Section (If Editing) */}
        {isEdit && roleData && roleData.users && roleData.users.length > 0 && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-slate-900 dark:text-white">
                {isAr ? `المستخدمين المسندين بهذا الدور (${roleData.users.length})` : `Assigned Users (${roleData.users.length})`}
              </h3>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {roleData.users.map((u: any) => (
                <div key={u.id} className="py-2.5 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                      {u.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{u.fullName}</span>
                      <span className="text-slate-400 ms-2">({u.email})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={u.status} />
                    <select
                      className="border rounded-lg px-2 py-1 text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                      value={id}
                      onChange={(e) => {
                        usersApi.updateRole(u.id, e.target.value).then(() => {
                          qc.invalidateQueries({ queryKey: ['role-detail', id] });
                          qc.invalidateQueries({ queryKey: ['users'] });
                          qc.invalidateQueries({ queryKey: ['roles'] });
                        });
                      }}
                    >
                      {roles.map((ro: any) => (
                        <option key={ro.id} value={ro.id}>
                          {ro.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Actions Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" type="button" onClick={() => navigate('/admin/roles')}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button type="submit" disabled={saving}>
            {saving
              ? t('common.loading', 'Loading...')
              : isEdit
              ? isAr
                ? 'حفظ الدور والتغييرات'
                : 'Save Role & Permissions'
              : isAr
              ? 'إنشاء وتفعيل الدور'
              : 'Create Role'}
          </Button>
        </div>
      </form>
    </div>
  );
}
