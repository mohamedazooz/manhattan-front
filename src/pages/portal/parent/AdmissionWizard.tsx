import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { 
  User, 
  Users, 
  HeartPulse, 
  FileCheck2, 
  CheckCircle2, 
  ShieldAlert, 
  GraduationCap, 
  Phone, 
  Briefcase,
  Upload,
  Paperclip,
  Trash2
} from 'lucide-react';
import { admissionsApi, requirementsApi } from '../../../api';
import { Button } from '../../../components/ui/Button';
import { StepIndicator } from '../../../components/ui/StepIndicator';
import { useAuth } from '../../../lib/auth';
import { useAppLanguage } from '../../../i18n';
import {
  GRADE_OPTIONS,
  HEALTH_CONDITIONS_LIST,
  REQUIRED_DOCUMENTS_LIST,
  getAdmissionDocumentMeta,
  createInitialAdmissionForm,
  type RequiredDocumentItem,
  type AdmissionWizardFormState,
} from './admissionWizardConstants';
import {
  buildAdmissionSteps,
  getMissingRequiredDocumentCodes,
  getStepValidationHint,
  isCurrentStepValid,
} from './admissionWizardValidation';
import { getApiErrorMessage } from '../../../lib/formData';
import { logger } from '../../../lib/logger';
import { LoadingSpinner } from '../../../components/ui/Badge';
import { ErrorState } from '../../../components/ui/ErrorState';

