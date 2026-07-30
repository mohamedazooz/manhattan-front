import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { careersApi, jobRequirementsApi } from '../../../api';
import { Button } from '../../../components/ui/Button';
import { StepIndicator } from '../../../components/ui/StepIndicator';
import { useAuth } from '../../../lib/auth';

export function ApplicationWizard() {
  const { jobId } = useParams<{ jobId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: '',
    coverLetter: '',
    yearsExperience: 0,
    curriculumExperience: '',
    subjectsTaught: '',
    highestQualification: '',
    teachingLicenseNo: '',
    availableStartDate: '',
    safeguardingAccepted: false,
  });

  const { data: job } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => careersApi.get(jobId!, 'en').then((r) => r.data),
    enabled: !!jobId,
  });

  const { data: requirement } = useQuery({
    queryKey: ['job-requirement', job?.employmentType],
    queryFn: () => jobRequirementsApi.byType(job?.employmentType).then((r) => r.data),
    enabled: !!job?.employmentType,
  });

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        fullName: f.fullName || user.fullName,
        email: f.email || user.email,
      }));
    }
  }, [user]);

  const createMutation = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') fd.append(k, String(v));
      });
      fd.append('currentStep', String(step));
      return careersApi.apply(jobId!, fd);
    },
    onSuccess: ({ data }) => {
      setApplicationId(data.applicationId);
      if (step >= 4) {
        navigate(`/portal/applicant/applications/${data.applicationId}`);
      } else {
        setStep(step + 1);
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => careersApi.updateApplication(applicationId!, { ...form, currentStep: step }),
    onSuccess: () => {
      if (step >= 4) {
        careersApi.submitApplication(applicationId!).then(() => {
          navigate(`/portal/applicant/applications/${applicationId}`);
        });
      } else {
        setStep(step + 1);
      }
    },
  });

  const steps = [
    t('application.steps.personal'),
    t('application.steps.qualifications'),
    t('application.steps.documents'),
    t('application.steps.declarations'),
  ];

  function next() {
    if (!applicationId) {
      createMutation.mutate();
    } else {
      updateMutation.mutate();
    }
  }

  function back() {
    if (step > 1) setStep(step - 1);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div>
        <p className="text-sage text-sm uppercase tracking-wide">{job?.title}</p>
        <h2 className="text-2xl font-bold text-primary-dark">{t('application.applyTitle')}</h2>
      </div>

      <StepIndicator steps={steps} currentStep={step} />

      <div className="glass-card rounded-2xl p-6 space-y-4">
        {step === 1 && (
          <>
            <label className="block text-sm">
              <span className="font-medium">{t('application.fullName')}</span>
              <input className="mt-1 w-full border rounded-lg px-3 py-2" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
            </label>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block text-sm">
                <span className="font-medium">{t('application.email')}</span>
                <input type="email" className="mt-1 w-full border rounded-lg px-3 py-2" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </label>
              <label className="block text-sm">
                <span className="font-medium">{t('application.phone')}</span>
                <input className="mt-1 w-full border rounded-lg px-3 py-2" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
              </label>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <label className="block text-sm">
              <span className="font-medium">{t('application.yearsExperience')}</span>
              <input type="number" min={0} className="mt-1 w-full border rounded-lg px-3 py-2" value={form.yearsExperience} onChange={(e) => setForm({ ...form, yearsExperience: Number(e.target.value) })} />
            </label>
            <label className="block text-sm">
              <span className="font-medium">{t('application.curriculum')}</span>
              <select className="mt-1 w-full border rounded-lg px-3 py-2" value={form.curriculumExperience} onChange={(e) => setForm({ ...form, curriculumExperience: e.target.value })}>
                <option value="">—</option>
                <option value="IB">IB</option>
                <option value="British">British</option>
                <option value="American">American</option>
                <option value="Egyptian National">Egyptian National</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="font-medium">{t('application.subjects')}</span>
              <input className="mt-1 w-full border rounded-lg px-3 py-2" value={form.subjectsTaught} onChange={(e) => setForm({ ...form, subjectsTaught: e.target.value })} />
            </label>
            <label className="block text-sm">
              <span className="font-medium">{t('application.qualification')}</span>
              <input className="mt-1 w-full border rounded-lg px-3 py-2" value={form.highestQualification} onChange={(e) => setForm({ ...form, highestQualification: e.target.value })} />
            </label>
            <label className="block text-sm">
              <span className="font-medium">{t('application.licenseNo')}</span>
              <input className="mt-1 w-full border rounded-lg px-3 py-2" value={form.teachingLicenseNo} onChange={(e) => setForm({ ...form, teachingLicenseNo: e.target.value })} />
            </label>
          </>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <p className="text-sm text-neutral-medium">{t('application.documentsHint')}</p>
            {requirement?.requiredDocumentTypes?.map((type: string) => (
              <div key={type} className="text-sm border rounded-lg p-3 bg-ivory">
                {type.replace(/_/g, ' ')}
              </div>
            ))}
            <label className="block text-sm">
              <span className="font-medium">{t('application.coverLetter')}</span>
              <textarea className="mt-1 w-full border rounded-lg px-3 py-2" rows={4} value={form.coverLetter} onChange={(e) => setForm({ ...form, coverLetter: e.target.value })} />
            </label>
            <p className="text-xs text-neutral-medium">{t('application.uploadAfterCreate')}</p>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 text-sm">
            <p><strong>{t('application.fullName')}:</strong> {form.fullName}</p>
            <p><strong>{t('application.curriculum')}:</strong> {form.curriculumExperience}</p>
            <label className="flex items-start gap-2">
              <input type="checkbox" checked={form.safeguardingAccepted} onChange={(e) => setForm({ ...form, safeguardingAccepted: e.target.checked })} />
              <span>{t('application.safeguarding')}</span>
            </label>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={back} disabled={step === 1}>{t('common.back')}</Button>
        <Button
          variant="gold"
          onClick={next}
          disabled={createMutation.isPending || updateMutation.isPending || (step === 4 && !form.safeguardingAccepted)}
        >
          {step === 4 ? t('application.submit') : t('common.next')}
        </Button>
      </div>
    </div>
  );
}
