import { useState, useEffect, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { careersApi } from '../../../api';
import { Button } from '../../../components/ui/Button';
import { StepIndicator } from '../../../components/ui/StepIndicator';
import { Upload, FileText, Paperclip } from 'lucide-react';
import { HiringDocumentsSection } from '../../../components/careers/HiringDocumentsSection';
import { useAuth } from '../../../lib/auth';
import { getPortalHomeForRole } from '../../../components/auth/RoleRoute';

import { HIRING_DOCUMENTS, getMandatoryHiringDocumentCodes, isDocumentUploaded } from '../../../constants/hiringDocuments';
import { useAppLanguage } from '../../../i18n';

const CV_DOCUMENT_TYPE = 'CV_RESUME';

function ReviewSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 p-4">
      <h4 className="font-bold text-primary-dark dark:text-amber-400 mb-3 text-base">{title}</h4>
      <div className="space-y-0">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 py-2.5 border-b border-slate-200/80 dark:border-slate-700/80 last:border-0">
      <span className="font-medium text-slate-600 dark:text-slate-400 shrink-0">{label}</span>
      <span className="text-slate-900 dark:text-slate-100 sm:text-end break-words">{value}</span>
    </div>
  );
}

function formatGender(value: string, isAr: boolean) {
  if (value === 'male') return isAr ? 'ذكر' : 'Male';
  if (value === 'female') return isAr ? 'أنثى' : 'Female';
  return value;
}

function formatCurriculum(value: string, isAr: boolean) {
  const options: Record<string, { ar: string; en: string }> = {
    IB: { ar: 'البكالوريا الدولية (IB)', en: 'IB' },
    British: { ar: 'المنهج البريطاني', en: 'British' },
    American: { ar: 'المنهج الأمريكي', en: 'American' },
    'Egyptian National': { ar: 'المنهج القومي المصري', en: 'Egyptian National' },
  };
  const opt = options[value];
  if (opt) return isAr ? opt.ar : opt.en;
  return value;
}

function getDocumentLabel(code: string, isAr: boolean) {
  if (code === CV_DOCUMENT_TYPE) return isAr ? 'السيرة الذاتية (CV)' : 'CV / Resume';
  const doc = HIRING_DOCUMENTS.find((d) => d.code === code);
  if (doc) return isAr ? doc.titleAr : doc.titleEn;
  return code.replace(/_/g, ' ');
}

