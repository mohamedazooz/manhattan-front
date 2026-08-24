import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { galleryApi } from '../../../api';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/DataTable';
import { StatusBadge, PageHeader } from '../../../components/ui/Badge';
import { AdminDataTable } from '../../../components/admin/AdminDataTable';
import { AdminOpsCounters } from '../../../components/admin/AdminOpsCounters';
import { mediaUrl } from '../../../lib/utils';
import { Eye, Edit, Trash2, ExternalLink } from 'lucide-react';
import { AdminPageGuide } from '../../../components/admin/AdminPageGuide';

export function AdminGalleryPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({ title: '', caption: '', category: 'OTHER', status: 'PUBLISHED' });
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT' | 'ARCHIVED'>('ALL');

  const [previewImage, setPreviewImage] = useState<any | null>(null);
  const [editImage, setEditImage] = useState<any | null>(null);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editForm, setEditForm] = useState({ title: '', caption: '', category: 'OTHER', status: 'PUBLISHED' });

  const { data: images = [], isLoading } = useQuery({
    queryKey: ['gallery-admin'],
    queryFn: () => galleryApi.admin().then((r) => r.data),
  });

  const counts = useMemo(() => {
    const tally = { total: images.length, published: 0, draft: 0, archived: 0 };
    for (const img of images as Array<{ status: string }>) {
      if (img.status === 'PUBLISHED') tally.published += 1;
      else if (img.status === 'DRAFT') tally.draft += 1;
      else if (img.status === 'ARCHIVED') tally.archived += 1;
    }
    return tally;
  }, [images]);

  const filteredImages = useMemo(() => {
    if (statusFilter === 'ALL') return images;
    return (images as Array<{ status: string }>).filter((img) => img.status === statusFilter);
  }, [images, statusFilter]);

  const upload = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('caption', form.caption);
      fd.append('category', form.category);
      fd.append('status', form.status);
      if (file) fd.append('image', file);
      return galleryApi.create(fd);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gallery-admin'] });
      qc.invalidateQueries({ queryKey: ['public-gallery'] });
      setFile(null);
      setForm({ title: '', caption: '', category: 'OTHER', status: 'PUBLISHED' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editImage) return;
      const fd = new FormData();
      fd.append('title', editForm.title);
      fd.append('caption', editForm.caption);
      fd.append('category', editForm.category);
      fd.append('status', editForm.status);
      if (editFile) fd.append('image', editFile);
      return galleryApi.update(editImage.id, fd);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gallery-admin'] });
      qc.invalidateQueries({ queryKey: ['public-gallery'] });
      setEditImage(null);
      setEditFile(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => galleryApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gallery-admin'] });
      qc.invalidateQueries({ queryKey: ['public-gallery'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  const setImageStatus = (id: string, status: string) =>
    galleryApi.updateStatus(id, status).then(() => {
      qc.invalidateQueries({ queryKey: ['gallery-admin'] });
      qc.invalidateQueries({ queryKey: ['public-gallery'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
    });

  const openEdit = (img: any) => {
    setEditImage(img);
    setEditFile(null);
    setEditForm({
      title: img.title || '',
      caption: img.caption || '',
      category: img.category || 'OTHER',
      status: img.status || 'PUBLISHED',
    });
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`هل أنت تأكد من إزالة وصور النواحي نهائياً (${title})؟`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin.gallery.title', 'Photo Gallery Management')}
        subtitle={t('admin.gallery.subtitle', 'Upload and manage photos of campus, events, and student activities.')}
      />
      <AdminPageGuide guideKey="gallery" />

      <AdminOpsCounters
        items={[
          { id: 'published', label: t('common.published', 'Published'), value: counts.published, onClick: () => setStatusFilter('PUBLISHED') },
          { id: 'draft', label: t('common.draft', 'Draft'), value: counts.draft, onClick: () => setStatusFilter('DRAFT') },
          { id: 'archived', label: t('admin.statusArchived', 'Archived'), value: counts.archived, onClick: () => setStatusFilter('ARCHIVED') },
          { id: 'total', label: t('admin.allStatuses', 'All'), value: counts.total, onClick: () => setStatusFilter('ALL') },
        ]}
      />

      <form
        className="grid md:grid-cols-6 gap-3 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs"
        onSubmit={(e) => {
          e.preventDefault();
          upload.mutate();
        }}
      >
        <Input label={t('admin.gallery.photoTitle', 'عنوان الصورة')} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <Input label={t('admin.gallery.caption', 'الوصف / التفاصيل')} value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} />
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {t('admin.gallery.categoryLabel', 'التصنيف / الفئة')}
          </label>
          <select
            className="w-full border rounded-xl p-2.5 text-sm bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 font-medium focus:ring-2 focus:ring-primary dark:text-slate-100"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="ACADEMICS">{t('gallery.cat.academics', 'الأكاديميات والأنشطة')}</option>
            <option value="EVENTS">{t('gallery.cat.events', 'الفعاليات والمناسبات')}</option>
            <option value="CAMPUS">{t('gallery.cat.campus', 'الحرم والمرافق')}</option>
            <option value="SPORTS">{t('gallery.cat.sports', 'الأنشطة الرياضية')}</option>
            <option value="OTHER">{t('gallery.cat.other', 'عام / أخرى')}</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            حالة الصورة
          </label>
          <select
            className="w-full border rounded-xl p-2.5 text-sm bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 font-medium focus:ring-2 focus:ring-primary dark:text-slate-100"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="PUBLISHED">منشور (Published)</option>
            <option value="DRAFT">مسودة (Draft)</option>
          </select>
        </div>

        <Input label={t('admin.gallery.uploadFromPc', 'ملف الصورة')} type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} required />

        <div className="flex items-end">
          <Button type="submit" disabled={upload.isPending} className="w-full justify-center">
            {upload.isPending ? t('admin.gallery.uploading', 'جاري الرفع...') : t('admin.gallery.uploadBtn', 'رفع الصورة')}
          </Button>
        </div>
      </form>

      <AdminDataTable
        isLoading={isLoading}
        data={filteredImages}
        emptyTitle={t('admin.gallery.empty', 'لا توجد صور في المعرض')}
        emptyDescription={t('admin.gallery.emptyHint', 'قم برفع صور لعرض أنشطة ومرافق المدرسة.')}
        columns={[
          {
            key: 'preview',
            header: t('admin.gallery.cover', 'المعاينة'),
            align: 'center',
            render: (img: any) => (
              <img
                src={mediaUrl(img.imageUrl)}
                alt={img.title}
                className="h-14 w-20 object-cover rounded-lg border mx-auto cursor-pointer hover:opacity-85 transition-opacity"
                onClick={() => setPreviewImage(img)}
                loading="lazy"
              />
            ),
          },
          { key: 'title', header: t('admin.title', 'العنوان'), align: 'start', render: (img: { title: string }) => <span className="font-semibold">{img.title}</span> },
          {
            key: 'category',
            header: t('admin.gallery.category', 'التصنيف'),
            align: 'start',
            render: (img: { category: string }) => {
              const catMap: Record<string, string> = {
                ACADEMICS: t('gallery.cat.academics', 'الأكاديميات والأنشطة'),
                EVENTS: t('gallery.cat.events', 'الفعاليات والمناسبات'),
                CAMPUS: t('gallery.cat.campus', 'الحرم والمرافق'),
                SPORTS: t('gallery.cat.sports', 'الأنشطة الرياضية'),
                OTHER: t('gallery.cat.other', 'عام / أخرى'),
              };
              return catMap[img.category] || img.category;
            },
          },
          {
            key: 'status',
            header: t('common.status', 'الحالة'),
            align: 'center',
            render: (img: { status: string }) => <StatusBadge status={img.status} />,
          },
          {
            key: 'actions',
            header: t('common.actions', 'الإجراءات'),
            align: 'start',
            render: (img: any) => (
              <div className="flex flex-wrap items-center gap-1.5">
                <Button variant="outline" className="py-1 px-2 text-xs flex items-center gap-1" onClick={() => setPreviewImage(img)} title="معاينة">
                  <Eye className="w-3.5 h-3.5" />
                  <span>معاينة</span>
                </Button>
                <Button variant="outline" className="py-1 px-2 text-xs flex items-center gap-1" onClick={() => openEdit(img)} title="تعديل">
                  <Edit className="w-3.5 h-3.5" />
                  <span>تعديل</span>
                </Button>

                {img.status !== 'PUBLISHED' && (
                  <Button variant="secondary" className="py-1 px-2 text-xs" onClick={() => setImageStatus(img.id, 'PUBLISHED')}>
                    {t('common.published', 'نشر')}
                  </Button>
                )}
                {img.status !== 'DRAFT' && (
                  <Button variant="outline" className="py-1 px-2 text-xs" onClick={() => setImageStatus(img.id, 'DRAFT')}>
                    {t('common.draft', 'مسودة')}
                  </Button>
                )}
                {img.status !== 'ARCHIVED' && (
                  <Button variant="outline" className="py-1 px-2 text-xs text-slate-500" onClick={() => setImageStatus(img.id, 'ARCHIVED')}>
                    أرشفة
                  </Button>
                )}

                <Button variant="danger" className="py-1 px-2 text-xs flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white" onClick={() => handleDelete(img.id, img.title)} title="حذف">
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف</span>
                </Button>
              </div>
            ),
          },
        ]}
      />

      {/* Modal: Image Preview Lightbox */}
      <Modal open={!!previewImage} onClose={() => setPreviewImage(null)} title={previewImage?.title || 'معاينة الصورة'} wide>
        {previewImage && (
          <div className="space-y-4">
            <div className="bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center p-2 border border-slate-800">
              <img src={mediaUrl(previewImage.imageUrl)} alt={previewImage.title} className="max-h-[70vh] w-auto object-contain rounded-lg" />
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-sm">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100">{previewImage.title}</h4>
                {previewImage.caption && <p className="text-slate-600 dark:text-slate-400 mt-1">{previewImage.caption}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status={previewImage.status} />
                <a
                  href={mediaUrl(previewImage.imageUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition-colors inline-flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>فتح الرابط الأصل</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Edit Image Details */}
      <Modal open={!!editImage} onClose={() => setEditImage(null)} title="تعديل بيانات الصورة في المعرض" wide>
        {editImage && (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              updateMutation.mutate();
            }}
          >
            <div className="grid md:grid-cols-2 gap-4">
              <Input label="عنوان الصورة" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} required />
              <Input label="الوصف / التفاصيل" value={editForm.caption} onChange={(e) => setEditForm({ ...editForm, caption: e.target.value })} />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  التصنيف / الفئة
                </label>
                <select
                  className="w-full border rounded-xl p-2.5 text-sm bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 font-medium focus:ring-2 focus:ring-primary dark:text-slate-100"
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                >
                  <option value="ACADEMICS">{t('gallery.cat.academics', 'الأكاديميات والأنشطة')}</option>
                  <option value="EVENTS">{t('gallery.cat.events', 'الفعاليات والمناسبات')}</option>
                  <option value="CAMPUS">{t('gallery.cat.campus', 'الحرم والمرافق')}</option>
                  <option value="SPORTS">{t('gallery.cat.sports', 'الأنشطة الرياضية')}</option>
                  <option value="OTHER">{t('gallery.cat.other', 'عام / أخرى')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  الحالة
                </label>
                <select
                  className="w-full border rounded-xl p-2.5 text-sm bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 font-medium focus:ring-2 focus:ring-primary dark:text-slate-100"
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                >
                  <option value="PUBLISHED">منشور (Published)</option>
                  <option value="DRAFT">مسودة (Draft)</option>
                  <option value="ARCHIVED">مؤرشف (Archived)</option>
                </select>
              </div>
            </div>

            <Input label="استبدال ملَف الصورة (اختياري)" type="file" accept="image/*" onChange={(e) => setEditFile(e.target.files?.[0] || null)} />

            <div className="flex justify-end gap-3 pt-3 border-t">
              <Button variant="outline" type="button" onClick={() => setEditImage(null)}>إلغاء</Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'جاري الحفظ...' : 'حفظ التعديلات'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
