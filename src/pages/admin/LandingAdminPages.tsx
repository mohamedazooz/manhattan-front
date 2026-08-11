import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { landingApi } from '../../api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { DataTable, Modal } from '../../components/ui/DataTable';
import { PageHeader } from '../../components/ui/Badge';
import { AdminPageGuide } from '../../components/admin/AdminPageGuide';
import { RichTextEditor } from '../../components/ui/RichTextEditor';
import { mediaUrl } from '../../lib/utils';
import { buildFormData, getApiErrorMessage, omitKeys } from '../../lib/formData';
import type { LandingHero, LandingSection } from '../../types';

const emptyHeroForm = {
  title: '',
  titleAr: '',
  subtitle: '',
  subtitleAr: '',
  ctaText: '',
  ctaTextAr: '',
  ctaLink: '',
  isActive: false,
};

export function AdminHeroPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyHeroForm);
  const [image, setImage] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { data: heroes = [] } = useQuery({
    queryKey: ['heroes'],
    queryFn: () => landingApi.heroes().then((r) => r.data),
  });

  useEffect(() => {
    if (!image) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(image);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (image) {
        const fd = buildFormData(form);
        fd.append('image', image);
        return editId ? landingApi.updateHero(editId, fd) : landingApi.createHero(fd);
      }
      return editId ? landingApi.updateHero(editId, form) : landingApi.createHero(form);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['heroes'] });
      setOpen(false);
      setEditId(null);
      setImage(null);
      setCurrentImageUrl(null);
      setSaveError(null);
    },
    onError: (error) => setSaveError(getApiErrorMessage(error, t('common.errorSave', 'Failed to save slide'))),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => landingApi.deleteHero(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['heroes'] });
      qc.invalidateQueries({ queryKey: ['landing'] });
    },
  });

  const openCreate = () => {
    setEditId(null);
    setForm(emptyHeroForm);
    setImage(null);
    setCurrentImageUrl(null);
    setSaveError(null);
    setOpen(true);
  };

  const openEdit = (hero: LandingHero) => {
    setEditId(hero.id);
    setForm({
      title: hero.title,
      titleAr: hero.titleAr || '',
      subtitle: hero.subtitle || '',
      subtitleAr: hero.subtitleAr || '',
      ctaText: hero.ctaText || '',
      ctaTextAr: hero.ctaTextAr || '',
      ctaLink: hero.ctaLink || '',
      isActive: hero.isActive ?? false,
    });
    setImage(null);
    setCurrentImageUrl(hero.imageUrl || null);
    setSaveError(null);
    setOpen(true);
  };

  const displayImage = previewUrl || (currentImageUrl ? mediaUrl(currentImageUrl) : null);

  return (
    <div className="w-full space-y-6">
      <AdminPageGuide guideKey="hero" />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <PageHeader title={t('admin.heroCrud.title', 'Hero Carousel Management')} />
          <p className="text-sm text-slate-500 mt-1">
            {t('admin.heroCrud.subtitle', 'Manage homepage hero slides, titles, subtitles, and CTA buttons.')}
          </p>
        </div>
        <Button onClick={openCreate}>{t('admin.heroCrud.addNew', '+ Add Hero Slide')}</Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <DataTable
          data={heroes}
          columns={[
            { key: 'title', header: t('common.title', 'Title'), render: (r) => <span className="font-semibold">{r.title}</span> },
            {
              key: 'active',
              header: t('common.status', 'Status'),
              render: (r) => (
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${r.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                  {r.isActive ? t('status.ACTIVE', 'Active') : t('status.SUSPENDED', 'Inactive')}
                </span>
              ),
            },
            {
              key: 'image',
              header: t('admin.education.coverImage', 'Image'),
              render: (r) =>
                r.imageUrl ? (
                  <img
                    src={mediaUrl(r.imageUrl)}
                    className="h-12 w-20 object-cover rounded-md border shadow-xs"
                    alt=""
                  />
                ) : (
                  '—'
                ),
            },
            {
              key: 'actions',
              header: t('common.actions', 'Actions'),
              render: (r) => (
                <div className="flex gap-2">
                  <Button variant="outline" className="py-1 px-3 text-xs" onClick={() => openEdit(r)}>
                    {t('common.edit', 'Edit')}
                  </Button>
                  <Button variant="primary" className="py-1 px-3 text-xs bg-red-600 hover:bg-red-700 text-white" onClick={() => deleteMutation.mutate(r.id)}>
                    {t('common.delete', 'Delete')}
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editId ? t('common.edit', 'Edit Slide') : t('admin.heroCrud.addNew', '+ Add Hero Slide')} wide>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate();
          }}
        >
          <div className="grid md:grid-cols-2 gap-4">
            <Input label={t('common.title', 'Title (English)')} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <Input label={t('common.title', 'Title (Arabic)')} value={form.titleAr} onChange={(e) => setForm({ ...form, titleAr: e.target.value })} dir="rtl" />
            <Input label={t('common.subtitle', 'Subtitle (English)')} value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
            <Input label={t('common.subtitle', 'Subtitle (Arabic)')} value={form.subtitleAr} onChange={(e) => setForm({ ...form, subtitleAr: e.target.value })} dir="rtl" />
            <Input label={t('admin.heroCrud.ctaText', 'CTA Text (English)')} value={form.ctaText} onChange={(e) => setForm({ ...form, ctaText: e.target.value })} />
            <Input label={t('admin.heroCrud.ctaText', 'CTA Text (Arabic)')} value={form.ctaTextAr} onChange={(e) => setForm({ ...form, ctaTextAr: e.target.value })} dir="rtl" />
            <Input label={t('admin.heroCrud.ctaLink', 'CTA Link')} value={form.ctaLink} onChange={(e) => setForm({ ...form, ctaLink: e.target.value })} className="md:col-span-2" placeholder="/admissions" />
          </div>

          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <input type="checkbox" className="rounded text-primary focus:ring-primary h-4 w-4" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            {t('status.ACTIVE', 'Active')}
          </label>

          <Input label={t('admin.education.coverImage', 'Image')} type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />

          {displayImage && (
            <div>
              <p className="text-xs text-slate-500 mb-1">{t('common.preview', 'Preview')}:</p>
              <img src={displayImage} alt="Hero preview" className="w-full max-h-48 object-cover rounded-lg border shadow-xs" />
            </div>
          )}

          {saveError && <p className="text-sm text-red-600 font-medium">{saveError}</p>}

          <div className="flex justify-end gap-3 pt-3 border-t">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>{t('common.cancel', 'Cancel')}</Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? t('common.loading', 'Saving...') : t('common.save', 'Save')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export function AdminSectionsPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    key: '',
    title: '',
    titleAr: '',
    content: '',
    contentAr: '',
    imageUrl: '',
    sortOrder: 0,
  });
  const [image, setImage] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { data: sections = [] } = useQuery({
    queryKey: ['sections'],
    queryFn: () => landingApi.sections().then((r) => r.data),
  });

  useEffect(() => {
    if (!image) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(image);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!editId) return;
      if (image) {
        const fd = buildFormData(omitKeys(form, ['key']));
        fd.append('image', image);
        return landingApi.updateSection(editId, fd);
      }
      return landingApi.updateSection(editId, omitKeys(form, ['key']));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sections'] });
      qc.invalidateQueries({ queryKey: ['landing'] });
      setOpen(false);
      setEditId(null);
      setImage(null);
      setCurrentImageUrl(null);
      setSaveError(null);
    },
    onError: (error) => setSaveError(getApiErrorMessage(error, 'فشل حفظ القسم')),
  });

  const openEdit = (section: LandingSection) => {
    setEditId(section.id);
    setForm({
      key: section.key,
      title: section.title,
      titleAr: section.titleAr || '',
      content: section.content,
      contentAr: section.contentAr || '',
      imageUrl: section.imageUrl || '',
      sortOrder: section.sortOrder,
    });
    setImage(null);
    setCurrentImageUrl(section.imageUrl || null);
    setSaveError(null);
    setOpen(true);
  };

  const displayImage =
    previewUrl ||
    (form.imageUrl ? mediaUrl(form.imageUrl) : null) ||
    (currentImageUrl ? mediaUrl(currentImageUrl) : null);

  return (
    <div className="w-full space-y-6">
      <AdminPageGuide guideKey="sections" />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <PageHeader title={t('admin.sectionsCrud.title', 'أقسام واجهة الموقع (Landing Sections)')} />
          <p className="text-sm text-slate-500 mt-1">
            {t(
              'admin.sectionsCrud.subtitle',
              'تعديل محتوى الأقسام المحددة مسبقاً في الصفحة الرئيسية (النصوص، الصور، النشر/الإخفاء). لا يمكن إضافة أقسام جديدة.',
            )}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <DataTable
          data={sections}
          columns={[
            { key: 'key', header: 'المفتاح البرمجي', render: (r) => <code className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-700">{r.key}</code> },
            { key: 'title', header: 'العنوان', render: (r) => <span className="font-semibold">{r.title}</span> },
            {
              key: 'image',
              header: 'الصورة',
              render: (r) =>
                r.imageUrl ? (
                  <img src={mediaUrl(r.imageUrl)} className="h-10 w-16 object-cover rounded border" alt="" />
                ) : (
                  '-'
                ),
            },
            {
              key: 'status',
              header: 'الحالة',
              render: (r) => (
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${r.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {r.status === 'PUBLISHED' ? 'منشور' : 'مسودة'}
                </span>
              ),
            },
            {
              key: 'actions',
              header: 'الإجراءات',
              render: (r) => (
                <div className="flex gap-2">
                  <Button variant="outline" className="py-1 px-3 text-xs" onClick={() => openEdit(r)}>
                    تعديل
                  </Button>
                  <Button
                    variant="secondary"
                    className="py-1 px-3 text-xs"
                    onClick={() =>
                      landingApi
                        .updateSectionStatus(r.id, r.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED')
                        .then(() => {
                          qc.invalidateQueries({ queryKey: ['sections'] });
                          qc.invalidateQueries({ queryKey: ['landing'] });
                        })
                    }
                  >
                    {r.status === 'PUBLISHED' ? 'تحويل لمسودة' : 'نشر'}
                  </Button>
                  <Button
                    variant="primary"
                    className="py-1 px-3 text-xs bg-red-600 hover:bg-red-700 text-white"
                    onClick={() =>
                      landingApi.deleteSection(r.id).then(() => {
                        qc.invalidateQueries({ queryKey: ['sections'] });
                        qc.invalidateQueries({ queryKey: ['landing'] });
                      })
                    }
                  >
                    حذف
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={t('admin.sectionsCrud.editTitle', 'تعديل قسم')} wide>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate();
          }}
        >
          <Input
            label="معرف/مفتاح القسم (Key)"
            value={form.key}
            onChange={(e) => setForm({ ...form, key: e.target.value })}
            required
            disabled={!!editId}
            placeholder="مثال: about_section"
          />

          <div className="grid md:grid-cols-2 gap-4">
            <Input label="العنوان (إنجليزي)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <Input label="العنوان (عربي)" value={form.titleAr} onChange={(e) => setForm({ ...form, titleAr: e.target.value })} dir="rtl" />
          </div>

          <RichTextEditor
            label="المحتوى (عربي)"
            value={form.contentAr}
            onChange={(contentAr) => setForm({ ...form, contentAr })}
            placeholder="اكتب المحتوى بالعربية..."
          />

          <RichTextEditor
            label="المحتوى (إنجليزي)"
            value={form.content}
            onChange={(content) => setForm({ ...form, content })}
            placeholder="Write content in English..."
          />

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="رابط صورة خارجية (اختياري)"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="https://images.unsplash.com/..."
            />
            <Input
              label="ترتيب الظهور"
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
            />
          </div>

          <Input label="رفع صورة القسم" type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />

          {displayImage && (
            <div>
              <p className="text-xs text-slate-500 mb-1">معاينة الصورة:</p>
              <img src={displayImage} alt="Section preview" className="w-full max-h-40 object-cover rounded-lg border shadow-xs" />
            </div>
          )}

          {saveError && <p className="text-sm text-red-600 font-medium">{saveError}</p>}

          <div className="flex justify-end gap-3 pt-3 border-t">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>إلغاء</Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'جاري الحفظ...' : 'حفظ القسم'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
