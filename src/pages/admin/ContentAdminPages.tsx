import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { aboutApi, pagesApi, cmsApi, storageApi } from '../../api';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { DataTable, Modal } from '../../components/ui/DataTable';
import { PageHeader } from '../../components/ui/Badge';
import { RichTextEditor } from '../../components/ui/RichTextEditor';
import { slugify } from '../../lib/slug';
import { getApiErrorMessage, omitKeys, buildFormData } from '../../lib/formData';
import { mediaUrl } from '../../lib/utils';
import { Save, CheckCircle, Building, Phone, Share2, Target, Upload } from 'lucide-react';

function AboutCrud() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ slug: '', title: '', content: '', sortOrder: 0, imageUrl: '' });
  const [image, setImage] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!image) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(image);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const { data: items = [] } = useQuery({
    queryKey: ['about-admin'],
    queryFn: () => aboutApi.admin().then((r) => r.data),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = editId ? omitKeys(form, ['slug']) : form;
      if (image) {
        const fd = buildFormData(payload as Record<string, unknown>);
        fd.append('image', image);
        return editId ? aboutApi.update(editId, fd) : aboutApi.create(fd);
      }
      return editId ? aboutApi.update(editId, payload) : aboutApi.create(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['about-admin'] });
      setOpen(false);
      setImage(null);
      setCurrentImageUrl(null);
      setSaveError(null);
    },
    onError: (error) => setSaveError(getApiErrorMessage(error, t('common.errorSave', 'Failed to save section'))),
  });

  const resetForm = () => {
    setForm({ slug: '', title: '', content: '', sortOrder: 0, imageUrl: '' });
    setImage(null);
    setCurrentImageUrl(null);
    setSaveError(null);
  };

  const openCreateModal = () => {
    setEditId(null);
    resetForm();
    setOpen(true);
  };

  const openEditModal = (r: Record<string, unknown>) => {
    setEditId(String(r.id));
    setForm({
      slug: String(r.slug || ''),
      title: String(r.title),
      content: String(r.content),
      sortOrder: Number(r.sortOrder || 0),
      imageUrl: String(r.imageUrl || ''),
    });
    setCurrentImageUrl(r.imageUrl ? String(r.imageUrl) : null);
    setImage(null);
    setSaveError(null);
    setOpen(true);
  };

  const handleTitleChange = (val: string) => {
    if (!editId) {
      setForm((prev) => ({ ...prev, title: val, slug: slugify(val) }));
    } else {
      setForm((prev) => ({ ...prev, title: val }));
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <PageHeader title={t('admin.aboutCrud.title', 'About Us Sections')} />
          <p className="text-sm text-slate-500 mt-1">
            {t('admin.aboutCrud.subtitle', 'Manage core About Us blocks, vision, mission, and school values.')}
          </p>
        </div>
        <Button onClick={openCreateModal} className="shadow-sm">
          {t('admin.aboutCrud.addNew', '+ Add About Section')}
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <DataTable
          data={items}
          columns={[
            { key: 'title', header: t('common.title', 'Title'), render: (r) => <span className="font-semibold">{String(r.title)}</span> },
            {
              key: 'image',
              header: t('admin.education.coverImage', 'Image'),
              render: (r) =>
                r.imageUrl ? (
                  <img
                    src={mediaUrl(String(r.imageUrl))}
                    alt=""
                    className="h-10 w-16 object-cover rounded border"
                  />
                ) : (
                  <span className="text-xs text-slate-400">—</span>
                ),
            },
            {
              key: 'status',
              header: t('common.status', 'Status'),
              render: (r) => (
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${r.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {r.status === 'PUBLISHED' ? t('common.published', 'Published') : t('common.draft', 'Draft')}
                </span>
              ),
            },
            {
              key: 'actions',
              header: t('common.actions', 'Actions'),
              render: (r) => (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="py-1 px-3 text-xs"
                    onClick={() => openEditModal(r)}
                  >
                    {t('common.edit', 'Edit')}
                  </Button>
                  <Button
                    variant="secondary"
                    className="py-1 px-3 text-xs"
                    onClick={() =>
                      aboutApi
                        .updateStatus(r.id, r.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED')
                        .then(() => {
                          qc.invalidateQueries({ queryKey: ['about-admin'] });
                          qc.invalidateQueries({ queryKey: ['about'] });
                        })
                    }
                  >
                    {r.status === 'PUBLISHED' ? t('common.draft', 'Draft') : t('common.published', 'Publish')}
                  </Button>
                  <Button
                    variant="primary"
                    className="py-1 px-3 text-xs bg-red-600 hover:bg-red-700 text-white"
                    onClick={() =>
                      aboutApi.remove(r.id).then(() => {
                        qc.invalidateQueries({ queryKey: ['about-admin'] });
                        qc.invalidateQueries({ queryKey: ['about'] });
                      })
                    }
                  >
                    {t('common.delete', 'Delete')}
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editId ? 'تعديل قسم' : 'إضافة قسم جديد'} wide>
        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }}>
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="عنوان القسم"
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
              placeholder="مثال: قيم المدرسة والتميز"
            />
            <div>
              <Input
                label="رابط الصفحة (Slug)"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                required
                disabled={!!editId}
                placeholder="يتم إنشاؤه تلقائياً..."
              />
              <p className="text-xs text-slate-500 mt-1">يتم إنشاؤه تلقائياً من العنوان لاستخدامه في عنوان الويب.</p>
            </div>
          </div>

          <RichTextEditor
            label="محتوى القسم (تنسيق مريح بدون كود)"
            value={form.content}
            onChange={(content) => setForm({ ...form, content })}
            placeholder="اكتب تفاصيل ومحتوى القسم هنا..."
          />

          {(previewUrl || currentImageUrl) && (
            <div className="rounded-lg border p-3 bg-slate-50">
              <p className="text-xs font-semibold text-slate-600 mb-2">معاينة الصورة</p>
              <img
                src={previewUrl || mediaUrl(currentImageUrl!)}
                alt="معاينة"
                className="max-h-48 rounded-lg object-cover border"
              />
            </div>
          )}

          <Input
            label="رفع صورة القسم"
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
          />
          <p className="text-xs text-slate-500 -mt-3">
            الصيغ المدعومة: JPG, PNG, WebP — الحد الأقصى 5 ميجابايت
          </p>

          <Input
            label="ترتيب الظهور"
            type="number"
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
          />

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

function PagesCrud() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ slug: '', title: '', content: '', sortOrder: 0 });
  const [saveError, setSaveError] = useState<string | null>(null);

  const { data: items = [] } = useQuery({
    queryKey: ['pages-admin'],
    queryFn: () => pagesApi.admin().then((r) => r.data),
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      editId ? pagesApi.update(editId, omitKeys(form, ['slug'])) : pagesApi.create(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pages-admin'] });
      setOpen(false);
      setSaveError(null);
    },
    onError: (error) => setSaveError(getApiErrorMessage(error, t('common.errorSave', 'Failed to save page'))),
  });

  const handleTitleChange = (val: string) => {
    if (!editId) {
      setForm((prev) => ({ ...prev, title: val, slug: slugify(val) }));
    } else {
      setForm((prev) => ({ ...prev, title: val }));
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <PageHeader title={t('admin.pagesCrud.title', 'Custom Static Pages')} />
          <p className="text-sm text-slate-500 mt-1">
            {t('admin.pagesCrud.subtitle', 'Create and publish custom pages with rich content and custom URLs.')}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditId(null);
            setForm({ slug: '', title: '', content: '', sortOrder: 0 });
            setOpen(true);
          }}
          className="shadow-sm"
        >
          {t('admin.pagesCrud.addNew', '+ Create New Page')}
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <DataTable
          data={items}
          columns={[
            { key: 'title', header: t('common.title', 'Title'), render: (r) => <span className="font-semibold">{String(r.title)}</span> },
            { key: 'slug', header: t('admin.education.slug', 'Slug'), render: (r) => <code className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-700">{String(r.slug)}</code> },
            {
              key: 'status',
              header: t('common.status', 'Status'),
              render: (r) => (
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${r.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {r.status === 'PUBLISHED' ? t('common.published', 'Published') : t('common.draft', 'Draft')}
                </span>
              ),
            },
            {
              key: 'actions',
              header: t('common.actions', 'Actions'),
              render: (r) => (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="py-1 px-3 text-xs"
                    onClick={() => {
                      setEditId(r.id);
                      setForm({
                        slug: String(r.slug),
                        title: String(r.title),
                        content: String(r.content),
                        sortOrder: Number(r.sortOrder || 0),
                      });
                      setSaveError(null);
                      setOpen(true);
                    }}
                  >
                    {t('common.edit', 'Edit')}
                  </Button>
                  <Button
                    variant="secondary"
                    className="py-1 px-3 text-xs"
                    onClick={() =>
                      pagesApi
                        .updateStatus(r.id, r.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED')
                        .then(() => {
                          qc.invalidateQueries({ queryKey: ['pages-admin'] });
                          qc.invalidateQueries({ queryKey: ['pages'] });
                          qc.invalidateQueries({ queryKey: ['page'] });
                        })
                    }
                  >
                    {r.status === 'PUBLISHED' ? t('common.draft', 'Draft') : t('common.published', 'Publish')}
                  </Button>
                  <Button
                    variant="primary"
                    className="py-1 px-3 text-xs bg-red-600 hover:bg-red-700 text-white"
                    onClick={() =>
                      pagesApi.remove(r.id).then(() => {
                        qc.invalidateQueries({ queryKey: ['pages-admin'] });
                        qc.invalidateQueries({ queryKey: ['pages'] });
                        qc.invalidateQueries({ queryKey: ['page'] });
                      })
                    }
                  >
                    {t('common.delete', 'Delete')}
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editId ? t('common.edit', 'Edit Page') : t('admin.pagesCrud.addNew', '+ Create New Page')} wide>
        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }}>
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="عنوان الصفحة"
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
              placeholder="مثال: السياسات والشروط"
            />
            <div>
              <Input
                label="رابط الصفحة (Slug)"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                required
                disabled={!!editId}
                placeholder="يتم إنشاؤه تلقائياً..."
              />
              <p className="text-xs text-slate-500 mt-1">رابط الوصول التلقائي للصفحة في المتصفح.</p>
            </div>
          </div>

          <RichTextEditor
            label="محتوى الصفحة (محرر مرئي سهل)"
            value={form.content}
            onChange={(content) => setForm({ ...form, content })}
            placeholder="اكتب محتوى وتفاصيل الصفحة هنا..."
          />

          <Input
            label="ترتيب الظهور"
            type="number"
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
          />

          {saveError && <p className="text-sm text-red-600 font-medium">{saveError}</p>}

          <div className="flex justify-end gap-3 pt-3 border-t">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>إلغاء</Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'جاري الحفظ...' : 'حفظ الصفحة'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export function AdminAboutPage() {
  return <AboutCrud />;
}

export function AdminPagesPage() {
  return <PagesCrud />;
}

// User-friendly settings field metadata dictionary with Arabic & English titles and descriptions
const SETTINGS_CONFIG: Record<
  string,
  { labelAr: string; labelEn: string; desc: string; category: 'vision' | 'branding' | 'contact' | 'social'; type: 'textarea' | 'text' | 'file_url' }
> = {
  school_vision: {
    labelAr: 'رؤية المدرسة (Vision)',
    labelEn: 'School Vision',
    desc: 'الرؤية المستقبلية للمدرسة التي تظهر في الصفحة الرئيسية وصفحة من نحن.',
    category: 'vision',
    type: 'textarea',
  },
  school_mission: {
    labelAr: 'رسالة المدرسة (Mission)',
    labelEn: 'School Mission',
    desc: 'رسالة المدرسة وأهدافها التعليمية والأكاديمية.',
    category: 'vision',
    type: 'textarea',
  },
  school_announcements: {
    labelAr: 'الإعلانات وشريط التنبيهات',
    labelEn: 'Announcements Banner',
    desc: 'نص التنبيهات والإعلانات الهامة التي تظهر أعلى الموقع للزوار.',
    category: 'vision',
    type: 'textarea',
  },
  school_slogan: {
    labelAr: 'الشعار النصي بالإنجليزية',
    labelEn: 'School Slogan (EN)',
    desc: 'العبارة الترحيبية أو الجملة الترويجية باللغة الإنجليزية.',
    category: 'branding',
    type: 'text',
  },
  school_slogan_ar: {
    labelAr: 'الشعار النصي بالعربية',
    labelEn: 'School Slogan (AR)',
    desc: 'العبارة الترحيبية المبدئية التي توضح رؤية المدرسة بالعربية.',
    category: 'branding',
    type: 'text',
  },
  school_logo_url: {
    labelAr: 'رابط الشعار الرسمي (Logo)',
    labelEn: 'School Logo URL',
    desc: 'صورة الشعار الرسمي المستخدمة في أعلى وأسفل الموقع (يمكنك الرفع المباشر أواللصق).',
    category: 'branding',
    type: 'file_url',
  },
  school_flyer_url: {
    labelAr: 'رابط الكتيب التعريفي (Flyer/Brochure)',
    labelEn: 'School Flyer / PDF',
    desc: 'الملف التعريفي أو الفلاير الخاص بالمدرسة للتحميل (يمكنك رفع PDF أو صورة).',
    category: 'branding',
    type: 'file_url',
  },
  contact_address: {
    labelAr: 'عنوان المدرسة (بالإنجليزية / الرئيسي)',
    labelEn: 'School Address (EN)',
    desc: 'العنوان الجغرافي بالإنجليزية الذي يظهر للزوار وفي صفحة التواصل والفوتر.',
    category: 'contact',
    type: 'text',
  },
  contact_address_ar: {
    labelAr: 'عنوان المدرسة (بالعربية)',
    labelEn: 'School Address (AR)',
    desc: 'عنوان المدرسة باللغة العربية للزوار.',
    category: 'contact',
    type: 'text',
  },
  contact_phone: {
    labelAr: 'رقم الهاتف الرئيسي',
    labelEn: 'Primary Phone',
    desc: 'رقم الهاتف الأساسي للاتصال المباشر بالمدرسة.',
    category: 'contact',
    type: 'text',
  },
  contact_phone_secondary: {
    labelAr: 'رقم الهاتف الثاني',
    labelEn: 'Secondary Phone',
    desc: 'رقم هاتف إضافي للمدرسة للخطوط الإضافية.',
    category: 'contact',
    type: 'text',
  },
  contact_phone_tertiary: {
    labelAr: 'رقم هاتف القبول والاستفسارات',
    labelEn: 'Admissions Phone',
    desc: 'رقم مخصص لمكتب القبول والتقديمات.',
    category: 'contact',
    type: 'text',
  },
  contact_whatsapp: {
    labelAr: 'رقم الواتساب الرسمي (WhatsApp Phone)',
    labelEn: 'WhatsApp Phone Number',
    desc: 'رقم الواتساب الخاص بالاستفسارات السريعة (مثال: +201120714411).',
    category: 'contact',
    type: 'text',
  },
  contact_email: {
    labelAr: 'البريد الإلكتروني الرئيسي',
    labelEn: 'Contact Email',
    desc: 'البريد الإلكتروني الرسمي للمدرسة واستقبال الاستفسارات العامة.',
    category: 'contact',
    type: 'text',
  },
  contact_email_secondary: {
    labelAr: 'بريد القبول والتقديمات',
    labelEn: 'Admissions Email',
    desc: 'البريد المخصص لاستلام طلبات التقديم والقبول.',
    category: 'contact',
    type: 'text',
  },
  working_hours: {
    labelAr: 'مواعيد العمل (بالإنجليزية)',
    labelEn: 'Working Hours (EN)',
    desc: 'مواعيد الدوام والعمل الرسمية للمدرسة بالإنجليزية.',
    category: 'contact',
    type: 'text',
  },
  working_hours_ar: {
    labelAr: 'مواعيد العمل (بالعربية)',
    labelEn: 'Working Hours (AR)',
    desc: 'مواعيد وأيام العمل الرسمية باللغة العربية (مثال: الأحد - الخميس: 8:00 ص - 3:00 م).',
    category: 'contact',
    type: 'text',
  },
  google_maps_url: {
    labelAr: 'رابط موقع خرائط جوجل (Google Maps URL)',
    labelEn: 'Google Maps Location Link',
    desc: 'رابط الموقع الجغرافي للمدرسة على Google Maps لتوجيه الزوار بسهولة.',
    category: 'contact',
    type: 'text',
  },
  social_facebook: {
    labelAr: 'فيسبوك (Facebook)',
    labelEn: 'Facebook Page URL',
    desc: 'رابط صفحة المدرسة الرسمية على فيسبوك.',
    category: 'social',
    type: 'text',
  },
  social_instagram: {
    labelAr: 'انستغرام (Instagram)',
    labelEn: 'Instagram Profile URL',
    desc: 'رابط حساب المدرسة على انستغرام.',
    category: 'social',
    type: 'text',
  },
  social_whatsapp: {
    labelAr: 'محادثة الواتساب المباشرة (WhatsApp Direct Link)',
    labelEn: 'WhatsApp Direct Chat Link',
    desc: 'رابط محادثة الواتساب المباشرة (مثال: https://wa.me/201120714411).',
    category: 'social',
    type: 'text',
  },
  social_youtube: {
    labelAr: 'يوتيوب (YouTube)',
    labelEn: 'YouTube Channel URL',
    desc: 'رابط قناة المدرسة الرسمية على يوتيوب.',
    category: 'social',
    type: 'text',
  },
  social_linkedin: {
    labelAr: 'لينكد إن (LinkedIn)',
    labelEn: 'LinkedIn Company URL',
    desc: 'رابط حساب المدرسة على منصة لينكد إن.',
    category: 'social',
    type: 'text',
  },
  social_tiktok: {
    labelAr: 'تيك توك (TikTok)',
    labelEn: 'TikTok Profile URL',
    desc: 'رابط حساب المدرسة على تيك توك.',
    category: 'social',
    type: 'text',
  },
  social_twitter: {
    labelAr: 'إكس / تويتر (X - Twitter)',
    labelEn: 'X / Twitter Profile URL',
    desc: 'رابط حساب المدرسة على منصة إكس (تويتر سابقاً).',
    category: 'social',
    type: 'text',
  },
};

export function AdminSettingsPage() {
  const qc = useQueryClient();
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const { data: config = {} } = useQuery({
    queryKey: ['cms-config'],
    queryFn: () => cmsApi.getConfig().then((r) => r.data),
  });
  const [values, setValues] = useState<Record<string, string>>({});
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [bulkSavedSuccess, setBulkSavedSuccess] = useState(false);

  const activeValues = { ...config, ...values };

  const saveKey = async (key: string) => {
    await cmsApi.updateConfig(key, activeValues[key] ?? '');
    qc.invalidateQueries({ queryKey: ['cms-config'] });
    setSavedKey(key);
    setTimeout(() => setSavedKey(null), 3000);
  };

  const handleFileUpload = async (key: string, file: File) => {
    setUploadingKey(key);
    try {
      const res = await storageApi.upload(file, 'branding');
      const url = res.data.fileUrl || res.data.url;
      setValues((prev) => ({ ...prev, [key]: url }));
    } catch (err) {
      console.error(`Failed to upload file for ${key}`, err);
    } finally {
      setUploadingKey(null);
    }
  };

  const saveAll = async () => {
    setIsSavingAll(true);
    try {
      if (cmsApi.updateBulkConfig) {
        await cmsApi.updateBulkConfig(activeValues);
      } else {
        await Promise.all(
          Object.keys(activeValues).map((k) => cmsApi.updateConfig(k, activeValues[k] ?? ''))
        );
      }
      qc.invalidateQueries({ queryKey: ['cms-config'] });
      setBulkSavedSuccess(true);
      setTimeout(() => setBulkSavedSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to save all settings', err);
    } finally {
      setIsSavingAll(false);
    }
  };

  const renderSection = (
    title: string,
    icon: React.ReactNode,
    categoryKey: 'vision' | 'branding' | 'contact' | 'social'
  ) => {
    const keys = Object.keys(SETTINGS_CONFIG).filter(
      (k) => SETTINGS_CONFIG[k].category === categoryKey
    );

    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-6">
        <div className="flex items-center gap-3 border-b pb-4">
          <div className="p-2.5 bg-primary/10 text-primary rounded-lg">{icon}</div>
          <div>
            <h3 className="text-base font-bold text-slate-800">{title}</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {keys.map((key) => {
            const meta = SETTINGS_CONFIG[key];
            const isSaved = savedKey === key;
            const isFullWidth = meta.type === 'textarea';
            const currentValue = activeValues[key] ?? '';

            return (
              <div
                key={key}
                className={`flex flex-col gap-3 p-5 rounded-xl bg-slate-50/70 border border-slate-200/80 shadow-2xs ${
                  isFullWidth ? 'md:col-span-2' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <label className="font-bold text-base text-slate-800">{meta.labelAr}</label>
                    <p className="text-xs text-slate-500 mt-0.5">{meta.desc}</p>
                  </div>
                  {isSaved && (
                    <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                      <CheckCircle className="h-3.5 w-3.5" /> تم الحفظ
                    </span>
                  )}
                </div>

                {meta.type === 'textarea' ? (
                  <div className="space-y-3 w-full mt-1">
                    <Textarea
                      value={currentValue}
                      onChange={(e) => setValues({ ...values, [key]: e.target.value })}
                      className="w-full bg-white text-base leading-relaxed p-4 min-h-[140px] shadow-2xs border-slate-300 focus:ring-2 focus:ring-primary"
                      placeholder={`أدخل ${meta.labelAr}...`}
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={() => saveKey(key)}
                        className="py-2.5 px-6 flex items-center gap-2 font-medium shadow-xs"
                      >
                        <Save className="h-4 w-4" />
                        <span>حفظ {meta.labelAr}</span>
                      </Button>
                    </div>
                  </div>
                ) : meta.type === 'file_url' ? (
                  <div className="space-y-3 w-full mt-1">
                    <div className="flex gap-2 items-end">
                      <Input
                        value={currentValue}
                        onChange={(e) => setValues({ ...values, [key]: e.target.value })}
                        containerClassName="flex-1"
                        className="bg-white text-sm py-2.5"
                        placeholder="رابط الملف أو الصورة..."
                      />
                      <Button
                        onClick={() => saveKey(key)}
                        className="py-2.5 px-4 shrink-0 flex items-center gap-1.5 font-medium shadow-xs"
                      >
                        <Save className="h-4 w-4" />
                        <span>حفظ</span>
                      </Button>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <input
                        ref={(el) => { fileInputRefs.current[key] = el; }}
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleFileUpload(key, f);
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="text-xs py-1.5 px-3 flex items-center gap-1.5 bg-white shadow-2xs"
                        disabled={uploadingKey === key}
                        onClick={() => fileInputRefs.current[key]?.click()}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingKey === key ? 'جاري الرفع...' : 'رفع ملف/صورة من الكمبيوتر'}</span>
                      </Button>
                    </div>

                    {currentValue && (
                      <div className="rounded-lg border p-2 bg-white flex items-center gap-3">
                        {currentValue.match(/\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i) || currentValue.includes('/uploads/') ? (
                          <img
                            src={mediaUrl(currentValue)}
                            alt="Preview"
                            className="h-12 w-20 object-contain rounded border bg-slate-50"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : (
                          <div className="h-10 px-3 bg-primary/10 text-primary text-xs font-mono font-bold rounded flex items-center">
                            📄 PDF / Document
                          </div>
                        )}
                        <span className="text-xs text-slate-500 truncate flex-1">{currentValue}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex gap-3 items-end mt-1 w-full">
                    <Input
                      value={currentValue}
                      onChange={(e) => setValues({ ...values, [key]: e.target.value })}
                      containerClassName="flex-1"
                      className="bg-white text-sm py-2.5"
                    />
                    <Button
                      onClick={() => saveKey(key)}
                      className="py-2.5 px-5 shrink-0 flex items-center gap-1.5 font-medium shadow-xs"
                    >
                      <Save className="h-4 w-4" />
                      <span>حفظ</span>
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <PageHeader title="إعدادات الموقع ومعلومات التواصل (Site & Contact Settings)" />
          <p className="text-sm text-slate-500 mt-1">
            التحكم الكامل في أرقام المدرسة، الإيميلات، مواعيد العمل، وسائل التواصل، وروابط الصفحات لكي تتحدث تلقائياً في كل مكان بالموقع.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {bulkSavedSuccess && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-100 border border-emerald-300 px-3 py-2 rounded-xl font-bold">
              <CheckCircle className="h-4 w-4 text-emerald-600" /> تم حفظ جميع البيانات بنجاح!
            </span>
          )}
          <Button
            onClick={saveAll}
            disabled={isSavingAll}
            className="py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md flex items-center gap-2"
          >
            <Save className="h-5 w-5" />
            <span>{isSavingAll ? 'جاري الحفظ...' : 'حفظ كل البيانات والتغييرات'}</span>
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {renderSection(
          'معلومات التواصل وأرقام المدرسة (Contact & Phone Numbers)',
          <Phone className="h-5 w-5" />,
          'contact'
        )}
        {renderSection(
          'حسابات التواصل الاجتماعي والواتساب (Social Media Links)',
          <Share2 className="h-5 w-5" />,
          'social'
        )}
        {renderSection(
          'الرؤية والرسالة والإعلانات (Vision & Mission)',
          <Target className="h-5 w-5" />,
          'vision'
        )}
        {renderSection(
          'المعلومات العامة والهوية (General & Branding)',
          <Building className="h-5 w-5" />,
          'branding'
        )}
      </div>
    </div>
  );
}
