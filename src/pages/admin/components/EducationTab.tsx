import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { educationApi, storageApi } from '../../../api';
import { Button } from '../../../components/ui/Button';
import { Input, Select, Textarea } from '../../../components/ui/Input';
import { DataTable, Modal } from '../../../components/ui/DataTable';
import { StatusBadge, PageHeader } from '../../../components/ui/Badge';
import { AdminPageGuide } from '../../../components/admin/AdminPageGuide';
import { mediaUrl } from '../../../lib/utils';
import { getApiErrorMessage, omitKeys } from '../../../lib/formData';
import { Upload } from 'lucide-react';

export function AdminEducationPage() {
  const { t } = useTranslation();
  const { id: routeProgramId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handledRouteId = useRef<string | null>(null);
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

  const openEdit = (r: {
    id: string;
    title?: string;
    slug?: string;
    summary?: string;
    content?: string;
    level?: string;
    sortOrder?: number;
    coverImageUrl?: string;
  }) => {
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

  useEffect(() => {
    if (!routeProgramId) {
      handledRouteId.current = null;
      return;
    }
    if (handledRouteId.current === routeProgramId) return;

    const fromList = programs.find((p: { id: string }) => p.id === routeProgramId);
    if (fromList) {
      handledRouteId.current = routeProgramId;
      openEdit(fromList);
      return;
    }

    educationApi
      .getById(routeProgramId)
      .then((res) => {
        handledRouteId.current = routeProgramId;
        openEdit(res.data);
      })
      .catch(() => navigate('/admin/education', { replace: true }));
  }, [routeProgramId, programs, navigate]);

  const closeModal = () => {
    setOpen(false);
    if (routeProgramId) {
      handledRouteId.current = null;
      navigate('/admin/education', { replace: true });
    }
  };

  const currentCoverDisplay = previewUrl || (form.coverImageUrl ? mediaUrl(form.coverImageUrl) : null);

  return (
    <div className="space-y-6">
      <AdminPageGuide guideKey="education" />
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

      <Modal open={open} onClose={closeModal} title={editId ? t('admin.education.editTitle', 'Edit Academic Program') : t('admin.education.createTitle', 'Add New Academic Program')} wide>
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
            <Button variant="outline" type="button" onClick={closeModal}>
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
