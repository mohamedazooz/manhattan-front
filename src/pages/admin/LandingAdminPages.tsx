import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { landingApi } from '../../api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { DataTable, Modal } from '../../components/ui/DataTable';
import { PageHeader } from '../../components/ui/Badge';
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

const emptySectionForm = {
  key: '',
  title: '',
  titleAr: '',
  content: '',
  contentAr: '',
  imageUrl: '',
  sortOrder: 0,
};

export function AdminHeroPage() {
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
    onError: (error) => setSaveError(getApiErrorMessage(error, 'Failed to save hero')),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => landingApi.deleteHero(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['heroes'] }),
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
    <div>
      <div className="flex justify-between mb-6">
        <PageHeader title="Landing Hero" />
        <Button onClick={openCreate}>Add Hero</Button>
      </div>
      <DataTable
        data={heroes}
        columns={[
          { key: 'title', header: 'Title', render: (r) => r.title },
          { key: 'active', header: 'Active', render: (r) => (r.isActive ? 'Yes' : 'No') },
          {
            key: 'image',
            header: 'Image',
            render: (r) =>
              r.imageUrl ? (
                <img
                  src={mediaUrl(r.imageUrl)}
                  className="h-16 w-28 object-cover rounded shadow"
                  alt=""
                />
              ) : (
                '-'
              ),
          },
          {
            key: 'actions',
            header: 'Actions',
            render: (r) => (
              <div className="flex gap-2">
                <Button variant="outline" className="py-1 px-2 text-xs" onClick={() => openEdit(r)}>
                  Edit
                </Button>
                <Button variant="primary" className="py-1 px-2 text-xs" onClick={() => deleteMutation.mutate(r.id)}>
                  Delete
                </Button>
              </div>
            ),
          },
        ]}
      />
      <Modal open={open} onClose={() => setOpen(false)} title={editId ? 'Edit Hero' : 'Create Hero'} wide>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate();
          }}
        >
          <div className="grid md:grid-cols-2 gap-3">
            <Input label="Title (EN)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <Input label="Title (AR)" value={form.titleAr} onChange={(e) => setForm({ ...form, titleAr: e.target.value })} dir="rtl" />
            <Input label="Subtitle (EN)" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
            <Input label="Subtitle (AR)" value={form.subtitleAr} onChange={(e) => setForm({ ...form, subtitleAr: e.target.value })} dir="rtl" />
            <Input label="CTA Text (EN)" value={form.ctaText} onChange={(e) => setForm({ ...form, ctaText: e.target.value })} />
            <Input label="CTA Text (AR)" value={form.ctaTextAr} onChange={(e) => setForm({ ...form, ctaTextAr: e.target.value })} dir="rtl" />
            <Input label="CTA Link" value={form.ctaLink} onChange={(e) => setForm({ ...form, ctaLink: e.target.value })} className="md:col-span-2" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            Active
          </label>
          <Input label="Hero Image" type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />
          {displayImage && (
            <div>
              <p className="text-sm text-neutral-medium mb-2">Preview</p>
              <img src={displayImage} alt="Hero preview" className="w-full max-h-48 object-cover rounded-lg shadow" />
            </div>
          )}
          {saveError && <p className="text-sm text-red-600">{saveError}</p>}
          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}

export function AdminSectionsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptySectionForm);
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
      if (editId && image) {
        const fd = buildFormData(omitKeys(form, ['key']));
        fd.append('image', image);
        return landingApi.updateSection(editId, fd);
      }
      if (editId) return landingApi.updateSection(editId, omitKeys(form, ['key']));
      return landingApi.createSection(form);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sections'] });
      setOpen(false);
      setEditId(null);
      setImage(null);
      setCurrentImageUrl(null);
      setSaveError(null);
    },
    onError: (error) => setSaveError(getApiErrorMessage(error, 'Failed to save section')),
  });

  const openCreate = () => {
    setEditId(null);
    setForm(emptySectionForm);
    setImage(null);
    setCurrentImageUrl(null);
    setSaveError(null);
    setOpen(true);
  };

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
    (form.imageUrl.startsWith('http') ? form.imageUrl : null) ||
    (currentImageUrl ? mediaUrl(currentImageUrl) : null);

  return (
    <div>
      <div className="flex justify-between mb-6">
        <PageHeader title="Landing Sections" />
        <Button onClick={openCreate}>Add Section</Button>
      </div>
      <DataTable
        data={sections}
        columns={[
          { key: 'key', header: 'Key', render: (r) => r.key },
          { key: 'title', header: 'Title', render: (r) => r.title },
          {
            key: 'image',
            header: 'Image',
            render: (r) =>
              r.imageUrl ? (
                <img src={mediaUrl(r.imageUrl)} className="h-10 w-16 object-cover rounded" alt="" />
              ) : (
                '-'
              ),
          },
          { key: 'status', header: 'Status', render: (r) => r.status },
          {
            key: 'actions',
            header: 'Actions',
            render: (r) => (
              <div className="flex gap-2">
                <Button variant="outline" className="py-1 px-2 text-xs" onClick={() => openEdit(r)}>
                  Edit
                </Button>
                <Button
                  variant="secondary"
                  className="py-1 px-2 text-xs"
                  onClick={() =>
                    landingApi
                      .updateSectionStatus(r.id, r.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED')
                      .then(() => qc.invalidateQueries({ queryKey: ['sections'] }))
                  }
                >
                  {r.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                </Button>
                <Button
                  variant="primary"
                  className="py-1 px-2 text-xs"
                  onClick={() => landingApi.deleteSection(r.id).then(() => qc.invalidateQueries({ queryKey: ['sections'] }))}
                >
                  Delete
                </Button>
              </div>
            ),
          },
        ]}
      />
      <Modal open={open} onClose={() => setOpen(false)} title="Section" wide>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate();
          }}
        >
          <Input label="Key" value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} required disabled={!!editId} />
          <div className="grid md:grid-cols-2 gap-3">
            <Input label="Title (EN)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <Input label="Title (AR)" value={form.titleAr} onChange={(e) => setForm({ ...form, titleAr: e.target.value })} dir="rtl" />
            <Input label="Content (EN)" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required />
            <Input label="Content (AR)" value={form.contentAr} onChange={(e) => setForm({ ...form, contentAr: e.target.value })} dir="rtl" />
            <Input
              label="Image URL (optional)"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="md:col-span-2"
            />
            <Input
              label="Sort Order"
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
            />
          </div>
          <Input label="Upload Image" type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />
          {displayImage && (
            <div>
              <p className="text-sm text-neutral-medium mb-2">Preview</p>
              <img src={displayImage} alt="Section preview" className="w-full max-h-40 object-cover rounded-lg shadow" />
            </div>
          )}
          {saveError && <p className="text-sm text-red-600">{saveError}</p>}
          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
