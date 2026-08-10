import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { jobRequirementsApi, storageApi } from '../../api';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { DataTable } from '../../components/ui/DataTable';
import { PageHeader } from '../../components/ui/Badge';
import { useAppLanguage } from '../../i18n';
import { HIRING_DOCUMENTS } from '../../constants/hiringDocuments';
import { AdminPageGuide } from '../../components/admin/AdminPageGuide';
import { JobRequirementsLivePreview } from '../../components/admin/JobRequirementsLivePreview';
import { mediaUrl } from '../../lib/utils';

const EMPLOYMENT_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT'] as const;

const EXTRA_DOC_CODES = ['CV_RESUME', 'TEACHING_LICENSE', 'DEGREE_CERTIFICATE', 'OTHER'] as const;

const EXTRA_DOC_LABELS: Record<string, { ar: string; en: string }> = {
  CV_RESUME: { ar: 'السيرة الذاتية (CV)', en: 'CV / Resume' },
  TEACHING_LICENSE: { ar: 'رخصة التدريس', en: 'Teaching License' },
  DEGREE_CERTIFICATE: { ar: 'شهادة المؤهل', en: 'Degree Certificate' },
  OTHER: { ar: 'مستند آخر', en: 'Other document' },
};

const ALL_DOCUMENT_CODES = [
  ...HIRING_DOCUMENTS.map((d) => d.code),
  ...EXTRA_DOC_CODES,
];

function getDocLabel(code: string, isAr: boolean) {
  const fromHiring = HIRING_DOCUMENTS.find((d) => d.code === code);
  if (fromHiring) return isAr ? fromHiring.titleAr : fromHiring.titleEn;
  const extra = EXTRA_DOC_LABELS[code];
  if (extra) return isAr ? extra.ar : extra.en;
  return code.replace(/_/g, ' ');
}

function getEmploymentLabel(type: string | undefined, t: (k: string) => string) {
  if (type === 'FULL_TIME') return t('admin.employmentTypeFullTime');
  if (type === 'PART_TIME') return t('admin.employmentTypePartTime');
  if (type === 'CONTRACT') return t('admin.employmentTypeContract');
  return type || '—';
}

