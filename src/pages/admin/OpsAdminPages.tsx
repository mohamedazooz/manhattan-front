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
  const qc = useQueryClient();
  const { data: apps = [] } = useQuery({
    queryKey: ['job-apps', jobId],
    queryFn: () => (jobId === 'all' ? careersApi.allApplications() : careersApi.applications(jobId)).then((r) => r.data),
  });

  const statuses = ['SUBMITTED', 'REVIEWING', 'SHORTLISTED', 'ACCEPTED', 'REJECTED'];

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
  const { data: roles = [] } = useQuery({ queryKey: ['roles'], queryFn: () => rolesApi.list().then((r) => r.data) });

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', password: '', roleId: '' });
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.password || !form.roleId) return;
    setLoading(true);
    try {
      await usersApi.create(form);
      setForm({ fullName: '', email: '', password: '', roleId: '' });
      setShowCreate(false);
      qc.invalidateQueries({ queryKey: ['users'] });
    } catch (err: unknown) {
      alert('Error creating user: ' + (err instanceof Error ? err.message : 'Failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Users Management" />
      <div className="mb-4">
        <Button onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? 'Cancel' : '+ Create New User'}
        </Button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="p-4 bg-white border rounded shadow-sm mb-6 max-w-xl space-y-4">
          <h3 className="font-semibold text-lg text-neutral-dark">Add New User</h3>
          <Input label="Full Name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <div>
            <label className="block text-sm font-medium mb-1 text-neutral-dark">Role</label>
            <select
              className="w-full border rounded p-2 text-sm bg-white"
              value={form.roleId}
              onChange={(e) => setForm({ ...form, roleId: e.target.value })}
              required
            >
              <option value="">Select Role</option>
              {roles.map((r: { id: string; name: string }) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create User'}</Button>
        </form>
      )}

      <DataTable data={users} columns={[
        { key: 'name', header: 'Name', render: (r: { fullName: string }) => r.fullName },
        { key: 'email', header: 'Email', render: (r: { email: string }) => r.email },
        { key: 'role', header: 'Role', render: (r: { id: string; role: { id: string; name: string } }) => (
          <select
            className="border rounded p-1 text-xs bg-white"
            value={r.role.id}
            onChange={(e) => usersApi.updateRole(r.id, e.target.value).then(() => qc.invalidateQueries({ queryKey: ['users'] }))}
          >
            {roles.map((ro: { id: string; name: string }) => (
              <option key={ro.id} value={ro.id}>{ro.name}</option>
            ))}
          </select>
        )},
        { key: 'status', header: 'Status', render: (r: { status: string }) => <StatusBadge status={r.status} /> },
        { key: 'actions', header: 'Actions', render: (r: { id: string; status: string }) => (
          <div className="flex gap-2">
            <Button variant="secondary" className="py-1 px-2 text-xs" onClick={() => usersApi.updateStatus(r.id, r.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE').then(() => qc.invalidateQueries({ queryKey: ['users'] }))}>
              {r.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
            </Button>
            <Button variant="secondary" className="py-1 px-2 text-xs text-red-600 border-red-200 hover:bg-red-50" onClick={() => {
              if (confirm('Delete this user?')) {
                usersApi.delete(r.id).then(() => qc.invalidateQueries({ queryKey: ['users'] }));
              }
            }}>
              Delete
            </Button>
          </div>
        )},
      ]} />
    </div>
  );
}

export function AdminRolesPage() {
  const qc = useQueryClient();
  const { data: roles = [] } = useQuery({ queryKey: ['roles'], queryFn: () => rolesApi.list().then((r) => r.data) });
  const { data: permissions = [] } = useQuery({ queryKey: ['all-permissions'], queryFn: () => rolesApi.permissions().then((r) => r.data) });

  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);

  const startEdit = (role: { id: string; rolePermissions: Array<{ permission: { name: string } }> }) => {
    setEditingRoleId(role.id);
    setSelectedPerms(role.rolePermissions.map((rp) => rp.permission.name));
  };

  const togglePerm = (permName: string) => {
    setSelectedPerms((prev) =>
      prev.includes(permName) ? prev.filter((p) => p !== permName) : [...prev, permName]
    );
  };

  const handleSavePerms = async (roleId: string) => {
    await rolesApi.updatePermissions(roleId, selectedPerms);
    setEditingRoleId(null);
    qc.invalidateQueries({ queryKey: ['roles'] });
  };

  return (
    <div>
      <PageHeader title="Roles & Permissions" />
      <div className="space-y-4">
        {roles.map((role: { id: string; name: string; description?: string; rolePermissions: Array<{ permission: { name: string } }> }) => {
          const isEditing = editingRoleId === role.id;
          return (
            <div key={role.id} className="rounded border bg-white p-5 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="font-semibold text-lg text-neutral-dark">{role.name}</h3>
                  <p className="text-sm text-neutral-medium">{role.description}</p>
                </div>
                {!isEditing ? (
                  <Button variant="secondary" className="text-xs" onClick={() => startEdit(role)}>Edit Permissions</Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="secondary" className="text-xs" onClick={() => setEditingRoleId(null)}>Cancel</Button>
                    <Button className="text-xs" onClick={() => handleSavePerms(role.id)}>Save Permissions</Button>
                  </div>
                )}
              </div>

              {!isEditing ? (
                <div className="flex flex-wrap gap-1 mt-3">
                  {role.rolePermissions.map((rp) => (
                    <span key={rp.permission.name} className="text-xs bg-primary-light text-primary px-2 py-0.5 rounded font-mono">
                      {rp.permission.name}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 p-3 bg-neutral-50 rounded border">
                  {permissions.map((p: { id: string; name: string; description?: string }) => {
                    const checked = selectedPerms.includes(p.name);
                    return (
                      <label key={p.name} className="flex items-center gap-2 text-xs cursor-pointer p-1 rounded hover:bg-white">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => togglePerm(p.name)}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span>
                          <strong className="block text-neutral-dark">{p.name}</strong>
                          <span className="text-neutral-medium text-[10px]">{p.description}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
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
