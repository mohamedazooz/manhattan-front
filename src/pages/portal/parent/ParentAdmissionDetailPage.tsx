import { useState } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Clock, Phone, MessageSquare, ArrowRight, AlertCircle } from 'lucide-react';
import { admissionsApi, requirementsApi } from '../../../api';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Input';
import { StatusBadge, LoadingSpinner } from '../../../components/ui/Badge';
import { StepIndicator } from '../../../components/ui/StepIndicator';
import { mediaUrl } from '../../../lib/utils';
import { getApiErrorMessage } from '../../../lib/formData';
import { getAdmissionDocumentMeta } from './admissionWizardConstants';

export function ParentAdmissionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [docType, setDocType] = useState('BIRTH_CERTIFICATE');
  const [file, setFile] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [completeError, setCompleteError] = useState<string | null>(null);
  const [completeSuccess, setCompleteSuccess] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const location = useLocation();
  const routeState = location.state as {
    incompleteDocs?: boolean;
    referenceNumber?: string;
    studentName?: string;
  } | null;

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
      setUploadError(null);
    },
    onError: (error) => {
      setUploadError(getApiErrorMessage(error, 'فشل رفع المستند. تأكد من الملف وحاول مرة أخرى.'));
    },
  });

  const submitMutation = useMutation({
    mutationFn: () => admissionsApi.submit(id!),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admission', id] });
      queryClient.invalidateQueries({ queryKey: ['my-admissions'] });
      const refNum = (res.data as { referenceNumber?: string })?.referenceNumber;
      navigate('/portal/parent', {
        state: {
          submitted: true,
          referenceNumber: refNum,
          studentName: admission
            ? `${admission.studentFirstName} ${admission.studentLastName}`
            : undefined,
        },
      });
    },
    onError: (error) => {
      setSubmitError(getApiErrorMessage(error, t('admission.errorSubmit', 'فشل إرسال الطلب. يرجى المحاولة مرة أخرى.')));
    },
  });

  const completeMutation = useMutation({
    mutationFn: () => admissionsApi.completeDocuments(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admission', id] });
      queryClient.invalidateQueries({ queryKey: ['my-admissions'] });
      setCompleteError(null);
      setCompleteSuccess('تم تأكيد استكمال جميع المستندات المطلوبة بنجاح.');
    },
    onError: (error) => {
      setCompleteSuccess(null);
      setCompleteError(getApiErrorMessage(error, 'فشل تأكيد استكمال المستندات. تأكد من رفع كل المستندات المطلوبة.'));
    },
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
  const missingDocs = requiredDocs.filter((type) => !uploadedTypes.has(type));
  const isDraft = admission.status === 'DRAFT';
  const canUploadDocuments = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW'].includes(admission.status);
  const canCompleteDocuments =
    ['SUBMITTED', 'UNDER_REVIEW'].includes(admission.status) &&
    missingDocs.length === 0 &&
    !admission.documentsCompletedAt;
  const documentsFullyComplete =
    !isDraft &&
    missingDocs.length === 0 &&
    (admission.documentsCompletedAt || !['SUBMITTED', 'UNDER_REVIEW'].includes(admission.status));
  const effectiveTermsAccepted = termsAccepted || admission.termsAccepted;

  async function handleSubmit() {
    setSubmitError(null);
    if (!admission) return;

    if (!isDraft) {
      setSubmitError('تم إرسال هذا الطلب مسبقاً. يمكنك استكمال المستندات الناقصة من نفس الصفحة.');
      return;
    }

    if (file) {
      setSubmitError('يوجد مستند محدد لم يُرفع بعد. اضغط «رفع المستند الآن» أو ألغِ الاختيار ثم أعد المحاولة.');
      return;
    }

    if (uploadMutation.isPending) {
      setSubmitError('انتظر حتى يكتمل رفع المستند الحالي ثم أعد المحاولة.');
      return;
    }

    if (!effectiveTermsAccepted) {
      setSubmitError('يجب الموافقة على الشروط والأنظمة قبل إرسال الطلب.');
      return;
    }

    if (!admission.termsAccepted && termsAccepted) {
      try {
        await admissionsApi.update(id!, { termsAccepted: true });
      } catch (error) {
        setSubmitError(getApiErrorMessage(error, 'فشل حفظ الموافقة على الشروط.'));
        return;
      }
    }

    submitMutation.mutate();
  }

  function handleCompleteDocuments() {
    setCompleteError(null);
    setCompleteSuccess(null);

    if (file) {
      setCompleteError('يوجد مستند محدد لم يُرفع بعد. ارفع المستند أولاً ثم أكّد الاستكمال.');
      return;
    }

    if (uploadMutation.isPending) {
      setCompleteError('انتظر حتى يكتمل رفع المستند الحالي ثم أعد المحاولة.');
      return;
    }

    if (missingDocs.length > 0) {
      const labels = missingDocs.map((code) => getAdmissionDocumentMeta(code).title).join('، ');
      setCompleteError(`المستندات المطلوبة التالية غير مرفوعة: ${labels}`);
      return;
    }

    completeMutation.mutate();
  }

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

      <StepIndicator steps={wizardSteps} currentStep={canUploadDocuments ? 4 : 5} />

      {(routeState?.incompleteDocs || (missingDocs.length > 0 && !isDraft)) && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-sm text-amber-900 dark:text-amber-200">
          <strong>استكمال الطلب:</strong> تم إرسال طلبك بنجاح
          {admission.referenceNumber ? ` (المرجع: ${admission.referenceNumber})` : ''}.
          يتبقى رفع {missingDocs.length} مستند مطلوب لاستكمال الملف.
        </div>
      )}

      {/* Details Overview Card */}
      <section className="glass-card rounded-2xl p-6 space-y-6">
        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 border-b pb-3 border-slate-200 dark:border-slate-800">
          📋 ملخص بيانات التقديم ومدرسة مانهاتن
        </h3>

        <div className="grid sm:grid-cols-2 gap-4 text-xs">
          {/* Father / Guardian Info */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
            <h4 className="font-bold text-sky-600 dark:text-sky-400 text-sm">بيانات الأب / ولي الأمر والطالب</h4>
            <p><strong>اسم ولي الأمر:</strong> {admission.parentName}</p>
            <p><strong>الرقم القومي لولي الأمر:</strong> {admission.parentNationalId || 'غير مدخل'}</p>
            <p><strong>الرقم القومي للطالب:</strong> {admission.nationalId || 'غير مدخل'}</p>
            <p><strong>البريد الإلكتروني:</strong> {admission.parentEmail}</p>
            <p><strong>الهاتف:</strong> {admission.parentPhone}</p>
            <p><strong>الجنسية:</strong> {admission.parentNationality || 'غير محدد'}</p>
            <p><strong>جهة العمل:</strong> {admission.parentEmployer || 'غير محدد'}</p>
          </div>

          {/* Mother Info (Extracted) */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
            <h4 className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">بيانات الأم والفيصل السكني</h4>
            <p><strong>اسم الأم:</strong> {admission.motherName || 'غير مدخل'}</p>
            <p><strong>الهاتف:</strong> {admission.motherPhone || 'غير مدخل'}</p>
            <p><strong>المهنة:</strong> {admission.motherOccupation || 'غير مدخل'}</p>
            <p><strong>العنوان التفصيلي:</strong> {admission.streetAddress || 'غير مدخل'}</p>
            <p><strong>المدينة / المحافظة:</strong> {admission.city ? `${admission.city} ${admission.governorate || ''}` : 'غير مدخل'}</p>
          </div>
        </div>

        {/* Emergency Contact */}
        {(admission.emergencyContactPhone || admission.emergencyContactName) && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1">
            <h4 className="font-bold text-amber-700 dark:text-amber-400 text-sm">جهة الاتصال للطوارئ</h4>
            {admission.emergencyContactName && <p><strong>الاسم:</strong> {admission.emergencyContactName} ({admission.emergencyContactRelation || 'جهة اتصال'})</p>}
            {admission.emergencyContactPhone && <p><strong>الهاتف:</strong> {admission.emergencyContactPhone}</p>}
            {admission.emergencyContactAddress && <p><strong>العنوان:</strong> {admission.emergencyContactAddress}</p>}
          </div>
        )}

        {/* Medical & Health Record (Extracted) */}
        <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 text-xs space-y-2">
          <h4 className="font-bold text-rose-600 dark:text-rose-400 text-sm">السجل الصحي والنشاط الطبي للطالب</h4>
          {admission.healthConditions && typeof admission.healthConditions === 'object' ? (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {Object.entries(admission.healthConditions as Record<string, boolean>).filter(([, v]) => v).length === 0 ? (
                <span className="text-slate-500">لا توجد حالات صحية خاصة مسجلة (سليم صحياً)</span>
              ) : (
                Object.entries(admission.healthConditions as Record<string, boolean>)
                  .filter(([, v]) => v)
                  .map(([k]) => (
                    <span key={k} className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-300 font-semibold border border-rose-500/20">
                      {t(`admission.healthConditions.${k}`, k)}
                    </span>
                  ))
              )}
            </div>
          ) : (
            <p className="text-slate-500">سليم صحياً</p>
          )}

          {admission.healthNotes && (
            <p className="pt-2 text-slate-700 dark:text-slate-300">
              <strong>ملاحظات صحية خاصة:</strong> {admission.healthNotes}
            </p>
          )}
        </div>
      </section>

      {/* Premium Document Center Section */}
      <section className="glass-card rounded-3xl p-6 sm:p-8 space-y-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
              <span>📁</span>
              <span>مركز المستندات والوثائق الرسمية</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              يرجى رفع صور أو ملفات PDF واضحة للمستندات المطلوبة لاستكمال ملف التقديم
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            {uploadedTypes.size} / {requiredDocs.length || 1} مرفوع
          </span>
        </div>

        {/* Required Documents Checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {requiredDocs.map((type: string) => {
            const isUploaded = uploadedTypes.has(type);
            return (
              <div
                key={type}
                className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                  isUploaded
                    ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{isUploaded ? '✅' : '📌'}</span>
                  <span className="text-xs font-bold">{getAdmissionDocumentMeta(type).title}</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isUploaded ? 'bg-emerald-500 text-white' : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                }`}>
                  {isUploaded ? 'تم الرفع' : 'مطلوب'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Already Uploaded Files List */}
        {admission.documents && admission.documents.length > 0 && (
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">الملفات المرفوعة حالياً:</h4>
            <div className="space-y-2">
              {admission.documents.map((doc: { id: string; fileName: string; fileUrl: string; documentType: string }) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 hover:border-amber-500/40 transition-all text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-sm">
                      📄
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        {getAdmissionDocumentMeta(doc.documentType).title}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        {doc.fileName}
                      </div>
                    </div>
                  </div>

                  <a
                    href={mediaUrl(doc.fileUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold transition-all"
                  >
                    <span>معاينة المستند</span>
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* File Upload Box */}
        {canUploadDocuments && (
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border-2 border-dashed border-slate-300 dark:border-slate-700 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Select
                label="اختر نوع المستند المرفق *"
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
              >
                {requiredDocs.map((val) => (
                  <option key={val} value={val}>{getAdmissionDocumentMeta(val).title}</option>
                ))}
              </Select>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  ملف المستند (PDF أو صورة) *
                </label>
                <div className="relative border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 bg-white dark:bg-slate-800 text-center">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-600 dark:text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-500/10 file:text-amber-700 dark:file:text-amber-400 hover:file:bg-amber-500/20 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {file && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  تم اختيار: 📄 {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setUploadError(null);
                  }}
                  className="text-red-500 font-bold hover:underline"
                >
                  إلغاء
                </button>
              </div>
            )}

            {uploadError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{uploadError}</span>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                variant="gold"
                onClick={() => {
                  setUploadError(null);
                  uploadMutation.mutate();
                }}
                disabled={!file || uploadMutation.isPending}
                className="rounded-xl px-6 font-bold"
              >
                {uploadMutation.isPending ? 'جاري رفع المستند...' : 'رفع المستند الآن 📤'}
              </Button>
            </div>
          </div>
        )}
      </section>

      {isDraft && (
        <section className="glass-card rounded-2xl p-5 space-y-4 border border-slate-200 dark:border-slate-800">
          {!admission.termsAccepted && (
            <label className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => {
                  setTermsAccepted(e.target.checked);
                  if (submitError) setSubmitError(null);
                }}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
              />
              <span>{t('admission.termsAccepted')}</span>
            </label>
          )}

          {missingDocs.length > 0 && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-200">
              <strong>تنبيه:</strong> يمكنك إرسال الطلب الآن واستكمال {missingDocs.length} مستند لاحقاً:
              {missingDocs.map((code) => getAdmissionDocumentMeta(code).title).join('، ')}
            </div>
          )}

          {submitError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-700 dark:text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}

          <Button
            variant="gold"
            onClick={() => void handleSubmit()}
            disabled={submitMutation.isPending || uploadMutation.isPending}
            className="w-full sm:w-auto"
          >
            {submitMutation.isPending
              ? t('common.submitting', 'جاري إرسال الطلب...')
              : t('admission.submitApplication')}
          </Button>
        </section>
      )}

      {!isDraft && canUploadDocuments && missingDocs.length > 0 && (
        <section className="glass-card rounded-2xl p-5 space-y-4 border border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            ارفع المستندات الناقصة أعلاه ثم اضغط «تأكيد استكمال المستندات» لإعلام الإدارة بأن الملف مكتمل.
          </p>

          {completeError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-700 dark:text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{completeError}</span>
            </div>
          )}

          {completeSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-800 dark:text-emerald-200 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{completeSuccess}</span>
            </div>
          )}
        </section>
      )}

      {canCompleteDocuments && (
        <section className="glass-card rounded-2xl p-5 space-y-4 border border-slate-200 dark:border-slate-800">
          {completeError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-700 dark:text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{completeError}</span>
            </div>
          )}

          {completeSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-800 dark:text-emerald-200 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{completeSuccess}</span>
            </div>
          )}

          <Button
            variant="gold"
            onClick={() => void handleCompleteDocuments()}
            disabled={completeMutation.isPending || uploadMutation.isPending}
            className="w-full sm:w-auto"
          >
            {completeMutation.isPending ? 'جاري تأكيد الاستكمال...' : 'تأكيد استكمال المستندات'}
          </Button>
        </section>
      )}

      {!isDraft && documentsFullyComplete && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-800 dark:text-emerald-200 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            {admission.documentsCompletedAt
              ? 'تم استكمال جميع المستندات المطلوبة وإعلام الإدارة.'
              : 'تم إرسال الطلب. جميع المستندات المطلوبة مرفوعة.'}
          </span>
        </div>
      )}

      {admission.status === 'REJECTED' && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-sm text-red-800 dark:text-red-200">
          تم رفض هذا الطلب ولا يمكن تعديل المستندات.
        </div>
      )}
    </div>
  );
}
