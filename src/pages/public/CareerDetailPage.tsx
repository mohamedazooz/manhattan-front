import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { careersApi } from '../../api';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { LoadingSpinner, PageHeader } from '../../components/ui/Badge';
import { useAppLanguage } from '../../i18n';
import { useAuth } from '../../lib/auth';

export function CareerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const lang = useAppLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ fullName: '', email: '', phone: '', coverLetter: '' });
  const [resume, setResume] = useState<File | null>(null);
  const [teachingLicense, setTeachingLicense] = useState<File | null>(null);
  const [degreeCert, setDegreeCert] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        fullName: f.fullName || user.fullName || '',
        email: f.email || user.email || '',
      }));
    }
  }, [user]);

  const { data: job, isLoading } = useQuery({
    queryKey: ['job', id, lang],
    queryFn: () => careersApi.get(id!, lang).then((r) => r.data),
    enabled: !!id,
  });

  const applyMutation = useMutation({
    mutationFn: async () => {
      setErrorMsg('');
      const fd = new FormData();
      fd.append('fullName', form.fullName);
      fd.append('email', form.email);
      fd.append('phone', form.phone);
      if (form.coverLetter) fd.append('coverLetter', form.coverLetter);
      if (resume) fd.append('resume', resume);

      const res = await careersApi.apply(id!, fd);
      const appId = res.data.applicationId;

      if (appId) {
        if (teachingLicense) {
          const docFd = new FormData();
          docFd.append('file', teachingLicense);
          docFd.append('documentType', 'TEACHING_LICENSE');
          await careersApi.uploadDocument(appId, docFd);
        }
        if (degreeCert) {
          const docFd = new FormData();
          docFd.append('file', degreeCert);
          docFd.append('documentType', 'DEGREE_CERTIFICATE');
          await careersApi.uploadDocument(appId, docFd);
        }
      }
      return res;
    },
    onSuccess: () => setSubmitted(true),
    onError: (err: unknown) => {
      setErrorMsg(err instanceof Error ? err.message : 'Application submission failed.');
    },
  });

  if (isLoading) return <LoadingSpinner />;
  if (!job) return <p className="p-12 text-center text-neutral-medium">Job position not found</p>;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <PageHeader title={job.title} subtitle={`${job.location} · ${job.employmentType.replace('_', ' ')}`} />
      <div className="grid md:grid-cols-12 gap-8">
        <div className="md:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
            <h3 className="font-semibold text-lg mb-3 text-neutral-dark">Position Description</h3>
            <div className="prose-content text-sm text-neutral-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: job.description }} />
          </div>
          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
            <h3 className="font-semibold text-lg mb-3 text-neutral-dark">Requirements & Qualifications</h3>
            <div className="prose-content text-sm text-neutral-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: job.requirements }} />
          </div>
        </div>

        <div className="md:col-span-5">
          <div className="bg-white rounded-xl border border-neutral-200 shadow-md p-6 sticky top-24">
            <h3 className="font-semibold text-xl mb-4 text-neutral-dark">Apply for this Position</h3>
            
            {!user ? (
              <div className="text-center py-8 px-4 bg-amber-50 rounded-lg border border-amber-200 space-y-4">
                <p className="text-sm font-medium text-amber-900">
                  Please login or create an account to submit your application and track your status.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => navigate(`/login?redirect=/careers/${id}`)}>
                    Log In
                  </Button>
                  <Button variant="secondary" onClick={() => navigate(`/register?redirect=/careers/${id}`)}>
                    Register
                  </Button>
                </div>
              </div>
            ) : submitted ? (
              <div className="text-center py-8 space-y-4 bg-emerald-50 rounded-lg border border-emerald-200 p-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-xl font-bold">✓</div>
                <h4 className="font-bold text-emerald-900 text-lg">Application Submitted!</h4>
                <p className="text-sm text-emerald-800">
                  Thank you for applying. Your application and credentials have been received.
                </p>
                <Link to="/portal">
                  <Button variant="secondary" className="w-full">
                    View My Portal Dashboard
                  </Button>
                </Link>
              </div>
            ) : (
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  applyMutation.mutate();
                }}
              >
                {errorMsg && (
                  <div className="p-3 text-xs bg-red-50 text-red-700 rounded border border-red-200">
                    {errorMsg}
                  </div>
                )}
                <Input label="Full Name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
                <Input label="Email Address" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                <Input label="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
                <Textarea label="Cover Letter / Introduction" value={form.coverLetter} onChange={(e) => setForm({ ...form, coverLetter: e.target.value })} rows={4} />

                <div className="space-y-3 pt-2 border-t">
                  <h4 className="text-xs font-semibold uppercase text-neutral-dark tracking-wider">Required Documents & Certificates</h4>
                  <Input label="Resume / CV (PDF)" type="file" accept=".pdf,.doc,.docx" onChange={(e) => setResume(e.target.files?.[0] || null)} required />
                  <Input label="Teaching License / Certificate (Optional)" type="file" accept=".pdf,.png,.jpg" onChange={(e) => setTeachingLicense(e.target.files?.[0] || null)} />
                  <Input label="Degree / University Certificate (Optional)" type="file" accept=".pdf,.png,.jpg" onChange={(e) => setDegreeCert(e.target.files?.[0] || null)} />
                </div>

                <Button type="submit" className="w-full mt-4" disabled={applyMutation.isPending}>
                  {applyMutation.isPending ? 'Submitting Application...' : 'Submit Application'}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