export function AdmissionWizard() {
  const { t } = useTranslation();
  const lang = useAppLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [documentFiles, setDocumentFiles] = useState<Record<string, File | null>>({});
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [form, setForm] = useState<AdmissionWizardFormState>(() => createInitialAdmissionForm(user));

  const { data: requirements = [], isLoading: requirementsLoading, isError: requirementsError, refetch: refetchRequirements } = useQuery({
    queryKey: ['admission-requirements', lang],
    queryFn: () => requirementsApi.list(false, lang).then((r) => r.data),
  });

  const requiredDocumentsList = useMemo((): RequiredDocumentItem[] => {
    const match = requirements.find(
      (r: { gradeLevel: string }) => r.gradeLevel === form.gradeLevel,
    );
    if (!match?.requiredDocumentTypes?.length) {
      return REQUIRED_DOCUMENTS_LIST;
    }
    return match.requiredDocumentTypes.map((code: string) => getAdmissionDocumentMeta(code));
  }, [requirements, form.gradeLevel]);

  const steps = buildAdmissionSteps(t);

  const mutation = useMutation({
    mutationFn: async () => {
      // 1. Create Application with all filled form data
      const res = await admissionsApi.create({
        ...form,
        healthConditions: form.healthConditions,
        currentStep: 6,
      });
      const appId = res.data.id;

      // 2. Upload Document Files sequentially
      const docUploadErrors: string[] = [];
      for (const [docCode, fileObj] of Object.entries(documentFiles)) {
        if (fileObj) {
          const fd = new FormData();
          fd.append('file', fileObj);
          fd.append('documentType', docCode);
          try {
            await admissionsApi.uploadDocument(appId, fd);
          } catch (err) {
            const msg = getApiErrorMessage(err, `Failed to upload document ${docCode}`);
            docUploadErrors.push(msg);
            logger.warn(`Error uploading document ${docCode}:`, err);
          }
        }
      }
      if (docUploadErrors.length > 0) {
        setUploadErrors(docUploadErrors);
      }

      // 3. Submit application to admin and get reference number
      const submitRes = await admissionsApi.submit(appId);
      const refNum = (submitRes.data as { referenceNumber?: string })?.referenceNumber || '';
      const missingDocs = getMissingRequiredDocumentCodes(requiredDocumentsList, documentFiles);

      return { appId, referenceNumber: refNum, missingDocs };
    },
    onSuccess: (data) => {
      if (data.missingDocs.length > 0) {
        navigate(`/portal/parent/admissions/${data.appId}`, {
          state: {
            incompleteDocs: true,
            referenceNumber: data.referenceNumber,
            studentName: `${form.studentFirstName} ${form.studentLastName}`,
          },
        });
        return;
      }

      navigate('/portal/parent', {
        state: {
          submitted: true,
          referenceNumber: data.referenceNumber,
          studentName: `${form.studentFirstName} ${form.studentLastName}`,
        },
      });
    },
  });

  function handleFileChange(code: string, file: File | null) {
    setDocumentFiles((prev) => ({
      ...prev,
      [code]: file,
    }));
  }

  function toggleHealthCondition(key: string, val: boolean) {
    setForm((prev) => ({
      ...prev,
      healthConditions: {
        ...prev.healthConditions,
        [key]: val,
      },
    }));
  }

  const validationHint = getStepValidationHint(step, form, requiredDocumentsList, documentFiles);
  const stepValid = isCurrentStepValid(step, form, requiredDocumentsList, documentFiles);

  function next() {
    setUploadErrors([]);
    if (!stepValid) return;
    if (step < 6) setStep(step + 1);
    else mutation.mutate();
  }

  function back() {
    if (step > 1) setStep(step - 1);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold">
          <GraduationCap className="w-4 h-4" />
          <span>مدرسة مانهاتن للغات - Manhattan Language School</span>
        </div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          {t('admission.wizardTitle', 'تقديم طلب التحاق جديد')}
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xl mx-auto">
          {t('admission.wizardSubtitle', 'منظومة القبول الإلكترونية لمدرسة مانهاتن للغات - يرجى استكمال البيانات بدقة')}
        </p>
      </div>

      {/* Step Indicator */}
      <StepIndicator steps={steps} currentStep={step} />

      {/* Main Glass Form Container */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl p-6 sm:p-8 space-y-6">

        {/* STEP 1: STUDENT DETAILS */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  {t('admission.steps.student', 'بيانات الطالب الأكاديمية والشخصية')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  يرجى إدخال اسم الطالب كما هو مدون بالحساب/الرقم القومي أو جواز السفر
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <label className="block text-sm space-y-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {t('admission.studentFirstName', 'اسم الطالب الأول')} <span className="text-red-500">*</span>
                </span>
                <input
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-sm"
                  value={form.studentFirstName}
                  onChange={(e) => setForm({ ...form, studentFirstName: e.target.value })}
                  placeholder="مثال: أحمد"
                  required
                />
              </label>

              <label className="block text-sm space-y-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {t('admission.studentLastName', 'اسم العائلة / اللقب')} <span className="text-red-500">*</span>
                </span>
                <input
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-sm"
                  value={form.studentLastName}
                  onChange={(e) => setForm({ ...form, studentLastName: e.target.value })}
                  placeholder="مثال: محمود"
                  required
                />
              </label>
            </div>

            <div className="grid sm:grid-cols-3 gap-5">
              <label className="block text-sm space-y-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {t('admission.dateOfBirth', 'تاريخ الميلاد')} <span className="text-red-500">*</span>
                </span>
                <input
                  type="date"
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-sm"
                  value={form.dateOfBirth}
                  onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                  required
                />
              </label>

              <label className="block text-sm space-y-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {t('admission.gender', 'الجنس')}
                </span>
                <select
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-sm"
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                >
                  <option value="">— اختر الجنس —</option>
                  <option value="male">{t('admission.male', 'ذكر')}</option>
                  <option value="female">{t('admission.female', 'أنثى')}</option>
                </select>
              </label>

              <label className="block text-sm space-y-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {t('admission.nationality', 'الجنسية')}
                </span>
                <input
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-sm"
                  value={form.nationality}
                  onChange={(e) => setForm({ ...form, nationality: e.target.value })}
                  placeholder="مصري / مصريّة"
                />
              </label>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <label className="block text-sm space-y-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {t('admission.nationalId', 'الرقم القومي للطالب / رقم شهادة الميلاد')}
                </span>
                <input
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-sm"
                  value={form.nationalId}
                  onChange={(e) => setForm({ ...form, nationalId: e.target.value })}
                  placeholder="14 رقم من شهادة الميلاد الرقمية"
                />
              </label>
            </div>

            <div className="grid sm:grid-cols-2 gap-5 pt-2">
              <label className="block text-sm space-y-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {t('admission.gradeLevel', 'المرحلة الدراسية المطلوبة')} <span className="text-red-500">*</span>
                </span>
                <select
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-sm"
                  value={form.gradeLevel}
                  onChange={(e) => setForm({ ...form, gradeLevel: e.target.value })}
                >
                  {GRADE_OPTIONS.map((g) => (
                    <option key={g} value={g}>
                      {t(`grades.${g}`, g)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm space-y-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {t('admission.previousSchool', 'المدرسة السابقة (إن وجدت)')}
                </span>
                <input
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-sm"
                  value={form.previousSchool}
                  onChange={(e) => setForm({ ...form, previousSchool: e.target.value })}
                  placeholder="اسم المدرسة أو الروضة السابقة"
                />
              </label>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <label className="block text-sm space-y-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {t('admission.languagesSpoken', 'اللغات التي يتحدث بها الطالب')}
                </span>
                <input
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-sm"
                  value={form.languagesSpoken}
                  onChange={(e) => setForm({ ...form, languagesSpoken: e.target.value })}
                  placeholder="مثال: العربية، الإنجليزية"
                />
              </label>

              <div className="flex items-center pt-6">
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-slate-200 dark:border-slate-800 w-full hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-500"
                    checked={form.siblingEnrolled}
                    onChange={(e) => setForm({ ...form, siblingEnrolled: e.target.checked })}
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t('admission.siblingEnrolled', 'هل يوجد إخوة مقيدون حالياً بمدرسة مانهاتن؟')}
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: PARENTS & EMERGENCY INFO (Extracted Mother & Emergency Data) */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  {t('admission.steps.family', 'بيانات الأب والأم وجهة اتصال الطوارئ')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  مستخرجة وفق نموذج التقديم الرسمي لمدرسة مانهاتن للتواصل الفعال والآمن
                </p>
              </div>
            </div>

            {/* Address Section */}
            <div className="bg-amber-500/5 dark:bg-amber-500/10 p-5 rounded-2xl border border-amber-500/20 space-y-4">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm">
                <span>📍</span>
                <span>{t('admission.addressSection', 'عنوان السكن والإقامة التفصيلي')}</span>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <label className="block text-sm space-y-1 sm:col-span-2">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {t('admission.streetAddress', 'العنوان التفصيلي للسكن (الشارع/المبنى)')}
                  </span>
                  <input
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                    value={form.streetAddress}
                    onChange={(e) => setForm({ ...form, streetAddress: e.target.value })}
                    placeholder="رقم المبنى، الشارع، الحي"
                  />
                </label>

                <label className="block text-sm space-y-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {t('admission.city', 'المدينة / المنطقة')}
                  </span>
                  <input
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="مثال: القاهرة الجديدة / الشروق"
                  />
                </label>
              </div>
            </div>

            {/* Father Section */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-bold text-sm">
                <Briefcase className="w-4 h-4" />
                <span>{t('admission.fatherSection', 'بيانات الأب / ولي الأمر الرئيسي')}</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block text-sm space-y-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {t('admission.parentName', 'اسم الأب / ولي الأمر بالكامل')} <span className="text-red-500">*</span>
                  </span>
                  <input
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                    value={form.parentName}
                    onChange={(e) => setForm({ ...form, parentName: e.target.value })}
                    required
                  />
                </label>

                <label className="block text-sm space-y-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {t('admission.parentRelationship', 'صلة القرابة')}
                  </span>
                  <select
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                    value={form.parentRelationship}
                    onChange={(e) => setForm({ ...form, parentRelationship: e.target.value })}
                  >
                    <option value="father">{t('admission.father', 'الأب')}</option>
                    <option value="mother">{t('admission.mother', 'الأم')}</option>
                    <option value="guardian">{t('admission.guardian', 'وصي آخر')}</option>
                  </select>
                </label>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <label className="block text-sm space-y-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {t('admission.parentEmail', 'البريد الإلكتروني')} <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="email"
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                    value={form.parentEmail}
                    onChange={(e) => setForm({ ...form, parentEmail: e.target.value })}
                    required
                  />
                </label>

                <label className="block text-sm space-y-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {t('admission.parentPhone', 'رقم الهاتف')} <span className="text-red-500">*</span>
                  </span>
                  <input
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                    value={form.parentPhone}
                    onChange={(e) => setForm({ ...form, parentPhone: e.target.value })}
                    placeholder="+20 100 000 0000"
                    required
                  />
                </label>

                <label className="block text-sm space-y-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {t('admission.parentNationality', 'جنسية الأب')}
                  </span>
                  <input
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                    value={form.parentNationality}
                    onChange={(e) => setForm({ ...form, parentNationality: e.target.value })}
                  />
                </label>

                <label className="block text-sm space-y-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {t('admission.parentNationalId', 'الرقم القومي / رقم جواز السفر لولي الأمر')}
                  </span>
                  <input
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                    value={form.parentNationalId}
                    onChange={(e) => setForm({ ...form, parentNationalId: e.target.value })}
                    placeholder="رقم بطاقة الرقم القومي أو الجواز"
                  />
                </label>
              </div>

              <label className="block text-sm space-y-1">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {t('admission.parentEmployer', 'جهة العمل / عنوان المهنة الأب')}
                </span>
                <input
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                  value={form.parentEmployer}
                  onChange={(e) => setForm({ ...form, parentEmployer: e.target.value })}
                  placeholder="المهنة وعنوان العمل"
                />
              </label>
            </div>

            {/* Mother Section (EXTRACTED FROM IMAGE) */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                <User className="w-4 h-4" />
                <span>{t('admission.motherSection', "بيانات الأم (Mother's Details - من الاستمارة)")}</span>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <label className="block text-sm space-y-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {t('admission.motherName', 'اسم الأم بالكامل (MOTHER\'S NAME)')}
                  </span>
                  <input
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                    value={form.motherName}
                    onChange={(e) => setForm({ ...form, motherName: e.target.value })}
                    placeholder="اسم الأم الرباعي"
                  />
                </label>

                <label className="block text-sm space-y-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {t('admission.motherNationality', 'الجنسية (NATIONALITY)')}
                  </span>
                  <input
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                    value={form.motherNationality}
                    onChange={(e) => setForm({ ...form, motherNationality: e.target.value })}
                  />
                </label>

                <label className="block text-sm space-y-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {t('admission.motherPhone', 'الهاتف (TELEPHONE)')}
                  </span>
                  <input
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                    value={form.motherPhone}
                    onChange={(e) => setForm({ ...form, motherPhone: e.target.value })}
                    placeholder="رقم هاتف الأم"
                  />
                </label>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block text-sm space-y-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {t('admission.motherOccupation', 'المهنة (OCCUPATION)')}
                  </span>
                  <input
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                    value={form.motherOccupation}
                    onChange={(e) => setForm({ ...form, motherOccupation: e.target.value })}
                    placeholder="مهنة / وظيفة الأم"
                  />
                </label>

                <label className="block text-sm space-y-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {t('admission.motherEmployerAddress', 'عنوان العمل (BUSINESS ADDRESS)')}
                  </span>
                  <input
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                    value={form.motherEmployerAddress}
                    onChange={(e) => setForm({ ...form, motherEmployerAddress: e.target.value })}
                    placeholder="عنوان جهة عمل الأم"
                  />
                </label>
              </div>
            </div>

            {/* Emergency Contact Section (EXTRACTED FROM IMAGE) */}
            <div className="bg-amber-500/5 dark:bg-amber-500/10 p-5 rounded-2xl border border-amber-500/20 space-y-4">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm">
                <Phone className="w-4 h-4" />
                <span>{t('admission.emergencySection', 'عنوان أقرب شخص الاتصال به عند الطوارئ (Emergency Contact)')}</span>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <label className="block text-sm space-y-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {t('admission.emergencyContactName', 'اسم شخص الطوارئ')}
                  </span>
                  <input
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                    value={form.emergencyContactName}
                    onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })}
                    placeholder="الاسم الكامل"
                  />
                </label>

                <label className="block text-sm space-y-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {t('admission.emergencyContactRelation', 'صلة القرابة')}
                  </span>
                  <input
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                    value={form.emergencyContactRelation}
                    onChange={(e) => setForm({ ...form, emergencyContactRelation: e.target.value })}
                    placeholder="مثال: عم الطالب / الخال"
                  />
                </label>

                <label className="block text-sm space-y-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {t('admission.emergencyContactPhone', 'هاتف شخص الطوارئ')}
                  </span>
                  <input
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                    value={form.emergencyContactPhone}
                    onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })}
                    placeholder="رقم الهاتف للطوارئ"
                  />
                </label>
              </div>

              <label className="block text-sm space-y-1">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {t('admission.emergencyContactAddress', 'عنوان أقرب شخص للطوارئ')}
                </span>
                <input
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                  value={form.emergencyContactAddress}
                  onChange={(e) => setForm({ ...form, emergencyContactAddress: e.target.value })}
                  placeholder="العنوان وملاحظات الوصول"
                />
              </label>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  {t('admission.steps.documents', 'رفع المستندات المطلوبة من ولي الأمر')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  يرجى إرفاق المستندات الرسمية للطالب وولي الأمر (المستندات المقبولة: PDF, JPG, PNG بحجم أقصى 5MB)
                </p>
              </div>
            </div>

            {requirementsLoading ? (
              <LoadingSpinner showLabel label={t('states.loadingContent', 'Loading content, please wait…')} />
            ) : requirementsError ? (
              <ErrorState
                compact
                onRetry={() => refetchRequirements()}
              />
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requiredDocumentsList.map((doc) => {
                const currentFile = documentFiles[doc.code];
                return (
                  <div
                    key={doc.code}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                      currentFile
                        ? 'bg-emerald-500/5 border-emerald-500/40 dark:bg-emerald-950/20'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{doc.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                              {doc.title}
                            </h4>
                            {doc.required ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                هام
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                                اختياري
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                            {doc.desc}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
                      {currentFile ? (
                        <div className="flex items-center justify-between w-full gap-2">
                          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 truncate">
                            <FileCheck2 className="w-4 h-4 shrink-0" />
                            <span className="truncate">{currentFile.name}</span>
                            <span className="text-[10px] text-slate-400">
                              ({(currentFile.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleFileChange(doc.code, null)}
                            className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                            title="حذف المستند"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold transition-all">
                          <Paperclip className="w-3.5 h-3.5 text-amber-500" />
                          <span>اختر ملف مرفق</span>
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0] || null;
                              if (f) handleFileChange(doc.code, f);
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            )}
          </div>
        )}

        {/* STEP 4: MEDICAL & HEALTH CHECKLIST */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <HeartPulse className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  {t('admission.healthTitle', 'السجل الطبي والحالة الصحية للطالب')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('admission.healthSubtitle', 'هل يعاني الطالب من أي من الحالات الآتية (نعم / لا)؟ يرجى الفحص بدقة لسلامة الطالب')}
                </p>
              </div>
            </div>

            {/* Health Conditions Interactive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {HEALTH_CONDITIONS_LIST.map((item) => {
                const isChecked = !!form.healthConditions[item.key];
                return (
                  <div
                    key={item.key}
                    onClick={() => toggleHealthCondition(item.key, !isChecked)}
                    className={`cursor-pointer select-none p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isChecked
                        ? 'bg-rose-500/10 border-rose-500/40 text-rose-700 dark:text-rose-300 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{item.icon}</span>
                      <span className="text-xs font-semibold">
                        {t(item.labelKey, item.key)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          isChecked
                            ? 'bg-rose-500 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {isChecked ? t('admission.yes', 'نعم') : t('admission.no', 'لا')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Allergy toggle & details */}
            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-500"
                  checked={form.hasAllergy}
                  onChange={(e) => setForm({ ...form, hasAllergy: e.target.checked })}
                />
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {t('admission.hasAllergy', 'الحساسية: إذا كانت هناك حساسية يرجى تحديد خانة نعم وذكر النوع')}
                </span>
              </label>

              {form.hasAllergy && (
                <textarea
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl p-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-amber-500"
                  rows={2}
                  value={form.allergyDetails}
                  onChange={(e) => setForm({ ...form, allergyDetails: e.target.value })}
                  placeholder={t('admission.allergyDetails', 'اذكر نوع الحساسية (حساسية طعام، طعام معين، أدوية...)')}
                />
              )}
            </div>

            {/* Detailed Health Notes */}
            <label className="block text-sm space-y-1">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {t('admission.healthNotes', 'ملاحظات صحية خاصة تذكر بالتفصيل')}
              </span>
              <textarea
                className="w-full border border-slate-300 dark:border-slate-700 rounded-xl p-3.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-amber-500 transition-all"
                rows={3}
                value={form.healthNotes}
                onChange={(e) => setForm({ ...form, healthNotes: e.target.value })}
                placeholder={t(
                  'admission.healthNotesPlaceholder',
                  'اكتب أي ملاحظات طبية أو علاجات دورية يحتاجها الطالب...'
                )}
              />
            </label>

            {/* Special Needs Option */}
            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-500"
                  checked={form.specialNeeds}
                  onChange={(e) => setForm({ ...form, specialNeeds: e.target.checked })}
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t('admission.specialNeeds', 'هل يحتاج الطالب لرعاية تعليمية خاصة؟')}
                </span>
              </label>

              {form.specialNeeds && (
                <textarea
                  className="mt-3 w-full border border-slate-300 dark:border-slate-700 rounded-xl p-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
                  rows={2}
                  value={form.specialNeedsDetails}
                  onChange={(e) => setForm({ ...form, specialNeedsDetails: e.target.value })}
                  placeholder={t('admission.specialNeedsDetails', 'تفاصيل الدعم المطلوب')}
                />
              )}
            </div>
          </div>
        )}

        {/* STEP 5: POLICIES & DECLARATION */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  {t('admission.policiesTitle', 'إقرار وتوقيع ولي الأمر - أنظمة وقوانين مدرسة مانهاتن الخاصة')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('admission.policiesSubtitle', 'يرجى قراءة البنود واللوائح التنظيمية التالية بعناية قبل التوقيع والاعتماد')}
                </p>
              </div>
            </div>

            {/* Rules Card Box */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 text-xs leading-relaxed max-h-72 overflow-y-auto custom-scrollbar">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm mb-2">
                <ShieldAlert className="w-4 h-4" />
                <span>إقرار وتعهد ولي الأمر:</span>
              </div>
              <ul className="space-y-2.5 text-slate-700 dark:text-slate-300 list-disc list-inside">
                <li>أقر أنا ولي أمر الطالب بأن المعلومات المدونة أعلاه هي صحيحة وعلى مسؤوليتي وأوافق على تسجيل ابني/ابنتي في المدرسة.</li>
                <li>ألتزم بجميع تعليمات المدرسة لهذا العام الدراسي ويعتبر هذا الالتزام جزءاً لا يتجزأ من هذا الطلب لالتحاق الطالب في المدرسة.</li>
                <li>أعلم أن الخصومات تقتصر على الرسوم التعليمية السنوية فقط ولا تشمل المواصلات ورسوم التسجيل أو الكتب والزي.</li>
                <li>يسمح فقط بالخصم النقدي.</li>
                <li>في حالة انسحاب الطالب من المدرسة: لا يُرد أي مبلغ من الأقساط المدفوعة بعد الدوام المدرسي المعلن عنه في وزارة التربية والتعليم، بينما أقساط رسوم التعليم والمواصلات مسترجعة للفصل الدراسي الذي لم يبدأ به.</li>
                <li>رسوم التعليم لا تشمل رسوم الرحلات أو الأنشطة اللاصفية.</li>
                <li>رسوم التعليم لن تخفض في حال غياب الطالب عن الدوام المدرسي بداعي المرض أو السفر أو لأي من الأسباب.</li>
                <li>وأقر أنا بالتزامي بسداد الأقساط في موعدها وللمدرسة الحق في اتخاذ أي إجراء تراه في حالة التأخير.</li>
                <li>علماً بأن آخر قسط للمدرسة هو بداية العام بتاريخ 9/1 من السنة الدراسية.</li>
              </ul>
            </div>

            {/* Official Acceptance Banner */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-1">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                "أنا الموقع أدناه أوافق على أنظمة وقوانين مدرسة مانهاتن الخاصة أعلاه وعليه أوقع"
              </p>
              <p className="text-[11px] font-mono text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                I AGREE TO ACCEPT AND ABIDE BY THE RULES AND REGULATION FOR MANHATTAN SCHOOL
              </p>
            </div>

            {/* Signatory Inputs */}
            <div className="grid sm:grid-cols-2 gap-5 pt-2">
              <label className="block text-sm space-y-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {t('admission.signedByName', 'الاسم الكامل لولي الأمر الموقّع')} <span className="text-red-500">*</span>
                </span>
                <input
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-semibold"
                  value={form.signedByName}
                  onChange={(e) => setForm({ ...form, signedByName: e.target.value })}
                  placeholder="أدخل الاسم الرباعي لولي الأمر"
                  required
                />
              </label>

              <label className="block text-sm space-y-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {t('admission.signedDate', 'تاريخ التسجيل والتوقيع')}
                </span>
                <input
                  type="date"
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                  value={form.signedDate}
                  onChange={(e) => setForm({ ...form, signedDate: e.target.value })}
                  required
                />
              </label>
            </div>

            <label className="flex items-start gap-3 cursor-pointer p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
              <input
                type="checkbox"
                className="mt-0.5 w-5 h-5 text-amber-500 rounded border-slate-300 focus:ring-amber-500"
                checked={form.termsAccepted}
                onChange={(e) => setForm({ ...form, termsAccepted: e.target.checked })}
                required
              />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                {t('admission.termsAccepted', 'أقر بموافقتي الكاملة والتزامي بجميع أنظمة وقوانين مدرسة مانهاتن للغات المبينة أعلاه.')}
              </span>
            </label>
          </div>
        )}

        {/* STEP 6: REVIEW & SUBMIT TO ADMIN */}
        {step === 6 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  {t('admission.steps.review', 'مراجعة وتأكيد كافة بيانات الطلب قبل الإرسال للإدارة')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  يرجى التأكد من صحة كافة البيانات والملفات المرفقة قبل الاعتماد النهائي وإرسال الطلب للإدارة
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              {/* Student Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 text-sm">
                  <User className="w-4 h-4" />
                  <span>بيانات الطالب</span>
                </div>
                <p><strong>الاسم:</strong> {form.studentFirstName} {form.studentLastName}</p>
                <p><strong>تاريخ الميلاد:</strong> {form.dateOfBirth}</p>
                <p><strong>المرحلة الدراسية:</strong> {t(`grades.${form.gradeLevel}`, form.gradeLevel)}</p>
                <p><strong>الجنسية:</strong> {form.nationality || 'غير محدد'}</p>
                <p><strong>المدرسة السابقة:</strong> {form.previousSchool || 'لا يوجد'}</p>
              </div>

              {/* Family Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1.5 text-sm">
                  <Users className="w-4 h-4" />
                  <span>بيانات الوالدين والاتصال</span>
                </div>
                <p><strong>ولي الأمر (الأب):</strong> {form.parentName} ({form.parentPhone})</p>
                <p><strong>البريد:</strong> {form.parentEmail}</p>
                <p><strong>اسم الأم:</strong> {form.motherName || 'غير مدخل'}</p>
                <p><strong>هاتف الأم:</strong> {form.motherPhone || 'غير مدخل'}</p>
                <p><strong>هاتف الطوارئ:</strong> {form.emergencyContactPhone || 'غير مدخل'}</p>
              </div>
            </div>

            {/* Documents Summary Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 text-sm">
                <Upload className="w-4 h-4" />
                <span>المستندات والملفات المرفقة ({Object.values(documentFiles).filter(Boolean).length})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(documentFiles).filter(([, f]) => !!f).length === 0 ? (
                  <span className="text-slate-500">لم يتم إرفاق ملفات في هذه الخطوة (يمكن إرفاقها لاحقاً)</span>
                ) : (
                  Object.entries(documentFiles)
                    .filter(([, f]) => !!f)
                    .map(([code, file]) => {
                      const docDef = requiredDocumentsList.find((d) => d.code === code);
                      return (
                        <span key={code} className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-500/20 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{docDef?.title || code}: {file?.name}</span>
                        </span>
                      );
                    })
                )}
              </div>
            </div>

            {/* Health Summary Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 text-sm">
                <HeartPulse className="w-4 h-4" />
                <span>الحالة الصحية للطالب</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(form.healthConditions).filter(([, v]) => v).length === 0 ? (
                  <span className="text-slate-500">لا يعاني من أي حالات صحية خاصة مسجلة</span>
                ) : (
                  Object.entries(form.healthConditions)
                    .filter(([, v]) => v)
                    .map(([k]) => (
                      <span key={k} className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-300 font-semibold border border-rose-500/20">
                        {t(`admission.healthConditions.${k}`, k)}
                      </span>
                    ))
                )}
              </div>
              {form.healthNotes && (
                <p className="pt-1"><strong>ملاحظات صحية:</strong> {form.healthNotes}</p>
              )}
            </div>

            {/* Signature & Declaration Summary */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>تم الموافقة والتوقيع إلكترونياً بواسطة: {form.signedByName} بتاريخ {form.signedDate}</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                تم الإقرار بالالتزام بجميع أنظمة وقوانين مدرسة مانهاتن للغات للعام الدراسي 2026-2027.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Validation Hint Alert */}
      {validationHint && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center gap-3 animate-pulse">
          <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>{validationHint}</span>
        </div>
      )}

      {/* Mutation Error Alert */}
      {mutation.isError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>{getApiErrorMessage(mutation.error, 'حدث خطأ أثناء تقديم الطلب. يرجى المحاولة مرة أخرى.')}</span>
        </div>
      )}

      {/* Upload Errors Alert */}
      {uploadErrors.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-semibold space-y-1">
          <div className="flex items-center gap-2 font-bold">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>{t('admission.uploadPartialFailure', 'Some documents failed to upload')}</span>
          </div>
          {uploadErrors.map((err, i) => (
            <div key={i} className="ps-6">{err}</div>
          ))}
        </div>
      )}

      {/* Navigation Footer Buttons */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="outline"
          onClick={back}
          disabled={step === 1}
          className="rounded-xl px-6"
        >
          {t('common.back', 'السابق')}
        </Button>

        <Button
          variant="gold"
          onClick={next}
          disabled={mutation.isPending || !stepValid}
          className="rounded-xl px-8 shadow-lg shadow-amber-500/20 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {step === 6
            ? (mutation.isPending ? t('common.submitting', 'جاري إرسال الطلب للإدارة...') : t('admission.createAndContinue', 'إرسال واعتماد طلب القبول'))
            : t('common.next', 'التالي')}
        </Button>
      </div>
    </div>
  );
}
