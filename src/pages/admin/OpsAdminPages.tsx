import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { educationApi, galleryApi, blogApi, careersApi, contactApi, admissionsApi, requirementsApi, usersApi, rolesApi, emailApi, storageApi } from '../../api';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { DataTable, Modal } from '../../components/ui/DataTable';
import { StatusBadge, PageHeader } from '../../components/ui/Badge';
import { mediaUrl, formatDate } from '../../lib/utils';
import { getApiErrorMessage, omitKeys } from '../../lib/formData';
import { AdmissionStatusSelect } from '../../components/admin/AdmissionStatusSelect';
import { useAppLanguage } from '../../i18n';
import { Upload, Eye, Mail, Send, Phone, User, Clock, Search, MessageSquare, ExternalLink, CheckCircle } from 'lucide-react';


export function AdminEducationPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    summary: '',
    content: '',
    level: 'ELEMENTARY',
    sortOrder: 0,
    coverImageUrl: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { data: programs = [] } = useQuery({
    queryKey: ['education-admin'],
    queryFn: () => educationApi.admin().then((r) => r.data),
  });

  const save = useMutation({
    mutationFn: async () => {
      let finalCoverUrl = form.coverImageUrl;
      if (selectedFile) {
        setIsUploading(true);
        try {
          const uploadRes = await storageApi.upload(selectedFile, 'education');
          finalCoverUrl = uploadRes.data.fileUrl || uploadRes.data.url;
        } finally {
          setIsUploading(false);
        }
      }

      const payload = {
        ...form,
        coverImageUrl: finalCoverUrl || undefined,
      };

      return editId
        ? educationApi.update(editId, omitKeys(payload, ['slug']))
        : educationApi.create(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['education-admin'] });
      setOpen(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      setSaveError(null);
    },
    onError: (error) => setSaveError(getApiErrorMessage(error, t('common.errorSave', 'Failed to save program'))),
  });

  const openCreate = () => {
    setEditId(null);
    setForm({ title: '', slug: '', summary: '', content: '', level: 'ELEMENTARY', sortOrder: 0, coverImageUrl: '' });
    setSelectedFile(null);
    setPreviewUrl(null);
    setSaveError(null);
    setOpen(true);
  };

  const openEdit = (r: any) => {
    setEditId(r.id);
    setForm({
      title: r.title || '',
      slug: r.slug || '',
      summary: r.summary || '',
      content: r.content || '',
      level: r.level || 'ELEMENTARY',
      sortOrder: r.sortOrder || 0,
      coverImageUrl: r.coverImageUrl || '',
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setSaveError(null);
    setOpen(true);
  };

  const currentCoverDisplay = previewUrl || (form.coverImageUrl ? mediaUrl(form.coverImageUrl) : null);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <PageHeader title={t('admin.education.title', 'Education Programs')} />
          <p className="text-sm text-slate-500 mt-1">{t('admin.education.subtitle', 'Manage academic curricula, stages, and department images.')}</p>
        </div>
        <Button onClick={openCreate}>{t('admin.education.addNew', '+ Add New Program')}</Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <DataTable
          data={programs}
          columns={[
            {
              key: 'cover',
              header: t('admin.education.coverImage', 'Cover Image'),
              render: (r: any) =>
                r.coverImageUrl ? (
                  <img src={mediaUrl(r.coverImageUrl)} alt="" className="h-10 w-16 object-cover rounded border" />
                ) : (
                  <span className="text-xs text-slate-400">—</span>
                ),
            },
            { key: 'title', header: t('admin.education.programTitle', 'Program Title'), render: (r: any) => <span className="font-semibold">{r.title}</span> },
            { key: 'level', header: t('admin.education.level', 'Grade Level'), render: (r: any) => <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 rounded">{r.level}</span> },
            { key: 'status', header: t('common.status', 'Status'), render: (r: any) => <StatusBadge status={r.status} /> },
            {
              key: 'actions',
              header: t('common.actions', 'Actions'),
              render: (r: any) => (
                <div className="flex gap-2">
                  <Button variant="outline" className="py-1 px-2.5 text-xs" onClick={() => openEdit(r)}>
                    {t('common.edit', 'Edit')}
                  </Button>
                  <Button
                    variant="secondary"
                    className="py-1 px-2.5 text-xs"
                    onClick={() =>
                      educationApi
                        .updateStatus(r.id, r.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED')
                        .then(() => {
                          qc.invalidateQueries({ queryKey: ['education-admin'] });
                          qc.invalidateQueries({ queryKey: ['education'] });
                        })
                    }
                  >
                    {r.status === 'PUBLISHED' ? t('common.draft', 'Draft') : t('common.published', 'Publish')}
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editId ? t('admin.education.editTitle', 'Edit Academic Program') : t('admin.education.createTitle', 'Add New Academic Program')} wide>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label={t('admin.education.programTitle', 'Program Title')} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <Input label={t('admin.education.slug', 'Slug')} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required disabled={!!editId} />
          </div>

          <Input label={t('admin.education.summary', 'Short Summary')} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
          <Textarea label={t('admin.education.content', 'Program Content & Details')} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required rows={4} />

          <Select label={t('admin.education.level', 'Grade Level')} value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
            {['KINDERGARTEN', 'ELEMENTARY', 'MIDDLE', 'HIGH'].map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </Select>

          <div className="space-y-2 border p-4 rounded-xl bg-slate-50">
            <label className="block text-sm font-semibold text-slate-800">{t('admin.education.coverImage', 'Cover Image')}</label>

            <div className="flex items-center gap-4">
              {currentCoverDisplay && (
                <img src={currentCoverDisplay} alt="Cover Preview" className="h-16 w-24 object-cover rounded-lg border shadow-xs" />
              )}
              <div className="space-y-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setSelectedFile(f);
                      setPreviewUrl(URL.createObjectURL(f));
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="text-xs py-1.5 px-3 flex items-center gap-1.5 bg-white shadow-2xs"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{t('admin.education.uploadFromPc', 'Upload Image from Computer')}</span>
                </Button>
                {selectedFile && <p className="text-xs text-emerald-600 font-medium">{t('admin.education.selectedFile', 'Selected file:')} {selectedFile.name}</p>}
              </div>
            </div>

            <Input
              label={t('admin.education.directUrl', 'Or Direct Image URL')}
              value={form.coverImageUrl}
              onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>

          {saveError && <p className="text-sm text-red-600 font-medium">{saveError}</p>}

          <div className="flex justify-end gap-3 pt-3 border-t">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button type="submit" disabled={save.isPending || isUploading}>
              {save.isPending || isUploading ? t('admin.education.saving', 'Saving...') : t('admin.education.saveProgram', 'Save Program')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export function AdminGalleryPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({ title: '', caption: '', category: 'OTHER' });
  const { data: images = [] } = useQuery({ queryKey: ['gallery-admin'], queryFn: () => galleryApi.admin().then((r) => r.data) });

  const upload = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('caption', form.caption);
      fd.append('category', form.category);
      if (file) fd.append('image', file);
      return galleryApi.create(fd);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['gallery-admin'] }); setFile(null); },
  });

  return (
    <div className="space-y-6">
      <PageHeader title={t('admin.gallery.title', 'Photo Gallery Management')} subtitle={t('admin.gallery.subtitle', 'Upload and manage photos of campus, events, and student activities.')} />
      <form className="grid md:grid-cols-4 gap-3 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs" onSubmit={(e) => { e.preventDefault(); upload.mutate(); }}>
        <Input label={t('admin.gallery.photoTitle', 'Photo Title')} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <Input label={t('admin.gallery.caption', 'Caption / Description')} value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} />
        <Input label={t('admin.gallery.uploadFromPc', 'Image File')} type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} required />
        <div className="flex items-end"><Button type="submit">{t('admin.gallery.uploadBtn', 'Upload Photo')}</Button></div>
      </form>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((img: { id: string; title: string; imageUrl: string; status: string }) => (
          <div key={img.id} className="relative group bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <img src={mediaUrl(img.imageUrl)} alt={img.title} className="w-full h-36 object-cover rounded-lg" />
            <div className="text-sm font-semibold mt-2 text-slate-800 truncate">{img.title}</div>
            <Button variant="secondary" className="py-1 px-2.5 text-xs mt-2 w-full" onClick={() => galleryApi.updateStatus(img.id, img.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED').then(() => { qc.invalidateQueries({ queryKey: ['gallery-admin'] }); qc.invalidateQueries({ queryKey: ['public-gallery'] }); })}>
              {img.status === 'PUBLISHED' ? t('common.draft', 'Draft') : t('common.published', 'Publish')}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

const LOCAL_PHOTOS = [
  '/photos/photo1.jpeg',
  '/photos/photo2.jpeg',
  '/photos/photo3.jpeg',
  '/photos/photo4.jpeg',
  '/photos/photo5.jpeg',
  '/photos/photo6.jpeg',
  '/photos/photo7.jpeg',
  '/photos/photo8.jpeg',
  '/photos/photo9.jpeg',
  '/photos/photo10.jpeg',
  '/photos/hero1.jpeg',
  '/photos/hero2.jpeg',
  '/photos/hero3.jpeg',
  '/photos/hero4.jpeg',
];

export function AdminBlogPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    titleAr: '',
    content: '',
    contentAr: '',
    categoryId: '',
    coverImageUrl: '/photos/photo1.jpeg',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { data: posts = [] } = useQuery({
    queryKey: ['posts-admin'],
    queryFn: () => blogApi.admin().then((r) => r.data),
  });
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => blogApi.categories('en').then((r) => r.data),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const save = useMutation({
    mutationFn: async () => {
      setSaveError(null);
      let finalCoverUrl = form.coverImageUrl;

      if (selectedFile) {
        const uploadRes = await storageApi.upload(selectedFile, 'posts');
        finalCoverUrl = uploadRes.data.fileUrl || uploadRes.data.url;
      }

      const payload = {
        title: form.title,
        titleAr: form.titleAr || undefined,
        content: form.content,
        contentAr: form.contentAr || undefined,
        categoryId: form.categoryId || undefined,
        coverImageUrl: finalCoverUrl,
      };

      return editId ? blogApi.update(editId, payload) : blogApi.create(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['posts-admin'] });
      setOpen(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      setSaveError(null);
    },
    onError: (err: any) => {
      setSaveError(getApiErrorMessage(err, t('common.errorSave', 'Failed to save post')));
    },
  });

  const openNewModal = () => {
    setEditId(null);
    setForm({
      title: '',
      titleAr: '',
      content: '',
      contentAr: '',
      categoryId: categories[0]?.id || '',
      coverImageUrl: '/photos/photo1.jpeg',
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setSaveError(null);
    setOpen(true);
  };

  const openEditModal = (r: any) => {
    setEditId(r.id);
    setForm({
      title: r.title || '',
      titleAr: r.titleAr || '',
      content: r.content || '',
      contentAr: r.contentAr || '',
      categoryId: r.category?.id || categories[0]?.id || '',
      coverImageUrl: r.coverImageUrl || '/photos/photo1.jpeg',
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setSaveError(null);
    setOpen(true);
  };

  const currentCoverDisplay = previewUrl || (form.coverImageUrl ? mediaUrl(form.coverImageUrl) : '/photos/photo1.jpeg');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <PageHeader title={t('admin.blogCrud.title', 'Articles & News Management')} />
          <p className="text-sm text-slate-500 mt-1">
            {t('admin.blogCrud.subtitle', 'Publish school announcements, news articles, and manage comments.')}
          </p>
        </div>
        <Button onClick={openNewModal} className="shadow-sm">{t('admin.blogCrud.addNew', '+ Write New Article')}</Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <DataTable data={posts} columns={[
          {
            key: 'cover',
            header: t('admin.education.coverImage', 'Cover Image'),
            render: (r) => (
              <div className="w-16 h-10 rounded border overflow-hidden bg-slate-100 flex items-center justify-center">
                {r.coverImageUrl ? (
                  <img
                    src={mediaUrl(r.coverImageUrl)}
                    alt={r.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/photos/photo1.jpeg';
                    }}
                  />
                ) : (
                  <span className="text-[10px] text-slate-400">—</span>
                )}
              </div>
            ),
          },
          {
            key: 'title',
            header: t('common.title', 'Title'),
            render: (r) => (
              <div>
                <div className="font-semibold text-slate-900">{r.title}</div>
                {r.titleAr && <div className="text-xs text-slate-500">{r.titleAr}</div>}
              </div>
            ),
          },
          { key: 'category', header: t('admin.gallery.category', 'Category'), render: (r) => r.category?.name || '—' },
          { key: 'status', header: t('common.status', 'Status'), render: (r) => <StatusBadge status={r.status} /> },
          {
            key: 'actions',
            header: t('common.actions', 'Actions'),
            render: (r) => (
              <div className="flex gap-2">
                <Button variant="outline" className="py-1 px-2.5 text-xs" onClick={() => openEditModal(r)}>
                  {t('common.edit', 'Edit')}
                </Button>
                <Button
                  variant="secondary"
                  className="py-1 px-2.5 text-xs"
                  onClick={() =>
                    blogApi.updateStatus(r.id, r.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED')
                      .then(() => {
                        qc.invalidateQueries({ queryKey: ['posts-admin'] });
                        qc.invalidateQueries({ queryKey: ['posts'] });
                      })
                  }
                >
                  {r.status === 'PUBLISHED' ? t('common.draft', 'Draft') : t('common.published', 'Publish')}
                </Button>
              </div>
            ),
          },
        ]} />
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editId ? t('common.edit', 'Edit') : t('admin.blogCrud.addNew', '+ Write New Article')} wide>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input label="العنوان (بالإنجليزية)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required minLength={5} />
            <Input label="العنوان (بالعربية)" value={form.titleAr} onChange={(e) => setForm({ ...form, titleAr: e.target.value })} />
          </div>

          <Select label="القسم الأكاديمي" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
            <option value="">اختر القسم...</option>
            {categories.map((c: { id: string; name: string }) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>

          <div className="space-y-2 border p-4 rounded-xl bg-slate-50/50">
            <label className="block text-sm font-semibold text-slate-800">صورة غلاف المقال</label>
            
            {/* Live Preview Box */}
            <div className="flex items-center gap-4">
              <div className="relative w-32 h-20 rounded-lg border overflow-hidden bg-slate-200 flex-shrink-0 shadow-2xs">
                <img
                  src={currentCoverDisplay}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/photos/photo1.jpeg';
                  }}
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500">اختر صورة من جهازك أو حدد صورة جاهزة</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="text-xs py-1 px-3 flex items-center gap-1.5"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-3.5 h-3.5" />
                  رفع صورة جديدة من الكمبيوتر
                </Button>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-xs text-slate-500 block mb-1.5 font-medium">أو اختر من الصور المعرفة مسبقاً:</span>
              <div className="grid grid-cols-5 md:grid-cols-7 gap-2">
                {LOCAL_PHOTOS.map((photo) => (
                  <button
                    type="button"
                    key={photo}
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      setForm({ ...form, coverImageUrl: photo });
                    }}
                    className={`relative rounded-md border-2 overflow-hidden h-12 transition-all ${!selectedFile && form.coverImageUrl === photo ? 'border-primary ring-2 ring-primary/40 scale-95' : 'border-transparent opacity-75 hover:opacity-100'}`}
                  >
                    <img src={mediaUrl(photo)} alt="Select" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="أو رابط الصورة المباشر (Custom Image URL)"
              value={selectedFile ? selectedFile.name : form.coverImageUrl}
              disabled={!!selectedFile}
              onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })}
              placeholder="/photos/photo1.jpeg"
            />
          </div>

          <Textarea label="المحتوى (بالإنجليزية)" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={4} required />
          <Textarea label="المحتوى (بالعربية)" value={form.contentAr} onChange={(e) => setForm({ ...form, contentAr: e.target.value })} rows={4} />

          {saveError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {saveError}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? 'جاري الحفظ والرفع...' : 'حفظ المقال'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export function AdminAdmissionsPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [status, setStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewAdmission, setViewAdmission] = useState<any | null>(null);

  const { data: admissions = [] } = useQuery({
    queryKey: ['admissions-admin', status],
    queryFn: () => admissionsApi.list(status || undefined).then((r) => r.data),
  });

  const filteredAdmissions = admissions.filter((a: any) => {
    const fullName = `${a.studentFirstName} ${a.studentLastName}`.toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || (a.gradeLevel && a.gradeLevel.toLowerCase().includes(search));
  });

  return (
    <div>
      <PageHeader
        title={t('admin.admissionsTitle', 'طلبات القبول')}
        subtitle={t('admin.admissionsSubtitle', 'إدارة طلبات الطلاب المتقدمين، مراجعة بيانات التواصل مع أولياء الأمور، وتحديث حالات القبول.')}
      />

      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-xs">
        <div className="w-full sm:w-72">
          <Input
            placeholder={t('admin.searchStudentPlaceholder', '🔍 البحث باسم الطالب أو المرحلة...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-neutral-medium dark:text-slate-400 whitespace-nowrap">
            {t('admin.filterStatusLabel', 'تصفية حسب الحالة:')}
          </span>
          <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full sm:w-44 text-xs">
            <option value="">{t('admin.allStatuses', 'جميع الحالات')}</option>
            {['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED'].map((s) => (
              <option key={s} value={s}>
                {String(t(`status.${s}`, s))}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <DataTable data={filteredAdmissions} columns={[
        { key: 'student', header: t('admin.studentName', 'اسم الطالب') as string, render: (r) => (
          <div>
            <div className="font-bold text-neutral-dark dark:text-slate-100">{r.studentFirstName} {r.studentLastName}</div>
            <div className="text-xs text-neutral-medium dark:text-slate-400">
              {r.referenceNumber ? `${t('admin.ref', 'رقم مرجعي')}: ${r.referenceNumber}` : `${t('admin.appId', 'رقم الطلب')}: #${r.id.slice(0, 8)}`}
            </div>
          </div>
        )},
        { key: 'grade', header: t('admin.gradeLevel', 'المرحلة الدراسية') as string, render: (r) => <span className="font-semibold text-xs px-2 py-1 bg-primary-light text-primary rounded">{t(`grades.${r.gradeLevel}`, r.gradeLevel) as string}</span> },
        { key: 'parent', header: t('admin.parentContact', 'بيانات التواصل مع ولي الأمر') as string, render: (r) => (
          <div className="text-xs">
            <div className="font-medium text-neutral-dark dark:text-slate-200">{r.parentName || r.parentEmail || (t('admin.na', 'غير محدد') as string)}</div>
            <div className="text-neutral-medium dark:text-slate-400">{r.parentPhone || r.parentEmail || ''}</div>
          </div>
        )},
        { key: 'status', header: t('admin.statusLabel', 'الحالة') as string, render: (r) => (
          <AdmissionStatusSelect
            className="border rounded p-1 text-xs bg-white dark:bg-slate-800 text-neutral-dark dark:text-slate-100 font-medium"
            value={r.status}
            onChange={(status) => admissionsApi.updateStatus(r.id, status).then(() => qc.invalidateQueries({ queryKey: ['admissions-admin'] }))}
          />
        )},
        { key: 'actions', header: t('admin.actions', 'الإجراءات') as string, render: (r) => (
          <div className="flex items-center gap-2">
            <Button variant="outline" className="py-1 px-2.5 text-xs font-semibold" onClick={() => setViewAdmission(r)}>
              {t('admin.view', 'عرض')}
            </Button>
            <Link to={`/admin/admissions/${r.id}`}>
              <Button variant="secondary" className="py-1 px-2.5 text-xs font-semibold">
                {t('admin.notes', 'الملاحظات')}
              </Button>
            </Link>
          </div>
        )},
      ]} />

      {/* View Admission Modal */}
      {viewAdmission && (
        <Modal open={!!viewAdmission} onClose={() => setViewAdmission(null)} title={`${t('admin.admissionDetailsTitle', 'طلب القبول')} — ${viewAdmission.studentFirstName} ${viewAdmission.studentLastName}`} wide>
          <div className="space-y-4 text-sm text-neutral-dark dark:text-slate-100">
            <div className="grid grid-cols-2 gap-4 bg-neutral-light dark:bg-slate-800 p-4 rounded-xl">
              <div><strong className="block text-xs text-neutral-medium">{t('admin.studentName', 'اسم الطالب')}:</strong> {viewAdmission.studentFirstName} {viewAdmission.studentLastName}</div>
              <div><strong className="block text-xs text-neutral-medium">{t('admin.ref', 'الرقم المرجعي')}:</strong> {viewAdmission.referenceNumber ?? '—'}</div>
              <div><strong className="block text-xs text-neutral-medium">{t('admin.gradeLevel', 'المرحلة الدراسية')}:</strong> {t(`grades.${viewAdmission.gradeLevel}`, viewAdmission.gradeLevel) as string}</div>
              <div><strong className="block text-xs text-neutral-medium">{t('admin.birthDate', 'تاريخ الميلاد')}:</strong> {viewAdmission.dateOfBirth ? new Date(viewAdmission.dateOfBirth).toLocaleDateString() : (t('admin.na', 'غير محدد') as string)}</div>
              <div><strong className="block text-xs text-neutral-medium">{t('admin.nationality', 'الجنسية')}:</strong> {viewAdmission.nationality || (t('admin.na', 'غير محدد') as string)}</div>
              <div><strong className="block text-xs text-neutral-medium">{t('admin.previousSchool', 'المدرسة السابقة')}:</strong> {viewAdmission.previousSchool || (t('admin.na', 'غير محدد') as string)}</div>
              <div><strong className="block text-xs text-neutral-medium">{t('admin.currentStatus', 'الحالة الحالية')}:</strong> <StatusBadge status={viewAdmission.status} /></div>
            </div>

            <div className="bg-neutral-light dark:bg-slate-800 p-4 rounded-xl space-y-2">
              <h4 className="font-bold text-xs uppercase text-primary tracking-wider">{t('admin.parentGuardianInfo', 'بيانات ولي الأمر / الوصي') as string}</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><strong>{t('admin.parentRelationship', 'صلة القرابة')}:</strong> {viewAdmission.parentRelationship || t('admin.na', 'غير محدد')}</div>
                <div><strong>{t('admin.employer', 'جهة العمل')}:</strong> {viewAdmission.parentEmployer || t('admin.na', 'غير محدد')}</div>
                <div><strong>{t('admin.emergencyPhone', 'هاتف الطوارئ')}:</strong> {viewAdmission.emergencyPhone || t('admin.na', 'غير محدد')}</div>
              </div>
            </div>

            {viewAdmission.documents && viewAdmission.documents.length > 0 && (
              <div className="bg-neutral-light dark:bg-slate-800 p-4 rounded-xl space-y-2">
                <h4 className="font-bold text-xs uppercase text-primary tracking-wider">{t('admin.attachedDocuments', 'المستندات المرفقة')}</h4>
                <div className="flex flex-wrap gap-2">
                  {viewAdmission.documents.map((doc: any) => (
                    <a key={doc.id} href={doc.fileUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-white dark:bg-slate-900 border rounded-lg text-xs font-mono text-primary flex items-center gap-1 hover:underline">
                      📄 {doc.documentType.replace('_', ' ')}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t">
              <Button onClick={() => setViewAdmission(null)}>{t('admin.close', 'إغلاق')}</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export function AdminAdmissionDetailPage({ id }: { id: string }) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const lang = useAppLanguage();
  const [note, setNote] = useState('');
  const { data: admission, isLoading } = useQuery({
    queryKey: ['admission-detail', id],
    queryFn: () => admissionsApi.get(id).then((r) => r.data),
  });

  if (isLoading) return <p className="text-sm text-slate-500">{t('admin.loading', 'جاري التحميل...')}</p>;
  if (!admission) return <p className="text-sm text-red-600">{t('admin.applicationNotFound', 'لم يتم العثور على الطلب.')}</p>;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${admission.studentFirstName} ${admission.studentLastName}`}
        subtitle={`${t(`grades.${admission.gradeLevel}`, admission.gradeLevel)} · ${admission.parentEmail}`}
      />

      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge status={admission.status} />
        <AdmissionStatusSelect
          value={admission.status}
          onChange={(status) =>
            admissionsApi.updateStatus(id, status).then(() => {
              qc.invalidateQueries({ queryKey: ['admission-detail', id] });
              qc.invalidateQueries({ queryKey: ['admissions-admin'] });
            })
          }
          className="w-48"
        />
      </div>

      {admission.documents && admission.documents.length > 0 && (
        <div className="rounded-xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-primary">{t('admin.documents', 'المستندات')}</h3>
          <div className="flex flex-wrap gap-2">
            {admission.documents.map((doc) => (
              <a
                key={doc.id}
                href={mediaUrl(doc.fileUrl)}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border px-3 py-1.5 text-xs font-medium text-primary hover:underline"
              >
                {doc.documentType.replace(/_/g, ' ')}
              </a>
            ))}
          </div>
        </div>
      )}

      {admission.statusHistory && admission.statusHistory.length > 0 && (
        <div className="rounded-xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-primary">{t('admin.statusHistory', 'سجل تغييرات الحالة')}</h3>
          <div className="space-y-2">
            {admission.statusHistory.map((entry) => (
              <div key={entry.id} className="flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <StatusBadge status={entry.fromStatus} />
                <span>→</span>
                <StatusBadge status={entry.toStatus} />
                <span className="text-xs text-slate-400">
                  {entry.changedBy?.fullName || t('admin.system', 'النظام')} · {formatDate(entry.createdAt, lang)}
                </span>
                {entry.note && <span className="w-full text-xs italic text-slate-500">{entry.note}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {admission.notes && admission.notes.length > 0 && (
        <div className="rounded-xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-primary">{t('admin.internalNotes', 'الملاحظات الداخلية')}</h3>
          <div className="space-y-2">
            {admission.notes.map((n) => (
              <div key={n.id} className="rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800">
                <div className="text-xs text-slate-400">{n.author?.fullName} · {formatDate(n.createdAt, lang)}</div>
                <p className="mt-1">{n.noteContent}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <Textarea value={note} onChange={(e) => setNote(e.target.value)} label={t('admin.addInternalNote', 'إضافة ملاحظة داخلية')} />
        <Button
          className="mt-3"
          onClick={() =>
            admissionsApi.addNote(id, note).then(() => {
              setNote('');
              qc.invalidateQueries({ queryKey: ['admission-detail', id] });
            })
          }
        >
          {t('admin.addNote', 'إضافة ملاحظة')}
        </Button>
      </div>
    </div>
  );
}

export function AdminRequirementsPage() {
  const qc = useQueryClient();
  const { data: items = [] } = useQuery({ queryKey: ['requirements'], queryFn: () => requirementsApi.list(true).then((r) => r.data) });
  const [form, setForm] = useState({ gradeLevel: '', title: '', description: '', minAge: 0, maxAge: 0 });
  return (
    <div>
      <PageHeader title="Admission Requirements" />
      <form className="grid md:grid-cols-3 gap-3 mb-6" onSubmit={(e) => { e.preventDefault(); requirementsApi.create(form).then(() => qc.invalidateQueries({ queryKey: ['requirements'] })); }}>
        <Input label="Grade" value={form.gradeLevel} onChange={(e) => setForm({ ...form, gradeLevel: e.target.value })} required />
        <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <Button type="submit">Add</Button>
      </form>
      <DataTable data={items} columns={[
        { key: 'grade', header: 'Grade', render: (r: { gradeLevel: string }) => r.gradeLevel },
        { key: 'title', header: 'Title', render: (r: { title: string }) => r.title },
        { key: 'actions', header: 'Actions', render: (r: { id: string }) => (
          <Button variant="primary" className="py-1 px-2 text-xs" onClick={() => requirementsApi.remove(r.id).then(() => qc.invalidateQueries({ queryKey: ['requirements'] }))}>Delete</Button>
        )},
      ]} />
    </div>
  );
}

export function AdminJobApplicationsPage({ jobId }: { jobId: string }) {
  const qc = useQueryClient();
  const [viewApp, setViewApp] = useState<any | null>(null);
  const { data: apps = [] } = useQuery({
    queryKey: ['job-apps', jobId],
    queryFn: () => (jobId === 'all' ? careersApi.allApplications() : careersApi.applications(jobId)).then((r) => r.data),
  });

  const statuses = ['DRAFT', 'SUBMITTED', 'REVIEWING', 'SHORTLISTED', 'ACCEPTED', 'REJECTED'];

  return (
    <div>
      <PageHeader title="Teacher & Job Applications" subtitle="Review candidate profiles, credentials, and update hiring statuses." />
      <DataTable data={apps} columns={[
        { key: 'name', header: 'Candidate Name', render: (r: { fullName: string; phone: string }) => (
          <div>
            <div className="font-semibold text-neutral-dark">{r.fullName}</div>
            <div className="text-xs text-neutral-medium">{r.phone}</div>
          </div>
        )},
        { key: 'email', header: 'Email', render: (r: { email: string }) => r.email },
        { key: 'documents', header: 'Uploaded Credentials', render: (r: { documents?: Array<{ id: string; fileName: string; fileUrl: string; documentType: string }> }) => (
          <div className="flex flex-wrap gap-1">
            {r.documents && r.documents.length > 0 ? (
              r.documents.map((doc) => (
                <a
                  key={doc.id}
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs bg-primary-light text-primary hover:underline px-2 py-0.5 rounded font-mono flex items-center gap-1"
                >
                  📄 {doc.documentType.replace('_', ' ')}
                </a>
              ))
            ) : (
              <span className="text-xs text-neutral-medium italic">No files attached</span>
            )}
          </div>
        )},
        { key: 'status', header: 'Status', render: (r: { id: string; status: string }) => (
          <select
            className="border rounded p-1 text-xs bg-white font-medium"
            value={r.status}
            onChange={(e) => careersApi.updateApplicationStatus(r.id, e.target.value).then(() => qc.invalidateQueries({ queryKey: ['job-apps', jobId] }))}
          >
            {statuses.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        )},
        { key: 'actions', header: 'Actions', render: (r: any) => (
          <Button variant="outline" className="py-1 px-2.5 text-xs font-semibold" onClick={() => setViewApp(r)}>
            عرض الملف
          </Button>
        )},
      ]} />

      {/* View Application Modal */}
      {viewApp && (
        <Modal open={!!viewApp} onClose={() => setViewApp(null)} title={`تفاصيل المتقدم: ${viewApp.fullName}`} wide>
          <div className="space-y-4 text-sm text-slate-800">
            <div className="flex flex-wrap md:flex-nowrap gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-2xl border border-primary/20 shrink-0">
                {viewApp.fullName ? viewApp.fullName.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">{viewApp.fullName}</h3>
                <div className="text-slate-500">{viewApp.email}</div>
                <div className="text-slate-500" dir="ltr">{viewApp.phone}</div>
              </div>
              <div className="shrink-0 flex items-center">
                 <StatusBadge status={viewApp.status} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200 p-4 rounded-xl">
                <h4 className="font-bold text-xs uppercase text-slate-500 mb-3 border-b pb-2">بيانات الطلب</h4>
                <div className="space-y-2 text-sm">
                  <div><strong className="font-medium text-slate-700">تاريخ التقديم:</strong> {new Date(viewApp.createdAt || Date.now()).toLocaleString('ar-EG')}</div>
                  <div><strong className="font-medium text-slate-700">الوظيفة المتقدم لها:</strong> {viewApp.job?.title || 'غير محدد'}</div>
                  <div>
                     <strong className="font-medium text-slate-700 block mb-1">خطاب التقديم (Cover Letter):</strong>
                     <div className="bg-slate-50 p-3 rounded text-slate-600 text-xs leading-relaxed max-h-32 overflow-y-auto whitespace-pre-wrap">
                        {viewApp.coverLetter || 'لا يوجد خطاب تقديم.'}
                     </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-4 rounded-xl">
                <h4 className="font-bold text-xs uppercase text-slate-500 mb-3 border-b pb-2">المستندات المرفقة</h4>
                {viewApp.documents && viewApp.documents.length > 0 ? (
                  <div className="space-y-2">
                    {viewApp.documents.map((doc: any) => (
                      <a
                        key={doc.id}
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 p-2 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 text-xs font-mono text-primary transition-colors"
                      >
                        <span className="text-lg">📄</span>
                        <div className="flex-1">
                          <div className="font-semibold">{doc.documentType.replace('_', ' ')}</div>
                          <div className="text-slate-400 text-[10px]">{doc.fileName}</div>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-slate-400 italic">لا توجد ملفات مرفقة.</div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t mt-2">
               <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600">تغيير حالة الطلب:</span>
                  <select
                    className="border rounded p-1.5 text-xs bg-white font-medium"
                    value={viewApp.status}
                    onChange={(e) => {
                       careersApi.updateApplicationStatus(viewApp.id, e.target.value).then(() => {
                          qc.invalidateQueries({ queryKey: ['job-apps', jobId] });
                          setViewApp({ ...viewApp, status: e.target.value });
                       });
                    }}
                  >
                    {statuses.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
               </div>
              <Button variant="outline" onClick={() => setViewApp(null)}>إغلاق</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

interface ContactInquiry {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  status: 'NEW' | 'READ' | 'REPLIED' | 'ARCHIVED';
  createdAt: string;
  updatedAt?: string;
}

export function AdminInquiriesPage() {
  const lang = useAppLanguage();
  const { t } = useTranslation();
  const qc = useQueryClient();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);
  const [replyInquiry, setReplyInquiry] = useState<ContactInquiry | null>(null);

  const [replyForm, setReplyForm] = useState({ subject: '', message: '' });
  const [replyLoading, setReplyLoading] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [replySuccess, setReplySuccess] = useState<string | null>(null);

  const { data: inquiries = [] } = useQuery<ContactInquiry[]>({
    queryKey: ['inquiries', statusFilter],
    queryFn: () =>
      contactApi
        .admin(statusFilter === 'ALL' ? undefined : statusFilter)
        .then((r) => r.data),
  });

  const handleOpenView = (inquiry: ContactInquiry) => {
    setSelectedInquiry(inquiry);
    if (inquiry.status === 'NEW') {
      contactApi.updateStatus(inquiry.id, 'READ').then(() => {
        qc.invalidateQueries({ queryKey: ['inquiries'] });
      });
    }
  };

  const handleOpenReply = (inquiry: ContactInquiry) => {
    setReplyInquiry(inquiry);
    setReplyForm({
      subject: inquiry.subject.startsWith('Re:')
        ? inquiry.subject
        : `Re: ${inquiry.subject}`,
      message: '',
    });
    setReplyError(null);
    setReplySuccess(null);
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInquiry || !replyForm.message.trim()) return;

    setReplyLoading(true);
    setReplyError(null);
    setReplySuccess(null);

    try {
      await contactApi.reply(replyInquiry.id, {
        subject: replyForm.subject,
        message: replyForm.message,
      });
      setReplySuccess(t('admin.replySuccess') || 'Reply sent successfully!');
      qc.invalidateQueries({ queryKey: ['inquiries'] });
      if (selectedInquiry?.id === replyInquiry.id) {
        setSelectedInquiry((prev) =>
          prev ? { ...prev, status: 'REPLIED' } : null,
        );
      }
      setTimeout(() => {
        setReplyInquiry(null);
        setReplySuccess(null);
      }, 1500);
    } catch (err: unknown) {
      setReplyError(getApiErrorMessage(err, 'Failed to send reply email'));
    } finally {
      setReplyLoading(false);
    }
  };

  const filteredInquiries = inquiries.filter((item) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.fullName.toLowerCase().includes(term) ||
      item.email.toLowerCase().includes(term) ||
      item.subject.toLowerCase().includes(term) ||
      (item.phone && item.phone.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader title={t('admin.inquiries') || 'Contact Inquiries'} />

        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'NEW', 'READ', 'REPLIED', 'ARCHIVED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === st
                  ? 'bg-navy-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL'
                ? t('admin.allStatuses') || 'All'
                : t(`admin.status${st.charAt(0) + st.slice(1).toLowerCase()}`) || st}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 rtl:right-auto rtl:left-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t('admin.searchInquiries') || 'Search inquiries...'}
          className="w-full pl-9 pr-9 py-2 text-sm border rounded-lg bg-white border-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-500"
        />
      </div>

      <DataTable
        data={filteredInquiries}
        columns={[
          {
            key: 'name',
            header: t('common.name') || 'Name',
            render: (r: ContactInquiry) => (
              <div>
                <div className="font-semibold text-slate-800">{r.fullName}</div>
                <div className="text-xs text-slate-400">{r.email}</div>
              </div>
            ),
          },
          {
            key: 'subject',
            header: t('common.subject') || 'Subject',
            render: (r: ContactInquiry) => (
              <div className="max-w-xs truncate font-medium text-slate-700">
                {r.subject}
              </div>
            ),
          },
          {
            key: 'date',
            header: t('common.date') || 'Date',
            render: (r: ContactInquiry) => (
              <span className="text-xs text-slate-500">{formatDate(r.createdAt, lang)}</span>
            ),
          },
          {
            key: 'status',
            header: t('common.status') || 'Status',
            render: (r: ContactInquiry) => <StatusBadge status={r.status} />,
          },
          {
            key: 'actions',
            header: t('common.actions') || 'Actions',
            render: (r: ContactInquiry) => (
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  className="py-1 px-2.5 text-xs flex items-center gap-1"
                  onClick={() => handleOpenView(r)}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{t('common.view') || 'View'}</span>
                </Button>

                <Button
                  variant="secondary"
                  className="py-1 px-2.5 text-xs flex items-center gap-1 bg-navy-50 text-navy-800 hover:bg-navy-100 border border-navy-200"
                  onClick={() => handleOpenReply(r)}
                >
                  <Mail className="w-3.5 h-3.5 text-navy-600" />
                  <span>{t('admin.replyToInquiry') || 'Reply'}</span>
                </Button>
              </div>
            ),
          },
        ]}
      />

      {/* View Inquiry Modal */}
      {selectedInquiry && (
        <Modal
          open={!!selectedInquiry}
          onClose={() => setSelectedInquiry(null)}
          title={t('admin.inquiryDetails') || 'Inquiry Details'}
        >
          <div className="space-y-5">
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2">
                <StatusBadge status={selectedInquiry.status} />
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDate(selectedInquiry.createdAt, lang)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  className="border rounded px-2 py-1 text-xs bg-white font-medium text-slate-700"
                  value={selectedInquiry.status}
                  onChange={(e) => {
                    const newStatus = e.target.value as any;
                    contactApi.updateStatus(selectedInquiry.id, newStatus).then(() => {
                      qc.invalidateQueries({ queryKey: ['inquiries'] });
                      setSelectedInquiry({ ...selectedInquiry, status: newStatus });
                    });
                  }}
                >
                  <option value="NEW">NEW</option>
                  <option value="READ">READ</option>
                  <option value="REPLIED">REPLIED</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>
            </div>

            {/* Submitter details cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-slate-100 bg-white shadow-sm space-y-1">
                <div className="text-xs text-slate-400 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t('common.name') || 'Name'}</span>
                </div>
                <div className="font-semibold text-slate-800 text-sm">
                  {selectedInquiry.fullName}
                </div>
              </div>

              <div className="p-3 rounded-lg border border-slate-100 bg-white shadow-sm space-y-1">
                <div className="text-xs text-slate-400 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t('common.email') || 'Email'}</span>
                </div>
                <div className="font-medium text-slate-800 text-sm break-all">
                  <a
                    href={`mailto:${selectedInquiry.email}`}
                    className="text-navy-600 hover:underline flex items-center gap-1"
                  >
                    {selectedInquiry.email}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {selectedInquiry.phone && (
                <div className="p-3 rounded-lg border border-slate-100 bg-white shadow-sm space-y-1 sm:col-span-2">
                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{t('common.phone') || 'Phone'}</span>
                  </div>
                  <div className="font-medium text-slate-800 text-sm">
                    <a
                      href={`tel:${selectedInquiry.phone}`}
                      className="text-slate-700 hover:text-navy-600 dir-ltr inline-block"
                    >
                      {selectedInquiry.phone}
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Subject */}
            <div className="space-y-1">
              <div className="text-xs font-semibold text-slate-500">
                {t('common.subject') || 'Subject'}
              </div>
              <div className="p-2.5 bg-slate-100 rounded-md font-semibold text-slate-800 text-sm">
                {selectedInquiry.subject}
              </div>
            </div>

            {/* Message Body */}
            <div className="space-y-1">
              <div className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{t('admin.inquiryMessage') || 'Inquiry Message'}</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-slate-800 text-sm whitespace-pre-wrap leading-relaxed min-h-[120px]">
                {selectedInquiry.message}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t">
              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  className="flex items-center gap-1.5"
                  onClick={() => {
                    const inquiryToReply = selectedInquiry;
                    setSelectedInquiry(null);
                    handleOpenReply(inquiryToReply);
                  }}
                >
                  <Mail className="w-4 h-4" />
                  <span>{t('admin.replyToInquiry') || 'Reply via Email'}</span>
                </Button>

                <a
                  href={`mailto:${selectedInquiry.email}?subject=${encodeURIComponent(
                    `Re: ${selectedInquiry.subject}`,
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{t('admin.openMailClient') || 'Open Mail App'}</span>
                </a>
              </div>

              <Button variant="outline" onClick={() => setSelectedInquiry(null)}>
                {t('common.close') || 'Close'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reply Modal */}
      {replyInquiry && (
        <Modal
          open={!!replyInquiry}
          onClose={() => setReplyInquiry(null)}
          title={`${t('admin.replyToInquiry') || 'Reply to'}: ${replyInquiry.fullName}`}
        >
          <form onSubmit={handleSendReply} className="space-y-4">
            {replySuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>{replySuccess}</span>
              </div>
            )}

            {replyError && (
              <div className="p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-lg text-sm">
                {replyError}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">
                {t('common.to') || 'To'}
              </label>
              <Input value={`${replyInquiry.fullName} <${replyInquiry.email}>`} disabled />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">
                {t('admin.replySubject') || 'Email Subject'}
              </label>
              <Input
                value={replyForm.subject}
                onChange={(e) =>
                  setReplyForm((prev) => ({ ...prev, subject: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">
                {t('admin.replyMessage') || 'Message'}
              </label>
              <Textarea
                value={replyForm.message}
                onChange={(e) =>
                  setReplyForm((prev) => ({ ...prev, message: e.target.value }))
                }
                rows={6}
                placeholder={
                  t('admin.replyPlaceholder') ||
                  'Write your response to the inquiry here...'
                }
                required
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1 text-xs text-slate-500">
              <div className="font-semibold text-slate-600">
                {t('admin.originalInquiry') || 'Original Inquiry'}:
              </div>
              <div className="line-clamp-2 italic">{replyInquiry.message}</div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setReplyInquiry(null)}
                disabled={replyLoading}
              >
                {t('common.cancel') || 'Cancel'}
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={replyLoading || !replyForm.message.trim()}
                className="flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>
                  {replyLoading
                    ? t('common.sending') || 'Sending...'
                    : t('admin.sendReply') || 'Send Reply'}
                </span>
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}


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
                <h4 className="font-bold text-xs uppercase text-slate-500 mb-2">معلومات إضافية</h4>
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
              <Button variant="outline" onClick={() => setViewUser(null)}>إغلاق</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

const PERMISSION_GROUPS: Record<string, { label: string; permissions: string[] }> = {
  content: {
    label: 'إدارة المحتوى والمقالات والميديا',
    permissions: ['CREATE_BLOG', 'UPDATE_BLOG', 'APPROVE_COMMENTS', 'MANAGE_EDUCATION', 'MANAGE_GALLERY', 'MANAGE_LANDING', 'MANAGE_ABOUT_US'],
  },
  admissions: {
    label: 'طلبات القبول والتسجيل والطلاب',
    permissions: ['VIEW_ALL_ADMISSIONS', 'UPDATE_ADMISSION_STATUS', 'ADD_ADMISSION_NOTE', 'CREATE_ADMISSION', 'VIEW_OWN_ADMISSION', 'MANAGE_ADMISSION_REQUIREMENTS'],
  },
  users: {
    label: 'إدارة المستخدمين والأدوار والأمان',
    permissions: ['MANAGE_USERS', 'MANAGE_ROLES'],
  },
  careers: {
    label: 'الوظائف والتوظيف والتقديمات',
    permissions: ['MANAGE_JOBS', 'VIEW_APPLICATIONS', 'CREATE_JOB_APPLICATION', 'VIEW_OWN_JOB_APPLICATION'],
  },
  system: {
    label: 'إعدادات النظام والرسائل والتنبيهات',
    permissions: ['UPDATE_SYSTEM_CONFIG', 'VIEW_DASHBOARD', 'MANAGE_EMAIL_TEMPLATES', 'MANAGE_NOTIFICATIONS'],
  },
};

const ROLE_ARABIC_NAMES: Record<string, { ar: string; badge: string }> = {
  ADMIN: { ar: 'مدير النظام الرئيسي', badge: 'bg-purple-100 text-purple-800 border-purple-200' },
  TEACHER: { ar: 'معلم / طاقم تدريس', badge: 'bg-blue-100 text-blue-800 border-blue-200' },
  PARENT: { ar: 'ولي أمر', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  APPLICANT: { ar: 'متقدم لوظيفة', badge: 'bg-amber-100 text-amber-800 border-amber-200' },
  STUDENT: { ar: 'طالب', badge: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  GUEST: { ar: 'زائر', badge: 'bg-slate-100 text-slate-700 border-slate-200' },
};

export function AdminRolesPage() {
  const { t } = useTranslation();
  const lang = useAppLanguage();
  const qc = useQueryClient();
  const { data: roles = [] } = useQuery({ queryKey: ['roles'], queryFn: () => rolesApi.list().then((r) => r.data) });
  const { data: permissions = [] } = useQuery({ queryKey: ['all-permissions'], queryFn: () => rolesApi.permissions().then((r) => r.data) });
  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: () => usersApi.list().then((r) => r.data) });

  const [activeTab, setActiveTab] = useState<'matrix' | 'members'>('matrix');
  const [selectedRoleForMembers, setSelectedRoleForMembers] = useState<string>('all');
  const [searchMember, setSearchMember] = useState('');

  // Modals state
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [newRoleForm, setNewRoleForm] = useState({ name: '', description: '' });
  const [newRolePerms, setNewRolePerms] = useState<string[]>([]);
  const [createRoleError, setCreateRoleError] = useState<string | null>(null);
  const [savingPerms, setSavingPerms] = useState(false);

  // Quick User Creation Modal inside Roles Page
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [targetRoleIdForUser, setTargetRoleIdForUser] = useState<string>('');
  const [userForm, setUserForm] = useState({ fullName: '', email: '', password: '' });
  const [addUserError, setAddUserError] = useState<string | null>(null);

  const startEdit = (role: { id: string; rolePermissions: Array<{ permission: { name: string } }> }) => {
    setEditingRoleId(role.id);
    setSelectedPerms(role.rolePermissions.map((rp) => rp.permission.name));
  };

  const togglePerm = (permName: string) => {
    setSelectedPerms((prev) =>
      prev.includes(permName) ? prev.filter((p) => p !== permName) : [...prev, permName]
    );
  };

  const toggleNewRolePerm = (permName: string) => {
    setNewRolePerms((prev) =>
      prev.includes(permName) ? prev.filter((p) => p !== permName) : [...prev, permName]
    );
  };

  const handleSavePerms = async (roleId: string) => {
    setSavingPerms(true);
    try {
      await rolesApi.updatePermissions(roleId, selectedPerms);
      setEditingRoleId(null);
      qc.invalidateQueries({ queryKey: ['roles'] });
    } catch (err: unknown) {
      alert(getApiErrorMessage(err, t('common.errorSave', 'Failed to update permissions')));
    } finally {
      setSavingPerms(false);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleForm.name) return;
    setCreateRoleError(null);
    try {
      await rolesApi.create({
        name: newRoleForm.name,
        description: newRoleForm.description,
        permissionNames: newRolePerms,
      });
      setShowCreateRoleModal(false);
      setNewRoleForm({ name: '', description: '' });
      setNewRolePerms([]);
      qc.invalidateQueries({ queryKey: ['roles'] });
    } catch (err: unknown) {
      setCreateRoleError(getApiErrorMessage(err, t('common.errorSave', 'Failed to create role')));
    }
  };

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

  // Filtered members for breakdown table
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
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <PageHeader title={t('admin.roles.title', 'Roles & Permissions')} />
          <p className="text-sm text-slate-500 mt-1">
            {t('admin.roles.subtitle', 'Define custom roles and set fine-grained system permissions.')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowCreateRoleModal(true)} variant="outline" className="shadow-2xs text-xs">
            {t('admin.roles.addNew', '+ Add New Role')}
          </Button>
          <Button
            onClick={() => {
              setTargetRoleIdForUser(roles[0]?.id || '');
              setShowAddUserModal(true);
            }}
            className="shadow-sm text-xs"
          >
            {t('admin.users.addNew', '+ Add New User')}
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">{t('admin.roles.totalRoles', 'Total Roles')}</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{roles.length}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">{t('admin.users.activeUsers', 'Active Users')}</div>
          <div className="text-2xl font-bold text-primary mt-1">{users.length}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">{t('admin.roles.sysAdmins', 'System Administrators')}</div>
          <div className="text-2xl font-bold text-purple-700 mt-1">
            {users.filter((u: any) => u.role?.name === 'ADMIN').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">{t('admin.roles.sysPerms', 'System Permissions')}</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{permissions.length}</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-4 pt-3 rounded-t-xl gap-6">
        <button
          onClick={() => setActiveTab('matrix')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'matrix'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          🛡️ {t('admin.roles.title', 'Roles Matrix')}
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'members'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-800'
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
              const isEditing = editingRoleId === role.id;
              const roleMeta = ROLE_ARABIC_NAMES[role.name] || { ar: role.name, badge: 'bg-slate-100 text-slate-800 border-slate-200' };
              const isCoreRole = ['ADMIN', 'TEACHER', 'PARENT', 'APPLICANT', 'STUDENT', 'GUEST'].includes(role.name);

              return (
                <div key={role.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg text-slate-900">{role.name}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${roleMeta.badge}`}>
                            {lang === 'ar' ? roleMeta.ar : role.name}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{role.description || '—'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border font-semibold">
                          👥 {role._count?.users ?? 0} {t('admin.users', 'Users')}
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

                    {/* Permissions summary tag list */}
                    {!isEditing ? (
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <div className="text-xs font-semibold text-slate-700 mb-2">
                          {t('admin.roles.permissions', 'Permissions')} ({role.rolePermissions?.length || 0}):
                        </div>
                        <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto pr-1">
                          {role.rolePermissions && role.rolePermissions.length > 0 ? (
                            role.rolePermissions.map((rp: any) => (
                              <span
                                key={rp.permission?.name}
                                className="text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded font-mono border border-primary/20"
                              >
                                {rp.permission?.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400 italic">بدون صلاحيات نظامية</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Editing mode inside card */
                      <div className="mt-3 pt-3 border-t border-slate-200 space-y-3 bg-slate-50 p-3 rounded-lg border">
                        <div className="text-xs font-bold text-slate-800">اختر الصلاحيات لهذا الدور:</div>
                        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                          {permissions.map((p: any) => {
                            const checked = selectedPerms.includes(p.name);
                            return (
                              <label key={p.name} className="flex items-start gap-2 text-xs cursor-pointer p-1.5 rounded hover:bg-white border border-transparent hover:border-slate-200">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => togglePerm(p.name)}
                                  className="mt-0.5 rounded border-slate-300 text-primary focus:ring-primary"
                                />
                                <div>
                                  <strong className="block text-slate-900">{p.name}</strong>
                                  <span className="text-[10px] text-slate-500 block">{p.description}</span>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-4 mt-4 border-t border-slate-100">
                    <button
                      type="button"
                      className="text-xs text-primary font-semibold hover:underline"
                      onClick={() => {
                        setSelectedRoleForMembers(role.id);
                        setActiveTab('members');
                      }}
                    >
                      عرض الأعضاء ({role._count?.users ?? 0}) ➔
                    </button>

                    {!isEditing ? (
                      <Button variant="outline" className="py-1 px-3 text-xs" onClick={() => startEdit(role)}>
                        تعديل الصلاحيات
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="outline" className="py-1 px-3 text-xs" onClick={() => setEditingRoleId(null)}>
                          إلغاء
                        </Button>
                        <Button className="py-1 px-3 text-xs" disabled={savingPerms} onClick={() => handleSavePerms(role.id)}>
                          {savingPerms ? 'جاري الحفظ...' : 'حفظ الصلاحيات'}
                        </Button>
                      </div>
                    )}
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

      {/* Modal: Create New Role */}
      <Modal open={showCreateRoleModal} onClose={() => setShowCreateRoleModal(false)} title="إضافة دور وظيفي جديد (Create New Role)" wide>
        <form onSubmit={handleCreateRole} className="space-y-4">
          <Input
            label="اسم الدور الوظيفي (Role Name e.g. ASSISTANT_PRINCIPAL)"
            value={newRoleForm.name}
            onChange={(e) => setNewRoleForm({ ...newRoleForm, name: e.target.value })}
            placeholder="مثال: CONTENT_MANAGER"
            required
          />
          <Input
            label="وصف الدور (Role Description)"
            value={newRoleForm.description}
            onChange={(e) => setNewRoleForm({ ...newRoleForm, description: e.target.value })}
            placeholder="وصف مختصر لمسؤوليات هذا الدور"
          />

          <div className="space-y-3 border p-4 rounded-xl bg-slate-50/50">
            <label className="block text-sm font-semibold text-slate-800">حدد صلاحيات الوصول المبدئية لهذا الدور:</label>

            {Object.entries(PERMISSION_GROUPS).map(([key, group]) => (
              <div key={key} className="space-y-2 border-t pt-2 first:border-t-0 first:pt-0">
                <span className="text-xs font-bold text-primary block">{group.label}</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {group.permissions.map((permName) => {
                    const checked = newRolePerms.includes(permName);
                    return (
                      <label key={permName} className="flex items-center gap-2 text-xs cursor-pointer p-1.5 rounded bg-white border border-slate-200 hover:border-primary">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleNewRolePerm(permName)}
                          className="rounded border-slate-300 text-primary focus:ring-primary"
                        />
                        <span className="font-mono text-[11px] text-slate-800">{permName}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {createRoleError && (
            <p className="text-sm text-red-600 bg-red-50 p-2.5 rounded border border-red-200">{createRoleError}</p>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button type="button" variant="outline" onClick={() => setShowCreateRoleModal(false)}>
              إلغاء
            </Button>
            <Button type="submit">حفظ الدور الجديد</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add User to Role */}
      <Modal open={showAddUserModal} onClose={() => setShowAddUserModal(false)} title="إضافة مستخدم جديد وتعيين دوره الوظيفي">
        <form onSubmit={handleAddUserToRole} className="space-y-4">
          <Input label="الاسم بالكامل" value={userForm.fullName} onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })} required />
          <Input label="البريد الإلكتروني" type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} required />
          <Input label="كلمة المرور" type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} required minLength={6} />
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-800">الدور الوظيفي المخصص</label>
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


export function AdminEmailPage() {
  const qc = useQueryClient();
  const { data: templates = [] } = useQuery({ queryKey: ['email-templates'], queryFn: () => emailApi.templates().then((r) => r.data) });
  const { data: logs = [] } = useQuery({ queryKey: ['email-logs'], queryFn: () => emailApi.logs().then((r) => r.data) });
  const [form, setForm] = useState({ key: '', subject: '', body: '' });
  return (
    <div>
      <PageHeader title="Email Templates & Logs" />
      <form className="space-y-3 mb-8 max-w-xl" onSubmit={(e) => { e.preventDefault(); emailApi.createTemplate(form).then(() => qc.invalidateQueries({ queryKey: ['email-templates'] })); }}>
        <Input label="Key" value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} />
        <Input label="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
        <Textarea label="Body" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
        <Button type="submit">Create Template</Button>
      </form>
      <DataTable data={templates} columns={[
        { key: 'key', header: 'Key', render: (r: { key: string }) => r.key },
        { key: 'subject', header: 'Subject', render: (r: { subject: string }) => r.subject },
      ]} />
      <h3 className="font-semibold mt-8 mb-4">Delivery Logs</h3>
      <DataTable data={logs} columns={[
        { key: 'recipient', header: 'To', render: (r: { recipient: string }) => r.recipient },
        { key: 'subject', header: 'Subject', render: (r: { subject: string }) => r.subject },
        { key: 'status', header: 'Status', render: (r: { status: string }) => <StatusBadge status={r.status} /> },
      ]} />
    </div>
  );
}