export function AdminJobRequirementsPage() {
  const { t } = useTranslation();
  const lang = useAppLanguage();
  const isAr = lang === 'ar';
  const qc = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    title: '',
    titleAr: '',
    description: '',
    descriptionAr: '',
    imageUrl: '',
    employmentType: 'FULL_TIME',
    requiredDocumentTypes: [] as string[],
    minYearsExperience: 0,
    sortOrder: 0,
  });

  const canSubmit = form.title.trim().length > 0 && form.requiredDocumentTypes.length > 0;

  const { data: items = [] } = useQuery({
    queryKey: ['job-requirements-admin'],
    queryFn: () => jobRequirementsApi.list(true).then((r) => r.data),
  });

  const toggleDocType = (docType: string) => {
    setForm((prev) => ({
      ...prev,
      requiredDocumentTypes: prev.requiredDocumentTypes.includes(docType)
        ? prev.requiredDocumentTypes.filter((d) => d !== docType)
        : [...prev.requiredDocumentTypes, docType],
    }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin.jobRequirementsTitle')}
        subtitle={t('admin.jobRequirementsSubtitle')}
      />

      <AdminPageGuide guideKey="jobRequirements" hidePreview />

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <form
          className="space-y-5 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!canSubmit) return;

            let imageUrl = form.imageUrl;
            if (selectedFile) {
              const res = await storageApi.upload(selectedFile, 'job-requirements');
              imageUrl = res.data.url;
            }

            jobRequirementsApi
              .create({
                ...form,
                imageUrl,
                minYearsExperience: form.minYearsExperience || undefined,
              })
              .then(() => {
                setSelectedFile(null);
                setForm({
                  title: '',
                  titleAr: '',
                  description: '',
                  descriptionAr: '',
                  imageUrl: '',
                  employmentType: 'FULL_TIME',
                  requiredDocumentTypes: [],
                  minYearsExperience: 0,
                  sortOrder: 0,
                });
                qc.invalidateQueries({ queryKey: ['job-requirements-admin'] });
              });
          }}
        >
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3">
              {t('admin.basicInfo')}
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label={`${t('admin.title')} *`}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
              <Input
                label={`${t('admin.titleAr')} (${t('admin.optionalField')})`}
                value={form.titleAr}
                onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
              />
              <Select
                label={`${t('admin.employmentType')} *`}
                value={form.employmentType}
                onChange={(e) => setForm({ ...form, employmentType: e.target.value })}
              >
                {EMPLOYMENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {getEmploymentLabel(type, t)}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">
              {t('admin.requiredDocuments')} *
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              {isAr
                ? 'اختر المستندات التي يجب على المتقدم رفعها عند التقديم.'
                : 'Select documents applicants must upload when applying.'}
            </p>
            <div className="flex flex-wrap gap-2">
              {ALL_DOCUMENT_CODES.map((docType) => {
                const selected = form.requiredDocumentTypes.includes(docType);
                return (
                  <button
                    key={docType}
                    type="button"
                    onClick={() => toggleDocType(docType)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors text-start max-w-full ${
                      selected
                        ? 'bg-primary text-white border-primary'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {getDocLabel(docType, isAr)}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3">
              {t('admin.optionalDetails')}
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label={t('admin.sortOrder')}
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
              />
              <Input
                label={t('admin.minYearsExperience')}
                type="number"
                min={0}
                value={form.minYearsExperience}
                onChange={(e) =>
                  setForm({ ...form, minYearsExperience: Number(e.target.value) })
                }
              />
              <Textarea
                label={t('admin.description')}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
              />
              <Textarea
                label={t('admin.descriptionAr')}
                value={form.descriptionAr}
                onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })}
                rows={2}
              />
            </div>
          </div>

          <div className="space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-3">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              🖼️ {isAr ? 'صورة توضيحية للشرط (اختياري)' : 'Requirement Banner Image (Optional)'}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
              {form.imageUrl && (
                <div className="relative group">
                  <img src={mediaUrl(form.imageUrl)} alt="Preview" className="h-10 w-14 object-cover rounded-lg border" />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, imageUrl: '' })}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full h-4 w-4 text-[10px] flex items-center justify-center shadow-xs"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Button type="submit" disabled={!canSubmit}>
              {t('admin.addRequirement')}
            </Button>
            {!canSubmit && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                {isAr
                  ? 'أدخل العنوان (إنجليزي) واختر مستنداً واحداً على الأقل.'
                  : 'Enter title (English) and select at least one document.'}
              </p>
            )}
          </div>
        </form>

        <JobRequirementsLivePreview
          employmentType={form.employmentType}
          requiredDocumentTypes={form.requiredDocumentTypes}
        />
      </div>

      <DataTable
        data={items}
        columns={[
          {
            key: 'preview',
            header: isAr ? 'الصورة' : 'Image',
            align: 'center',
            render: (r: { imageUrl?: string }) =>
              r.imageUrl ? (
                <img src={mediaUrl(r.imageUrl)} alt="Requirement" className="h-10 w-14 object-cover rounded-lg border mx-auto" />
              ) : (
                <span className="text-xs text-slate-400">—</span>
              ),
          },
          {
            key: 'title',
            header: t('admin.title') as string,
            render: (r: { title: string; titleAr?: string }) =>
              isAr && r.titleAr ? r.titleAr : r.title,
          },
          {
            key: 'employmentType',
            header: t('admin.employmentType') as string,
            render: (r: { employmentType?: string }) =>
              getEmploymentLabel(r.employmentType, t),
          },
          {
            key: 'docs',
            header: t('admin.documents') as string,
            render: (r: { requiredDocumentTypes?: string[] }) => {
              const docs = r.requiredDocumentTypes || [];
              if (!docs.length) return '—';
              return (
                <span className="text-xs line-clamp-2">
                  {docs.map((d) => getDocLabel(d, isAr)).join(' · ')}
                </span>
              );
            },
          },
          {
            key: 'active',
            header: t('common.status') as string,
            render: (r: { isActive: boolean }) =>
              r.isActive
                ? isAr
                  ? 'نشط'
                  : 'Active'
                : isAr
                  ? 'معطّل'
                  : 'Inactive',
          },
          {
            key: 'actions',
            header: t('common.actions') as string,
            render: (r: { id: string; isActive: boolean }) => (
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="py-1 px-2.5 text-xs"
                  onClick={() =>
                    jobRequirementsApi
                      .update(r.id, { isActive: !r.isActive })
                      .then(() => qc.invalidateQueries({ queryKey: ['job-requirements-admin'] }))
                  }
                >
                  {r.isActive ? t('common.draft') : t('common.published')}
                </Button>
                <Button
                  variant="danger"
                  className="py-1 px-2.5 text-xs"
                  onClick={() =>
                    jobRequirementsApi
                      .remove(r.id)
                      .then(() => qc.invalidateQueries({ queryKey: ['job-requirements-admin'] }))
                  }
                >
                  {t('admin.delete')}
                </Button>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
