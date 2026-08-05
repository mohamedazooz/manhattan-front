import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { formDocumentsApi } from '../../api';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { DataTable } from '../../components/ui/DataTable';
import { PageHeader, StatusBadge } from '../../components/ui/Badge';
import { AdminPageGuide } from '../../components/admin/AdminPageGuide';
import { useAppLanguage } from '../../i18n';

const emptyForm = {
  category: 'STUDENT',
  subCategory: 'GENERAL',
  titleAr: '',
  titleEn: '',
  descAr: '',
  descEn: '',
  requiredStatus: 'REQUIRED',
  downloadUrl: '',
  downloadName: '',
  iconType: 'file',
  sortOrder: 0,
};

export function AdminFormDocumentsPage() {
  const { t } = useTranslation();
  const lang = useAppLanguage();
  const qc = useQueryClient();
  const [form, setForm] = useState(emptyForm);

  const { data: items = [] } = useQuery({
    queryKey: ['form-documents-admin'],
    queryFn: () => formDocumentsApi.admin().then((r) => r.data),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin.formDocumentsTitle', 'النماذج والمستندات')}
        subtitle={t(
          'admin.formDocumentsSubtitle',
          'إدارة النماذج والمستندات المعروضة لأولياء الأمور والموظفين.',
        )}
      />

      <AdminPageGuide guideKey="formDocuments" />

      <form
        className="grid md:grid-cols-2 gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800"
        onSubmit={(e) => {
          e.preventDefault();
          formDocumentsApi.create(form).then(() => {
            setForm(emptyForm);
            qc.invalidateQueries({ queryKey: ['form-documents-admin'] });
            qc.invalidateQueries({ queryKey: ['form-documents'] });
          });
        }}
      >
        <Select
          label={t('admin.category', 'الفئة')}
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          <option value="STUDENT">STUDENT</option>
          <option value="STAFF">STAFF</option>
        </Select>
        <Input
          label={t('admin.subCategory', 'الفئة الفرعية')}
          value={form.subCategory}
          onChange={(e) => setForm({ ...form, subCategory: e.target.value })}
        />
        <Input
          label={t('admin.titleAr', 'العنوان (عربي)')}
          value={form.titleAr}
          onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
          required
        />
        <Input
          label={t('admin.titleEn', 'العنوان (إنجليزي)')}
          value={form.titleEn}
          onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
          required
        />
        <Textarea
          label={t('admin.descAr', 'الوصف (عربي)')}
          value={form.descAr}
          onChange={(e) => setForm({ ...form, descAr: e.target.value })}
          rows={2}
          required
        />
        <Textarea
          label={t('admin.descEn', 'الوصف (إنجليزي)')}
          value={form.descEn}
          onChange={(e) => setForm({ ...form, descEn: e.target.value })}
          rows={2}
          required
        />
        <Select
          label={t('admin.requiredStatus', 'الحالة المطلوبة')}
          value={form.requiredStatus}
          onChange={(e) => setForm({ ...form, requiredStatus: e.target.value })}
        >
          <option value="REQUIRED">REQUIRED</option>
          <option value="TRANSFER">TRANSFER</option>
          <option value="OPTIONAL">OPTIONAL</option>
        </Select>
        <Input
          label={t('admin.downloadUrl', 'رابط التحميل')}
          value={form.downloadUrl}
          onChange={(e) => setForm({ ...form, downloadUrl: e.target.value })}
        />
        <Input
          label={t('admin.downloadName', 'اسم الملف')}
          value={form.downloadName}
          onChange={(e) => setForm({ ...form, downloadName: e.target.value })}
        />
        <Input
          label={t('admin.sortOrder', 'الترتيب')}
          type="number"
          value={form.sortOrder}
          onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
        />
        <div className="md:col-span-2">
          <Button type="submit">{t('admin.addDocument', 'إضافة مستند')}</Button>
        </div>
      </form>

      <DataTable
        data={items}
        columns={[
          {
            key: 'title',
            header: t('admin.title', 'العنوان') as string,
            render: (r: { titleAr: string; titleEn: string }) =>
              lang === 'ar' ? r.titleAr : r.titleEn,
          },
          { key: 'category', header: t('admin.category', 'الفئة') as string, render: (r: { category: string }) => r.category },
          {
            key: 'status',
            header: t('common.status', 'الحالة') as string,
            render: (r: { status: string }) => <StatusBadge status={r.status} />,
          },
          {
            key: 'actions',
            header: t('common.actions', 'الإجراءات') as string,
            render: (r: { id: string; status: string }) => (
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="py-1 px-2.5 text-xs"
                  onClick={() =>
                    formDocumentsApi
                      .updateStatus(r.id, r.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED')
                      .then(() => {
                        qc.invalidateQueries({ queryKey: ['form-documents-admin'] });
                        qc.invalidateQueries({ queryKey: ['form-documents'] });
                      })
                  }
                >
                  {r.status === 'PUBLISHED' ? t('common.draft', 'Draft') : t('common.published', 'Publish')}
                </Button>
                <Button
                  variant="danger"
                  className="py-1 px-2.5 text-xs"
                  onClick={() =>
                    formDocumentsApi.remove(r.id).then(() => {
                      qc.invalidateQueries({ queryKey: ['form-documents-admin'] });
                      qc.invalidateQueries({ queryKey: ['form-documents'] });
                    })
                  }
                >
                  {t('admin.delete', 'حذف')}
                </Button>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
