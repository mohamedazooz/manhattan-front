import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { admissionsApi } from '../../api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { PageHeader } from '../../components/ui/Badge';

export function NewAdmissionPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    studentFirstName: '',
    studentLastName: '',
    dateOfBirth: '',
    gradeLevel: 'Grade 1',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
  });

  const mutation = useMutation({
    mutationFn: () => admissionsApi.create(form),
    onSuccess: ({ data }) => navigate(`/portal/admissions/${data.id}`),
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <PageHeader title="New Admission Application" subtitle="Fill in student and parent details" />
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
      >
        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Student First Name" value={form.studentFirstName} onChange={(e) => setForm({ ...form, studentFirstName: e.target.value })} required />
          <Input label="Student Last Name" value={form.studentLastName} onChange={(e) => setForm({ ...form, studentLastName: e.target.value })} required />
        </div>
        <Input label="Date of Birth" type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} required />
        <Input label="Grade Level" value={form.gradeLevel} onChange={(e) => setForm({ ...form, gradeLevel: e.target.value })} required />
        <Input label="Parent Name" value={form.parentName} onChange={(e) => setForm({ ...form, parentName: e.target.value })} required />
        <Input label="Parent Email" type="email" value={form.parentEmail} onChange={(e) => setForm({ ...form, parentEmail: e.target.value })} required />
        <Input label="Parent Phone" value={form.parentPhone} onChange={(e) => setForm({ ...form, parentPhone: e.target.value })} required />
        <Button type="submit" disabled={mutation.isPending}>Create Application</Button>
      </form>
    </div>
  );
}
