import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { educationApi, galleryApi, blogApi, careersApi, contactApi, admissionsApi, requirementsApi, usersApi, rolesApi, emailApi } from '../../api';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { DataTable, Modal } from '../../components/ui/DataTable';
import { StatusBadge, PageHeader } from '../../components/ui/Badge';
import { mediaUrl } from '../../lib/utils';
import { getApiErrorMessage, omitKeys } from '../../lib/formData';

export function AdminEducationPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', slug: '', summary: '', content: '', level: 'ELEMENTARY', sortOrder: 0 });
  const [saveError, setSaveError] = useState<string | null>(null);

  const { data: programs = [] } = useQuery({ queryKey: ['education-admin'], queryFn: () => educationApi.admin().then((r) => r.data) });

  const save = useMutation({
    mutationFn: () =>
      editId ? educationApi.update(editId, omitKeys(form, ['slug'])) : educationApi.create(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['education-admin'] }); setOpen(false); setSaveError(null); },
    onError: (error) => setSaveError(getApiErrorMessage(error, 'Failed to save program')),
  });

  return (
    <div>
      <div className="flex justify-between mb-6"><PageHeader title="Education Programs" /><Button onClick={() => setOpen(true)}>Add Program</Button></div>
      <DataTable data={programs} columns={[
        { key: 'title', header: 'Title', render: (r) => r.title },
        { key: 'level', header: 'Level', render: (r) => r.level },
        { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
        { key: 'actions', header: 'Actions', render: (r) => (
          <div className="flex gap-2">
            <Button variant="outline" className="py-1 px-2 text-xs" onClick={() => { setEditId(r.id); setForm({ title: r.title, slug: r.slug, summary: r.summary || '', content: r.content, level: r.level, sortOrder: r.sortOrder }); setSaveError(null); setOpen(true); }}>Edit</Button>
            <Button variant="secondary" className="py-1 px-2 text-xs" onClick={() => educationApi.updateStatus(r.id, r.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED').then(() => qc.invalidateQueries({ queryKey: ['education-admin'] }))}>Toggle</Button>
          </div>
        )},
      ]} />
      <Modal open={open} onClose={() => setOpen(false)} title="Program" wide>
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Input label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
          <Input label="Summary" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
          <Textarea label="Content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required />
          <Select label="Level" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
            {['KINDERGARTEN', 'ELEMENTARY', 'MIDDLE', 'HIGH'].map((l) => <option key={l} value={l}>{l}</option>)}
          </Select>
          {saveError && <p className="text-sm text-red-600">{saveError}</p>}
          <Button type="submit" disabled={save.isPending}>{save.isPending ? 'Saving...' : 'Save'}</Button>
        </form>
      </Modal>
    </div>
  );
}

export function AdminGalleryPage() {
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
    <div>
      <PageHeader title="Gallery" />
      <form className="grid md:grid-cols-4 gap-3 mb-6 bg-neutral-light p-4 rounded" onSubmit={(e) => { e.preventDefault(); upload.mutate(); }}>
        <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <Input label="Caption" value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} />
        <Input label="Image" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} required />
        <div className="flex items-end"><Button type="submit">Upload</Button></div>
      </form>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((img: { id: string; title: string; imageUrl: string; status: string }) => (
          <div key={img.id} className="relative group">
            <img src={mediaUrl(img.imageUrl)} alt={img.title} className="w-full h-32 object-cover rounded" />
            <div className="text-sm mt-1">{img.title}</div>
            <Button variant="secondary" className="py-1 px-2 text-xs mt-1" onClick={() => galleryApi.updateStatus(img.id, img.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED').then(() => qc.invalidateQueries({ queryKey: ['gallery-admin'] }))}>
              {img.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminBlogPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', content: '', categoryId: '' });
  const { data: posts = [] } = useQuery({ queryKey: ['posts-admin'], queryFn: () => blogApi.admin().then((r) => r.data) });
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: () => blogApi.categories('en').then((r) => r.data) });

  const save = useMutation({
    mutationFn: () => editId ? blogApi.update(editId, form) : blogApi.create(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['posts-admin'] }); setOpen(false); },
  });

  return (
    <div>
      <div className="flex justify-between mb-6"><PageHeader title="Blog Posts" /><Button onClick={() => { setEditId(null); setOpen(true); }}>New Post</Button></div>
      <DataTable data={posts} columns={[
        { key: 'title', header: 'Title', render: (r) => r.title },
        { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
        { key: 'actions', header: 'Actions', render: (r) => (
          <div className="flex gap-2">
            <Button variant="outline" className="py-1 px-2 text-xs" onClick={() => { setEditId(r.id); setForm({ title: r.title, content: r.content, categoryId: r.category?.id || '' }); setOpen(true); }}>Edit</Button>
            <Button variant="secondary" className="py-1 px-2 text-xs" onClick={() => blogApi.updateStatus(r.id, r.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED').then(() => qc.invalidateQueries({ queryKey: ['posts-admin'] }))}>Toggle</Button>
          </div>
        )},
      ]} />
      <Modal open={open} onClose={() => setOpen(false)} title="Blog Post" wide>
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Select label="Category" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required>
            <option value="">Select...</option>
            {categories.map((c: { id: string; name: string }) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Textarea label="Content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required />
          <Button type="submit">Save</Button>
        </form>
      </Modal>
    </div>
  );
}

export function AdminCommentsPage() {
  const qc = useQueryClient();
  const { data: comments = [] } = useQuery({ queryKey: ['comments-admin'], queryFn: () => blogApi.comments().then((r) => r.data) });
  return (
    <div>
      <PageHeader title="Comment Moderation" />
      <DataTable data={comments} columns={[
        { key: 'content', header: 'Comment', render: (r: { content: string }) => r.content.slice(0, 80) },
        { key: 'author', header: 'Author', render: (r: { author: { fullName: string } }) => r.author.fullName },
        { key: 'status', header: 'Status', render: (r: { status: string }) => <StatusBadge status={r.status} /> },
        { key: 'actions', header: 'Actions', render: (r: { id: string }) => (
          <div className="flex gap-2">
            <Button variant="secondary" className="py-1 px-2 text-xs" onClick={() => blogApi.moderateComment(r.id, 'APPROVED').then(() => qc.invalidateQueries({ queryKey: ['comments-admin'] }))}>Approve</Button>
            <Button variant="primary" className="py-1 px-2 text-xs" onClick={() => blogApi.moderateComment(r.id, 'SPAM').then(() => qc.invalidateQueries({ queryKey: ['comments-admin'] }))}>Spam</Button>
          </div>
        )},
      ]} />
    </div>
  );
}

export function AdminAdmissionsPage() {
  const [status, setStatus] = useState('');
  const { data: admissions = [] } = useQuery({
    queryKey: ['admissions-admin', status],
    queryFn: () => admissionsApi.list(status || undefined).then((r) => r.data),
  });
  return (
    <div>
      <PageHeader title="Admissions" />
      <Select value={status} onChange={(e) => setStatus(e.target.value)} className="mb-4 max-w-xs">
        <option value="">All statuses</option>
        {['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED'].map((s) => <option key={s} value={s}>{s}</option>)}
      </Select>
      <DataTable data={admissions} columns={[
        { key: 'student', header: 'Student', render: (r) => `${r.studentFirstName} ${r.studentLastName}` },
        { key: 'grade', header: 'Grade', render: (r) => r.gradeLevel },
        { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
        { key: 'actions', header: 'Actions', render: (r) => <Link to={`/admin/admissions/${r.id}`} className="text-primary text-sm">View</Link> },
      ]} />
    </div>
  );
}

export function AdminAdmissionDetailPage({ id }: { id: string }) {
  const qc = useQueryClient();
  const [note, setNote] = useState('');
  const { data: admissions = [] } = useQuery({ queryKey: ['admissions-admin'], queryFn: () => admissionsApi.list().then((r) => r.data) });
  const admission = admissions.find((a) => a.id === id);
  if (!admission) return <p>Not found</p>;
  return (
    <div>
      <PageHeader title={`${admission.studentFirstName} ${admission.studentLastName}`} />
      <StatusBadge status={admission.status} />
      <div className="mt-4 space-y-2">
        <Select value={admission.status} onChange={(e) => admissionsApi.updateStatus(id, e.target.value).then(() => qc.invalidateQueries({ queryKey: ['admissions-admin'] }))}>
          {['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED'].map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
        <Textarea value={note} onChange={(e) => setNote(e.target.value)} label="Internal Note" />
        <Button onClick={() => admissionsApi.addNote(id, note).then(() => { setNote(''); qc.invalidateQueries({ queryKey: ['admissions-admin'] }); })}>Add Note</Button>
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

export function AdminCareersPage() {
  const qc = useQueryClient();
  const { data: jobs = [] } = useQuery({ queryKey: ['jobs-admin'], queryFn: () => careersApi.admin().then((r) => r.data) });
  const [form, setForm] = useState({ title: '', description: '', requirements: '', location: '', employmentType: 'FULL_TIME' });
  return (
    <div>
      <PageHeader title="Careers" />
      <form className="space-y-3 mb-6 max-w-xl" onSubmit={(e) => { e.preventDefault(); careersApi.create(form).then(() => qc.invalidateQueries({ queryKey: ['jobs-admin'] })); }}>
        <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        <Textarea label="Requirements" value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} required />
        <Input label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
        <Button type="submit">Create Job</Button>
      </form>
      <DataTable data={jobs} columns={[
        { key: 'title', header: 'Title', render: (r: { title: string }) => r.title },
        { key: 'status', header: 'Status', render: (r: { status: string }) => <StatusBadge status={r.status} /> },
        { key: 'actions', header: 'Actions', render: (r: { id: string; status: string }) => (
          <div className="flex gap-2">
            <Link to={`/admin/careers/${r.id}/applications`} className="text-primary text-sm">Applications</Link>
            <Button variant="secondary" className="py-1 px-2 text-xs" onClick={() => careersApi.updateStatus(r.id, r.status === 'OPEN' ? 'CLOSED' : 'OPEN').then(() => qc.invalidateQueries({ queryKey: ['jobs-admin'] }))}>Toggle</Button>
          </div>
        )},
      ]} />
    </div>
  );
}

export function AdminJobApplicationsPage({ jobId }: { jobId: string }) {
  const { data: apps = [] } = useQuery({ queryKey: ['job-apps', jobId], queryFn: () => careersApi.applications(jobId).then((r) => r.data) });
  return (
    <div>
      <PageHeader title="Job Applications" />
      <DataTable data={apps} columns={[
        { key: 'name', header: 'Name', render: (r: { fullName: string }) => r.fullName },
        { key: 'email', header: 'Email', render: (r: { email: string }) => r.email },
        { key: 'status', header: 'Status', render: (r: { status: string }) => <StatusBadge status={r.status} /> },
      ]} />
    </div>
  );
}

export function AdminInquiriesPage() {
  const qc = useQueryClient();
  const { data: inquiries = [] } = useQuery({ queryKey: ['inquiries'], queryFn: () => contactApi.admin().then((r) => r.data) });
  return (
    <div>
      <PageHeader title="Contact Inquiries" />
      <DataTable data={inquiries} columns={[
        { key: 'name', header: 'Name', render: (r: { fullName: string }) => r.fullName },
        { key: 'subject', header: 'Subject', render: (r: { subject: string }) => r.subject },
        { key: 'status', header: 'Status', render: (r: { status: string }) => <StatusBadge status={r.status} /> },
        { key: 'actions', header: 'Actions', render: (r: { id: string }) => (
          <Button variant="secondary" className="py-1 px-2 text-xs" onClick={() => contactApi.updateStatus(r.id, 'READ').then(() => qc.invalidateQueries({ queryKey: ['inquiries'] }))}>Mark Read</Button>
        )},
      ]} />
    </div>
  );
}

export function AdminUsersPage() {
  const qc = useQueryClient();
  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: () => usersApi.list().then((r) => r.data) });
  return (
    <div>
      <PageHeader title="Users" />
      <DataTable data={users} columns={[
        { key: 'name', header: 'Name', render: (r: { fullName: string }) => r.fullName },
        { key: 'email', header: 'Email', render: (r: { email: string }) => r.email },
        { key: 'role', header: 'Role', render: (r: { role: { name: string } }) => r.role.name },
        { key: 'status', header: 'Status', render: (r: { status: string }) => <StatusBadge status={r.status} /> },
        { key: 'actions', header: 'Actions', render: (r: { id: string; status: string }) => (
          <Button variant="secondary" className="py-1 px-2 text-xs" onClick={() => usersApi.updateStatus(r.id, r.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE').then(() => qc.invalidateQueries({ queryKey: ['users'] }))}>Toggle Status</Button>
        )},
      ]} />
    </div>
  );
}

export function AdminRolesPage() {
  const { data: roles = [] } = useQuery({ queryKey: ['roles'], queryFn: () => rolesApi.list().then((r) => r.data) });
  return (
    <div>
      <PageHeader title="Roles & Permissions" />
      <div className="space-y-4">
        {roles.map((role: { id: string; name: string; description?: string; rolePermissions: Array<{ permission: { name: string } }> }) => (
          <div key={role.id} className="rounded border bg-white p-4">
            <h3 className="font-semibold">{role.name}</h3>
            <p className="text-sm text-neutral-medium mb-2">{role.description}</p>
            <div className="flex flex-wrap gap-1">
              {role.rolePermissions.map((rp) => (
                <span key={rp.permission.name} className="text-xs bg-primary-light text-primary px-2 py-0.5 rounded">{rp.permission.name}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
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
