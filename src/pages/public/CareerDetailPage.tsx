import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { careersApi } from '../../api';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { LoadingSpinner, PageHeader } from '../../components/ui/Badge';
import { useAppLanguage } from '../../i18n';

export function CareerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const lang = useAppLanguage();
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', coverLetter: '' });
  const [resume, setResume] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const { data: job, isLoading } = useQuery({
    queryKey: ['job', id, lang],
    queryFn: () => careersApi.get(id!, lang).then((r) => r.data),
    enabled: !!id,
  });

  const applyMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append('fullName', form.fullName);
      fd.append('email', form.email);
      fd.append('phone', form.phone);
      if (form.coverLetter) fd.append('coverLetter', form.coverLetter);
      if (resume) fd.append('resume', resume);
      return careersApi.apply(id!, fd);
    },
    onSuccess: () => setSubmitted(true),
  });

  if (isLoading) return <LoadingSpinner />;
  if (!job) return <p className="p-12 text-center">Job not found</p>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <PageHeader title={job.title} subtitle={`${job.location} · ${job.employmentType.replace('_', ' ')}`} />
      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <h3 className="font-semibold mb-2">Description</h3>
          <div className="prose-content text-sm text-neutral-medium mb-6" dangerouslySetInnerHTML={{ __html: job.description }} />
          <h3 className="font-semibold mb-2">Requirements</h3>
          <div className="prose-content text-sm text-neutral-medium" dangerouslySetInnerHTML={{ __html: job.requirements }} />
        </div>
        <div className="bg-neutral-light rounded-lg p-6">
          <h3 className="font-semibold mb-4">Apply for this position</h3>
          {submitted ? (
            <p className="text-green-700">Application submitted successfully!</p>
          ) : (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                applyMutation.mutate();
              }}
            >
              <Input label="Full Name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
              <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
              <Textarea label="Cover Letter" value={form.coverLetter} onChange={(e) => setForm({ ...form, coverLetter: e.target.value })} />
              <Input label="Resume (PDF)" type="file" accept=".pdf" onChange={(e) => setResume(e.target.files?.[0] || null)} required />
              <Button type="submit" disabled={applyMutation.isPending}>Submit Application</Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