export function ApplicationWizard() {
  const { jobId } = useParams<{ jobId: string }>();
  const { t } = useTranslation();
  const lang = useAppLanguage();
  const isAr = lang === 'ar';
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [step, setStep] = useState(1);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: '',
    nationalId: '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    streetAddress: '',
    city: '',
    governorate: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    coverLetter: '',
    yearsExperience: 0,
    curriculumExperience: '',
    subjectsTaught: '',
    highestQualification: '',
    university: '',
    graduationYear: '',
    major: '',
    teachingLicenseNo: '',
    availableStartDate: '',
    noticePeriod: '',
    expectedSalary: '',
    safeguardingAccepted: false,
    pledgeOriginalsAtInterview: true,
  });

  const { data: job } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => careersApi.get(jobId!, 'en').then((r) => r.data),
    enabled: !!jobId,
  });

  const { data: myApps } = useQuery({
    queryKey: ['myApplications'],
    queryFn: () => careersApi.myApplications().then((r) => r.data),
    enabled: !!user,
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

  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  useEffect(() => {
    if (myApps && jobId && !applicationId) {
      const submitted = myApps.find((a: any) => (a.jobId === jobId || a.job?.id === jobId) && a.status !== 'DRAFT');
      if (submitted) {
        setAlreadySubmitted(true);
        return;
      }

      const draft = myApps.find((a: any) => (a.jobId === jobId || a.job?.id === jobId) && a.status === 'DRAFT');
      if (draft) {
        setApplicationId(draft.id);
        if (draft.documents?.length) {
          setUploadedDocTypes(new Set(draft.documents.map((d: { documentType: string }) => d.documentType)));
        }
        if (draft.currentStep && draft.currentStep > 1) {
          setStep(draft.currentStep);
        }
        setForm((prev) => ({
          ...prev,
          fullName: draft.fullName || prev.fullName,
          email: draft.email || prev.email,
          phone: draft.phone || prev.phone,
          nationalId: draft.nationalId || prev.nationalId,
          dateOfBirth: draft.dateOfBirth ? String(draft.dateOfBirth).split('T')[0] : prev.dateOfBirth,
          gender: draft.gender || prev.gender,
          nationality: draft.nationality || prev.nationality,
          streetAddress: draft.streetAddress || prev.streetAddress,
          city: draft.city || prev.city,
          governorate: draft.governorate || prev.governorate,
          emergencyContactName: draft.emergencyContactName || prev.emergencyContactName,
          emergencyContactPhone: draft.emergencyContactPhone || prev.emergencyContactPhone,
          coverLetter: draft.coverLetter || prev.coverLetter,
          yearsExperience: draft.yearsExperience ?? prev.yearsExperience,
          curriculumExperience: draft.curriculumExperience || prev.curriculumExperience,
          subjectsTaught: draft.subjectsTaught || prev.subjectsTaught,
          highestQualification: draft.highestQualification || prev.highestQualification,
          university: draft.university || prev.university,
          graduationYear: draft.graduationYear || prev.graduationYear,
          major: draft.major || prev.major,
          teachingLicenseNo: draft.teachingLicenseNo || prev.teachingLicenseNo,
          availableStartDate: draft.availableStartDate ? String(draft.availableStartDate).split('T')[0] : prev.availableStartDate,
          noticePeriod: draft.noticePeriod || prev.noticePeriod,
          expectedSalary: draft.expectedSalary || prev.expectedSalary,
          safeguardingAccepted: draft.safeguardingAccepted ?? prev.safeguardingAccepted,
          pledgeOriginalsAtInterview: draft.pledgeOriginalsAtInterview ?? prev.pledgeOriginalsAtInterview,
        }));
      }
    }
  }, [myApps, jobId, applicationId]);

  const [documentFiles, setDocumentFiles] = useState<Record<string, File | null>>({});
  const [uploadedDocTypes, setUploadedDocTypes] = useState<Set<string>>(new Set());

  async function uploadPendingDocs(appId: string) {
    const errors: string[] = [];
    for (const [docCode, file] of Object.entries(documentFiles)) {
      if (!file) continue;
      try {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('documentType', docCode);
        await careersApi.uploadDocument(appId, fd);
        setUploadedDocTypes((prev) => new Set(prev).add(docCode));
        setDocumentFiles((prev) => ({ ...prev, [docCode]: null }));
      } catch (err: unknown) {
        const msg = (err as { response?: { data?: { message?: unknown } } })?.response?.data?.message;
        errors.push(formatErrorMessage(msg));
      }
    }
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
  }

  function hasCvResume() {
    return isDocumentUploaded(CV_DOCUMENT_TYPE, documentFiles, uploadedDocTypes);
  }

  function getMissingMandatoryHiringDocs() {
    return getMandatoryHiringDocumentCodes().filter(
      (code) => !isDocumentUploaded(code, documentFiles, uploadedDocTypes),
    );
  }

  function getDocumentValidationMessage() {
    if (!hasCvResume()) {
      return 'يرجى إرفاق السيرة الذاتية قبل المتابعة.';
    }
    if (!form.pledgeOriginalsAtInterview) {
      const missing = getMissingMandatoryHiringDocs();
      if (missing.length > 0) {
        const labels = missing.map((code) => getDocumentLabel(code, true)).join('، ');
        return `يرجى إرفاق المستندات الإلزامية التالية قبل المتابعة: ${labels}. أو فعّل خيار التعهد بإحضار الأصول في المقابلة.`;
      }
    }
    return null;
  }

  async function submitAndNavigate(appId: string) {
    try {
      await careersApi.submitApplication(appId);
      navigate(getPortalHomeForRole(role));
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: unknown } } })?.response?.data?.message;
      setErrorMessage(formatErrorMessage(msg));
    }
  }

  function formatErrorMessage(msg: any): string {
    if (Array.isArray(msg)) return msg.map(formatErrorMessage).join(', ');
    if (typeof msg === 'string') {
      if (
        msg.includes('Cannot update submitted application') ||
        msg.includes('Application already submitted')
      ) {
        return 'تم تقديم هذا الطلب بالفعل ولا يمكن تعديله حالياً. الطلب قيد المراجعة لدى فريق التوظيف.';
      }
      if (msg.includes('Missing required documents')) {
        const match = msg.match(/Missing required documents:\s*(.+)/i);
        if (match?.[1]) {
          const labels = match[1]
            .split(',')
            .map((code) => getDocumentLabel(code.trim(), true))
            .join('، ');
          return `يرجى إرفاق المستندات التالية قبل الإرسال النهائي: ${labels}.`;
        }
        return 'يرجى إرفاق المستندات المطلوبة قبل الإرسال النهائي.';
      }
      if (msg.includes('Safeguarding declaration must be accepted')) {
        return 'يرجى الموافقة على تعهد الإقرارات قبل الإرسال.';
      }
      if (msg.includes('availableStartDate must be a valid ISO')) {
        return 'يرجى إدخال تاريخ تفرغ صحيح.';
      }
      return msg;
    }
    return 'حدث خطأ أثناء حفظ البيانات. يرجى المحاولة مرة أخرى.';
  }

  const createMutation = useMutation({
    mutationFn: async () => {
      setErrorMessage(null);
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') fd.append(k, String(v));
      });
      fd.append('currentStep', String(step));
      const res = await careersApi.apply(jobId!, fd);
      const newId = res.data.applicationId;
      await uploadPendingDocs(newId);
      return res;
    },
    onSuccess: ({ data }) => {
      setErrorMessage(null);
      setApplicationId(data.applicationId);
      if (step >= 4) {
        void submitAndNavigate(data.applicationId);
      } else {
        setStep(step + 1);
      }
    },
    onError: (err: unknown) => {
      const apiMsg = (err as { response?: { data?: { message?: unknown } } })?.response?.data?.message;
      const msg = apiMsg ?? (err instanceof Error ? err.message : undefined);
      setErrorMessage(formatErrorMessage(msg));
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      setErrorMessage(null);
      const payload: Record<string, any> = { currentStep: step };
      Object.entries(form).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          payload[k] = v;
        }
      });
      await careersApi.updateApplication(applicationId!, payload);
      await uploadPendingDocs(applicationId!);
    },
    onSuccess: () => {
      setErrorMessage(null);
      if (step >= 4) {
        void submitAndNavigate(applicationId!);
      } else {
        setStep(step + 1);
      }
    },
    onError: (err: unknown) => {
      const apiMsg = (err as { response?: { data?: { message?: unknown } } })?.response?.data?.message;
      const msg = apiMsg ?? (err instanceof Error ? err.message : undefined);
      setErrorMessage(formatErrorMessage(msg));
    },
  });

  const steps = [
    t('application.steps.personal'),
    t('application.steps.qualifications'),
    t('application.steps.documents'),
    t('application.steps.declarations'),
  ];

  function next() {
    setErrorMessage(null);
    if (step === 3) {
      const validationMessage = getDocumentValidationMessage();
      if (validationMessage) {
        setErrorMessage(validationMessage);
        return;
      }
    }
    if (!applicationId) {
      createMutation.mutate();
    } else {
      updateMutation.mutate();
    }
  }

  function back() {
    setErrorMessage(null);
    if (step > 1) setStep(step - 1);
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (alreadySubmitted) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in py-12 text-center">
        <div className="glass-card rounded-3xl p-8 space-y-4 border border-amber-500/30">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
            ✓
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            تم تقديم الطلب بنجاح سابقاً
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-md mx-auto">
            لقد قمت بتقديم طلب التوظيف على هذه الوظيفة (<strong>{job?.title}</strong>) بالفعل وحالته حالياً قيد المراجعة لدى فريق HR والتأهيل.
          </p>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <Button variant="gold" onClick={() => navigate(getPortalHomeForRole(role))}>
              متابعة كل طلباتي المرفوعة
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setAlreadySubmitted(false);
                setApplicationId(null);
                setStep(1);
              }}
            >
              + تقديم طلب جديد إضافي لهذه الوظيفة
            </Button>

            <Button variant="outline" onClick={() => navigate('/careers')}>
              تصفح التقديم على وظائف أخرى ←
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div>
        <p className="text-sage text-sm uppercase tracking-wide">{job?.title}</p>
        <h2 className="text-2xl font-bold text-primary-dark">{t('application.applyTitle')}</h2>
      </div>

      <StepIndicator steps={steps} currentStep={step} />

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm font-medium">
          {errorMessage}
        </div>
      )}

      <div className="glass-card rounded-2xl p-6 space-y-4">
        {step === 1 && (
          <div className="space-y-4">
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
            <div className="grid sm:grid-cols-3 gap-4">
              <label className="block text-sm">
                <span className="font-medium">{t('application.nationalId')}</span>
                <input className="mt-1 w-full border rounded-lg px-3 py-2" value={form.nationalId} onChange={(e) => setForm({ ...form, nationalId: e.target.value })} placeholder="الرقم القومي / رقم الجواز" />
              </label>
              <label className="block text-sm">
                <span className="font-medium">{t('application.dateOfBirth')}</span>
                <input type="date" className="mt-1 w-full border rounded-lg px-3 py-2" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
              </label>
              <label className="block text-sm">
                <span className="font-medium">{t('application.gender')}</span>
                <select className="mt-1 w-full border rounded-lg px-3 py-2" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                  <option value="">— اختر الجنس —</option>
                  <option value="male">ذكر</option>
                  <option value="female">أنثى</option>
                </select>
              </label>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <label className="block text-sm sm:col-span-2">
                <span className="font-medium">{t('application.streetAddress')}</span>
                <input className="mt-1 w-full border rounded-lg px-3 py-2" value={form.streetAddress} onChange={(e) => setForm({ ...form, streetAddress: e.target.value })} placeholder="العنوان التفصيلي للسكن" />
              </label>
              <label className="block text-sm">
                <span className="font-medium">{t('application.city')}</span>
                <input className="mt-1 w-full border rounded-lg px-3 py-2" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="المدينة / المحافظة" />
              </label>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <label className="block text-sm">
                <span className="font-medium">{t('application.emergencyContactName')}</span>
                <input className="mt-1 w-full border rounded-lg px-3 py-2" value={form.emergencyContactName} onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })} placeholder="اسم شخص للطوارئ" />
              </label>
              <label className="block text-sm">
                <span className="font-medium">{t('application.emergencyContactPhone')}</span>
                <input className="mt-1 w-full border rounded-lg px-3 py-2" value={form.emergencyContactPhone} onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })} placeholder="هاتف شخص الطوارئ" />
              </label>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block text-sm">
                <span className="font-medium">{t('application.yearsExperience')}</span>
                <input type="number" min={0} className="mt-1 w-full border rounded-lg px-3 py-2" value={form.yearsExperience} onChange={(e) => setForm({ ...form, yearsExperience: Number(e.target.value) })} />
              </label>
              <label className="block text-sm">
                <span className="font-medium">{t('application.curriculum')}</span>
                <select className="mt-1 w-full border rounded-lg px-3 py-2" value={form.curriculumExperience} onChange={(e) => setForm({ ...form, curriculumExperience: e.target.value })}>
                  <option value="">{isAr ? 'اختر المنهج' : 'Select curriculum'}</option>
                  <option value="IB">{isAr ? 'البكالوريا الدولية (IB)' : 'IB'}</option>
                  <option value="British">{isAr ? 'المنهج البريطاني' : 'British'}</option>
                  <option value="American">{isAr ? 'المنهج الأمريكي' : 'American'}</option>
                  <option value="Egyptian National">{isAr ? 'المنهج القومي المصري' : 'Egyptian National'}</option>
                </select>
              </label>
            </div>
            <label className="block text-sm">
              <span className="font-medium">{t('application.subjects')}</span>
              <input className="mt-1 w-full border rounded-lg px-3 py-2" value={form.subjectsTaught} onChange={(e) => setForm({ ...form, subjectsTaught: e.target.value })} placeholder="مثال: الرياضيات، الفيزيا" />
            </label>
            <div className="grid sm:grid-cols-3 gap-4">
              <label className="block text-sm">
                <span className="font-medium">{t('application.qualification')}</span>
                <input className="mt-1 w-full border rounded-lg px-3 py-2" value={form.highestQualification} onChange={(e) => setForm({ ...form, highestQualification: e.target.value })} placeholder="بكالوريوس / ماجستير" />
              </label>
              <label className="block text-sm">
                <span className="font-medium">{t('application.university')}</span>
                <input className="mt-1 w-full border rounded-lg px-3 py-2" value={form.university} onChange={(e) => setForm({ ...form, university: e.target.value })} placeholder="الجامعة / الكلية" />
              </label>
              <label className="block text-sm">
                <span className="font-medium">{t('application.graduationYear')}</span>
                <input type="number" min={1970} max={2030} className="mt-1 w-full border rounded-lg px-3 py-2" value={form.graduationYear} onChange={(e) => setForm({ ...form, graduationYear: e.target.value })} placeholder="2020" />
              </label>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <label className="block text-sm">
                <span className="font-medium">{t('application.licenseNo')}</span>
                <input className="mt-1 w-full border rounded-lg px-3 py-2" value={form.teachingLicenseNo} onChange={(e) => setForm({ ...form, teachingLicenseNo: e.target.value })} />
              </label>
              <label className="block text-sm">
                <span className="font-medium">{t('application.noticePeriod')}</span>
                <input className="mt-1 w-full border rounded-lg px-3 py-2" value={form.noticePeriod} onChange={(e) => setForm({ ...form, noticePeriod: e.target.value })} placeholder="فوراً / خلال شهر" />
              </label>
              <label className="block text-sm">
                <span className="font-medium">{t('application.expectedSalary')}</span>
                <input className="mt-1 w-full border rounded-lg px-3 py-2" value={form.expectedSalary} onChange={(e) => setForm({ ...form, expectedSalary: e.target.value })} placeholder="الراتب المتوقع" />
              </label>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/20 p-4 text-sm text-blue-900 dark:text-blue-100 space-y-2">
              <p className="font-bold">
                {isAr ? 'تعليمات المستندات' : 'Document instructions'}
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs leading-relaxed">
                <li>
                  {isAr
                    ? 'السيرة الذاتية (CV) مطلوبة دائماً للمتابعة والإرسال.'
                    : 'CV / Resume is always required to continue and submit.'}
                </li>
                <li>
                  {isAr
                    ? 'عند تفعيل التعهد بإحضار الأصول في المقابلة، يمكنك إرسال الطلب الآن وإحضار باقي المستندات يوم الإنترفيو.'
                    : 'With the interview pledge enabled, you can submit now and bring remaining originals on interview day.'}
                </li>
                <li>
                  {isAr
                    ? 'بدون التعهد، يجب رفع المستندات الإلزامية (الفيش الجنائي، شهادة التخرج، البطاقة الشخصية) قبل المتابعة.'
                    : 'Without the pledge, mandatory documents (criminal record, graduation certificate, national ID) must be uploaded first.'}
                </li>
              </ul>
            </div>

            {!form.pledgeOriginalsAtInterview && getMissingMandatoryHiringDocs().length > 0 && (
              <div className="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4 text-sm text-amber-900 dark:text-amber-100">
                <p className="font-bold mb-1">
                  {isAr ? 'تنبيه: مستندات إلزامية ناقصة' : 'Warning: missing mandatory documents'}
                </p>
                <p className="text-xs leading-relaxed">
                  {isAr
                    ? `المستندات التالية لم تُرفع بعد: ${getMissingMandatoryHiringDocs()
                        .map((code) => getDocumentLabel(code, true))
                        .join('، ')}. يمكنك رفعها الآن أو تفعيل التعهد بالإنترفيو.`
                    : `The following mandatory documents are not uploaded yet: ${getMissingMandatoryHiringDocs()
                        .map((code) => getDocumentLabel(code, false))
                        .join(', ')}. Upload them now or enable the interview pledge.`}
                </p>
              </div>
            )}
            {/* Primary Required Document: CV / Resume */}
            <div className="p-5 rounded-2xl border border-red-200 dark:border-red-950/60 bg-red-50/30 dark:bg-red-950/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
                  <FileText className="w-4 h-4 text-red-500" />
                  <span>السيرة الذاتية (CV / Resume)</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800">
                  🔴 مطلوب إلزامي
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                يرجى إرفاق أحدث نسخة من السيرة الذاتية (المستندات المقبولة: PDF, DOC, DOCX بحجم أقصى 5MB)
              </p>
              
              {documentFiles[CV_DOCUMENT_TYPE] ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs">
                  <div className="flex items-center gap-2 font-semibold truncate">
                    <Paperclip className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate">{documentFiles[CV_DOCUMENT_TYPE]?.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDocumentFiles((prev) => ({ ...prev, [CV_DOCUMENT_TYPE]: null }))}
                    className="text-red-500 hover:text-red-700 font-bold hover:underline shrink-0"
                  >
                    حذف الملف
                  </button>
                </div>
              ) : uploadedDocTypes.has(CV_DOCUMENT_TYPE) ? (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                  <Paperclip className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t('careers.resumeAlreadyUploaded')}</span>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-red-300 dark:border-red-800 hover:border-red-500 bg-white dark:bg-slate-900 cursor-pointer transition-all text-center space-y-1">
                  <Upload className="w-6 h-6 text-red-500" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {isAr ? 'اضغط هنا لإرفاق ملف السيرة الذاتية (CV)' : 'Click here to attach your CV / Resume'}
                  </span>
                  <span className="text-[10px] text-slate-400">{t('common.allowedFileFormats')}</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.png,.jpg"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      if (file) setDocumentFiles((prev) => ({ ...prev, [CV_DOCUMENT_TYPE]: file }));
                    }}
                  />
                </label>
              )}
            </div>

            {/* Official Hiring Documents (الإلزامية والاختيارية) */}
            <HiringDocumentsSection
              pledged={form.pledgeOriginalsAtInterview}
              onPledgeChange={(pledged) => setForm({ ...form, pledgeOriginalsAtInterview: pledged })}
              documentFiles={documentFiles}
              onFileChange={(docCode, file) => setDocumentFiles((prev) => ({ ...prev, [docCode]: file }))}
            />

            {/* Optional Cover Letter */}
            <label className="block text-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800 dark:text-slate-200">{t('application.coverLetter', 'خطاب التقديم (Cover Letter)')}</span>
                <span className="text-xs text-slate-400 font-medium">🔵 اختياري</span>
              </div>
              <textarea
                className="mt-1 w-full border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-amber-500"
                rows={3}
                placeholder="اكتب نبذة مختصرة عن دوافعك وحبك للانضمام لفريق عمل مدرسة منهاتن..."
                value={form.coverLetter}
                onChange={(e) => setForm({ ...form, coverLetter: e.target.value })}
              />
            </label>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5 text-sm">
            <p className="text-slate-600 dark:text-slate-400 text-xs">
              {isAr
                ? 'يرجى مراجعة جميع البيانات والمستندات قبل الإرسال النهائي.'
                : 'Please review all information and documents before final submission.'}
            </p>

            <ReviewSection title={isAr ? 'البيانات الشخصية والعنوان' : 'Personal Details & Address'}>
              <ReviewRow label={t('application.fullName')} value={form.fullName} />
              <ReviewRow label={t('application.email')} value={form.email} />
              <ReviewRow label={t('application.phone')} value={form.phone} />
              <ReviewRow label={t('application.nationalId')} value={form.nationalId} />
              <ReviewRow label={t('application.dateOfBirth')} value={form.dateOfBirth} />
              <ReviewRow label={t('application.gender')} value={formatGender(form.gender, isAr)} />
              <ReviewRow label={isAr ? 'الجنسية' : 'Nationality'} value={form.nationality} />
              <ReviewRow label={t('application.streetAddress')} value={form.streetAddress} />
              <ReviewRow label={t('application.city')} value={form.city} />
              <ReviewRow label={isAr ? 'المحافظة' : 'Governorate'} value={form.governorate} />
              <ReviewRow label={t('application.emergencyContactName')} value={form.emergencyContactName} />
              <ReviewRow label={t('application.emergencyContactPhone')} value={form.emergencyContactPhone} />
            </ReviewSection>

            <ReviewSection title={isAr ? 'المؤهلات والخبرات التدريسية' : 'Qualifications & Experience'}>
              <ReviewRow label={t('application.yearsExperience')} value={form.yearsExperience} />
              <ReviewRow label={t('application.curriculum')} value={formatCurriculum(form.curriculumExperience, isAr)} />
              <ReviewRow label={t('application.subjects')} value={form.subjectsTaught} />
              <ReviewRow label={t('application.qualification')} value={form.highestQualification} />
              <ReviewRow label={t('application.university')} value={form.university} />
              <ReviewRow label={t('application.graduationYear')} value={form.graduationYear} />
              <ReviewRow label={isAr ? 'التخصص' : 'Major'} value={form.major} />
              <ReviewRow label={t('application.licenseNo')} value={form.teachingLicenseNo} />
              <ReviewRow label={isAr ? 'تاريخ التفرغ' : 'Available Start Date'} value={form.availableStartDate} />
              <ReviewRow label={t('application.noticePeriod')} value={form.noticePeriod} />
              <ReviewRow label={t('application.expectedSalary')} value={form.expectedSalary} />
            </ReviewSection>

            <ReviewSection title={isAr ? 'المستندات والمرفقات' : 'Documents & Attachments'}>
              <ReviewRow
                label={isAr ? 'خطاب التقديم' : 'Cover Letter'}
                value={form.coverLetter}
              />
              <ReviewRow
                label={isAr ? 'تعهد إحضار الأصول' : 'Pledge to bring originals'}
                value={
                  form.pledgeOriginalsAtInterview
                    ? isAr ? 'نعم، أوافق' : 'Yes, agreed'
                    : isAr ? 'لا' : 'No'
                }
              />
              <div className="pt-2">
                <p className="font-medium text-slate-600 dark:text-slate-400 mb-2">
                  {isAr ? 'الملفات المرفقة' : 'Uploaded files'}
                </p>
                <ul className="space-y-1.5">
                  {Array.from(uploadedDocTypes).map((code) => (
                    <li
                      key={`uploaded-${code}`}
                      className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-xs font-medium"
                    >
                      <Paperclip className="w-3.5 h-3.5 shrink-0" />
                      <span>{getDocumentLabel(code, isAr)}</span>
                      <span className="text-slate-400">— {isAr ? 'تم الرفع' : 'Uploaded'}</span>
                    </li>
                  ))}
                  {Object.entries(documentFiles)
                    .filter(([, file]) => !!file)
                    .map(([code, file]) => (
                      <li
                        key={`pending-${code}`}
                        className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-xs font-medium"
                      >
                        <Paperclip className="w-3.5 h-3.5 shrink-0" />
                        <span>{getDocumentLabel(code, isAr)}</span>
                        <span className="text-slate-500 truncate">— {file?.name}</span>
                      </li>
                    ))}
                  {uploadedDocTypes.size === 0 &&
                    Object.values(documentFiles).every((f) => !f) && (
                      <li className="text-slate-400 text-xs">
                        {isAr ? 'لا توجد مستندات مرفقة' : 'No documents attached'}
                      </li>
                    )}
                </ul>
              </div>
            </ReviewSection>

            <div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={form.safeguardingAccepted}
                  onChange={(e) => setForm({ ...form, safeguardingAccepted: e.target.checked })}
                />
                <span className="text-slate-800 dark:text-slate-200 leading-relaxed">{t('application.safeguarding')}</span>
              </label>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={back} disabled={step === 1 || isPending}>{t('common.back')}</Button>
        <Button
          variant="gold"
          onClick={next}
          disabled={isPending || (step === 4 && !form.safeguardingAccepted)}
        >
          {isPending ? 'جاري التحميل...' : step === 4 ? t('application.submit') : t('common.next')}
        </Button>
      </div>
    </div>
  );
}

