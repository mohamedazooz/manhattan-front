import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Clock, Phone, MessageSquare, ArrowRight } from 'lucide-react';
import { admissionsApi, requirementsApi } from '../../../api';
import { Button } from '../../../components/ui/Button';
import { Input, Select } from '../../../components/ui/Input';
import { StatusBadge, LoadingSpinner } from '../../../components/ui/Badge';
import { ChecklistItem } from '../../../components/ui/ChecklistItem';
import { StepIndicator } from '../../../components/ui/StepIndicator';
import { mediaUrl } from '../../../lib/utils';

const DOC_LABELS: Record<string, string> = {
  BIRTH_CERTIFICATE: 'Birth Certificate',
  PREVIOUS_REPORT: 'Previous School Report',
  HEALTH_RECORD: 'Health Record',
  IMMUNIZATION_RECORD: 'Immunization Record',
  STUDENT_PHOTO: 'Student Photo',
  PARENT_PASSPORT: 'Parent Passport',
  SCHOOL_REFERENCE: 'School Reference',
  TRANSCRIPT: 'Academic Transcript',
  PASSPORT: 'Student Passport',
};

export function ParentAdmissionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [docType, setDocType] = useState('BIRTH_CERTIFICATE');
  const [file, setFile] = useState<File | null>(null);

  const { data: admission, isLoading } = useQuery({
    queryKey: ['admission', id],
    queryFn: () => admissionsApi.get(id!).then((r) => r.data),
    enabled: !!id,
  });

  const { data: requirements = [] } = useQuery({
    queryKey: ['admission-requirements'],
    queryFn: () => requirementsApi.list(false).then((r) => (Array.isArray(r.data) ? r.data : [])),
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append('documentType', docType);
      if (file) fd.append('file', file);
      return admissionsApi.uploadDocument(id!, fd);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admission', id] });
      setFile(null);
    },
  });

  const submitMutation = useMutation({
    mutationFn: () => admissionsApi.submit(id!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admission', id] }),
  });

  if (isLoading) return <LoadingSpinner />;
  if (!admission) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-6 animate-fade-in">
        <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <div className="text-4xl">🎓</div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            {t('admission.notFound', 'لم يتم العثور على طلب الالتحاق')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            قد يكون الطلب غير موجود أو يخص حساباً آخر. يمكنك الرجوع أو إنشاء طلب تقديم جديد.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Button variant="gold" onClick={() => navigate(-1)} showArrow>
              رجوع للصفحة السابقة
            </Button>
            <Button variant="outline" to="/portal/parent">
              الرجوع لبوابة ولي الأمر
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const gradeReq = requirements.find((r: { gradeLevel: string }) => r.gradeLevel === admission.gradeLevel);
  const requiredDocs: string[] = gradeReq?.requiredDocumentTypes ?? [];
  const uploadedTypes = new Set((admission.documents || []).map((d: { documentType: string }) => d.documentType));
  const canEdit = admission.status === 'DRAFT';

  const wizardSteps = [
    t('admission.steps.student'),
    t('admission.steps.family'),
    t('admission.steps.school'),
    t('admission.steps.documents'),
    t('admission.steps.review'),
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Top Navigation Bar with Back Button */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-bold text-primary dark:text-blue-400 hover:underline cursor-pointer"
        >
          <ArrowRight className="w-4 h-4 rtl:rotate-0" />
          <span>العودة للخلف</span>
        </button>
        <Link to="/portal/parent" className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
          ← قائمة الطلبات
        </Link>
      </div>

      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-primary-dark dark:text-white">
            {admission.studentFirstName} {admission.studentLastName}
          </h2>
          <p className="text-neutral-medium dark:text-slate-400 text-sm">
            {admission.gradeLevel} · {admission.parentEmail}
            {admission.referenceNumber && (
              <span className="block mt-1 font-mono text-primary">
                {t('admission.referenceNumber', 'Reference')}: {admission.referenceNumber}
              </span>
            )}
          </p>
        </div>
        <StatusBadge status={admission.status} />
      </div>

      {admission.status === 'ACCEPTED' && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900/90 via-emerald-800 to-primary p-6 text-white shadow-xl border border-emerald-500/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-emerald-300 font-semibold text-sm tracking-wide uppercase">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>{t('portal.parent.acceptedNotice.title')}</span>
              </div>
              <p className="text-emerald-100 text-sm max-w-xl leading-relaxed">
                {t('portal.parent.acceptedNotice.description', {
                  studentName: `${admission.studentFirstName} ${admission.studentLastName}`,
                })}
              </p>
              <div className="inline-flex items-center gap-2 bg-emerald-950/60 text-emerald-200 text-xs font-semibold px-3 py-1.5 rounded-full border border-emerald-500/40">
                <Clock className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>{t('portal.parent.acceptedNotice.timeLimit')}</span>
              </div>
            </div>
            <div className="flex flex-wrap sm:flex-col gap-3 shrink-0">
              <a
                href="tel:+201234567890"
                className="inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-md"
              >
                <Phone className="w-4 h-4" />
                {t('portal.parent.acceptedNotice.callSchool')}
              </a>
              <a
                href="https://wa.me/201234567890"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-all shadow-md"
              >
                <MessageSquare className="w-4 h-4" />
                {t('portal.parent.acceptedNotice.whatsapp')}
              </a>
            </div>
          </div>
        </div>
      )}

      <StepIndicator steps={wizardSteps} currentStep={canEdit ? 4 : 5} />

      <section className="glass-card rounded-2xl p-6">
        <h3 className="font-semibold mb-4">{t('admission.steps.documents')}</h3>
        <div className="space-y-3 mb-6">
          {requiredDocs.map((type: string) => (
            <ChecklistItem
              key={type}
              label={DOC_LABELS[type] || type.replace(/_/g, ' ')}
              status={uploadedTypes.has(type) ? 'complete' : 'required'}
            />
          ))}
          {!requiredDocs.length && (
            <p className="text-sm text-neutral-medium">{t('admission.noRequirements')}</p>
          )}
        </div>

        <ul className="space-y-2 mb-4">
          {(admission.documents || []).map((doc: { id: string; fileName: string; fileUrl: string; documentType: string }) => (
            <li key={doc.id} className="flex justify-between text-sm border rounded-lg p-3 bg-white">
              <span>{doc.documentType.replace(/_/g, ' ')} — {doc.fileName}</span>
              <a href={mediaUrl(doc.fileUrl)} target="_blank" rel="noreferrer" className="text-primary font-medium hover:underline">View</a>
            </li>
          ))}
        </ul>

        {canEdit && (
          <div className="bg-ivory rounded-xl p-4 space-y-3 border border-[var(--color-border-subtle)]">
            <Select label={t('admission.documentType')} value={docType} onChange={(e) => setDocType(e.target.value)}>
              {Object.entries(DOC_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </Select>
            <Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <Button onClick={() => uploadMutation.mutate()} disabled={!file || uploadMutation.isPending}>
              {t('admission.uploadDocument')}
            </Button>
          </div>
        )}
      </section>

      {canEdit && (
        <Button variant="gold" onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending} className="w-full sm:w-auto">
          {t('admission.submitApplication')}
        </Button>
      )}
    </div>
  );
}
