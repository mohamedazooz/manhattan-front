import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aboutApi, pagesApi, cmsApi } from '../../api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { DataTable, Modal } from '../../components/ui/DataTable';
import { PageHeader } from '../../components/ui/Badge';
import { getApiErrorMessage, omitKeys } from '../../lib/formData';

function AboutCrud() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ slug: '', title: '', content: '', sortOrder: 0 });
  const [saveError, setSaveError] = useState<string | null>(null);

  const { data: items = [] } = useQuery({
    queryKey: ['about-admin'],
    queryFn: () => aboutApi.admin().then((r) => r.data),
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      editId ? aboutApi.update(editId, omitKeys(form, ['slug'])) : aboutApi.create(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['about-admin'] });
      setOpen(false);
      setSaveError(null);
    },
    onError: (error) => setSaveError(getApiErrorMessage(error, 'Failed to save section')),
  });

  return (
    <div>
      <div className="flex justify-between mb-6">
        <PageHeader title="About Us Sections" />
        <Button onClick={() => { setEditId(null); setForm({ slug: '', title: '', content: '', sortOrder: 0 }); setOpen(true); }}>Add</Button>
      </div>
      <DataTable
        data={items}
        columns={[
          { key: 'title', header: 'Title', render: (r) => String(r.title) },
          { key: 'status', header: 'Status', render: (r) => String(r.status) },
          {
            key: 'actions',
            header: 'Actions',
            render: (r) => (
              <div className="flex gap-2">
                <Button variant="outline" className="py-1 px-2 text-xs" onClick={() => { setEditId(r.id); setForm({ slug: String(r.slug || ''), title: String(r.title), content: String(r.content), sortOrder: Number(r.sortOrder || 0) }); setSaveError(null); setOpen(true); }}>Edit</Button>
                <Button variant="secondary" className="py-1 px-2 text-xs" onClick={() => aboutApi.updateStatus(r.id, r.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED').then(() => qc.invalidateQueries({ queryKey: ['about-admin'] }))}>Toggle</Button>
                <Button variant="primary" className="py-1 px-2 text-xs" onClick={() => aboutApi.remove(r.id).then(() => qc.invalidateQueries({ queryKey: ['about-admin'] }))}>Delete</Button>
              </div>
            ),
          },
        ]}
      />
      <Modal open={open} onClose={() => setOpen(false)} title="About Section" wide>
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }}>
          <Input label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required disabled={!!editId} />
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Input label="Content (HTML)" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required />
          <Input label="Sort Order" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
          {saveError && <p className="text-sm text-red-600">{saveError}</p>}
          <Button type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? 'Saving...' : 'Save'}</Button>
        </form>
      </Modal>
    </div>
  );
}

function PagesCrud() {
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
    onError: (error) => setSaveError(getApiErrorMessage(error, 'Failed to save page')),
  });

  return (
    <div>
      <div className="flex justify-between mb-6">
        <PageHeader title="Static Pages" />
        <Button onClick={() => { setEditId(null); setForm({ slug: '', title: '', content: '', sortOrder: 0 }); setOpen(true); }}>Add</Button>
      </div>
      <DataTable
        data={items}
        columns={[
          { key: 'title', header: 'Title', render: (r) => String(r.title) },
          { key: 'slug', header: 'Slug', render: (r) => String(r.slug) },
          { key: 'status', header: 'Status', render: (r) => String(r.status) },
          {
            key: 'actions',
            header: 'Actions',
            render: (r) => (
              <div className="flex gap-2">
                <Button variant="outline" className="py-1 px-2 text-xs" onClick={() => { setEditId(r.id); setForm({ slug: String(r.slug), title: String(r.title), content: String(r.content), sortOrder: Number(r.sortOrder || 0) }); setSaveError(null); setOpen(true); }}>Edit</Button>
                <Button variant="secondary" className="py-1 px-2 text-xs" onClick={() => pagesApi.updateStatus(r.id, r.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED').then(() => qc.invalidateQueries({ queryKey: ['pages-admin'] }))}>Toggle</Button>
                <Button variant="primary" className="py-1 px-2 text-xs" onClick={() => pagesApi.remove(r.id).then(() => qc.invalidateQueries({ queryKey: ['pages-admin'] }))}>Delete</Button>
              </div>
            ),
          },
        ]}
      />
      <Modal open={open} onClose={() => setOpen(false)} title="Static Page" wide>
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }}>
          <Input label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required disabled={!!editId} />
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Input label="Content (HTML)" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required />
          <Input label="Sort Order" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
          {saveError && <p className="text-sm text-red-600">{saveError}</p>}
          <Button type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? 'Saving...' : 'Save'}</Button>
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

export function AdminSettingsPage() {
  const qc = useQueryClient();
  const { data: config = {} } = useQuery({
    queryKey: ['cms-config'],
    queryFn: () => cmsApi.getConfig().then((r) => r.data),
  });
  const [values, setValues] = useState<Record<string, string>>({});

  const keys = [
    'contact_address', 'contact_phone', 'contact_email',
    'social_facebook', 'social_instagram', 'social_youtube', 'social_linkedin',
    'school_slogan', 'school_slogan_ar',
  ];

  const save = async (key: string) => {
    await cmsApi.updateConfig(key, values[key] ?? config[key] ?? '');
    qc.invalidateQueries({ queryKey: ['cms-config'] });
  };

  return (
    <div>
      <PageHeader title="Site Settings" />
      <div className="space-y-4 max-w-xl">
        {keys.map((key) => (
          <div key={key} className="flex gap-2 items-end">
            <Input
              label={key}
              value={values[key] ?? config[key] ?? ''}
              onChange={(e) => setValues({ ...values, [key]: e.target.value })}
              className="flex-1"
            />
            <Button onClick={() => save(key)} className="py-2">Save</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
