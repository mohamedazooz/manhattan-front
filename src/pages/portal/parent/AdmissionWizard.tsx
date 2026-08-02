import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
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
  Briefcase
} from 'lucide-react';
import { admissionsApi } from '../../../api';
import { Button } from '../../../components/ui/Button';
import { StepIndicator } from '../../../components/ui/StepIndicator';
import { useAuth } from '../../../lib/auth';

const GRADE_OPTIONS = [
  'Kindergarten',
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
  'Grade 11',
  'Grade 12'
];

const HEALTH_CONDITIONS_LIST = [
  { key: 'hearing', labelKey: 'admission.healthConditions.hearing', icon: '👂' },
  { key: 'asthma', labelKey: 'admission.healthConditions.asthma', icon: '🫁' },
  { key: 'heart', labelKey: 'admission.healthConditions.heart', icon: '❤️' },
  { key: 'adhd', labelKey: 'admission.healthConditions.adhd', icon: '⚡' },
  { key: 'epilepsy', labelKey: 'admission.healthConditions.epilepsy', icon: '🧠' },
  { key: 'behavioral', labelKey: 'admission.healthConditions.behavioral', icon: '🤝' },
  { key: 'anemia', labelKey: 'admission.healthConditions.anemia', icon: '🩸' },
  { key: 'dental', labelKey: 'admission.healthConditions.dental', icon: '🦷' },
  { key: 'speech', labelKey: 'admission.healthConditions.speech', icon: '🗣️' },
  { key: 'diabetes', labelKey: 'admission.healthConditions.diabetes', icon: '💉' },
  { key: 'vision', labelKey: 'admission.healthConditions.vision', icon: '👁️' },
  { key: 'headInjury', labelKey: 'admission.healthConditions.headInjury', icon: '🤕' },
  { key: 'other', labelKey: 'admission.healthConditions.other', icon: '📋' },
];

export function AdmissionWizard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    // Step 1: Student
    studentFirstName: '',
    studentLastName: '',
    dateOfBirth: '',
    gradeLevel: 'Kindergarten',
    nationality: '',
    gender: '',
    academicYear: '2026-2027',
    previousSchool: '',
    languagesSpoken: 'Arabic, English',
    siblingEnrolled: false,

    // Step 2: Parents & Emergency
    parentName: user?.fullName || '',
    parentEmail: user?.email || '',
    parentPhone: '',
    parentRelationship: 'father',
    parentNationality: '',
    parentEmployer: '',

    motherName: '',
    motherNationality: '',
    motherOccupation: '',
    motherEmployerAddress: '',
    motherPhone: '',

    emergencyContactAddress: '',
    emergencyContactPhone: '',

    // Step 3: Medical / Health Record
    hasAllergy: false,
    allergyDetails: '',
    healthConditions: HEALTH_CONDITIONS_LIST.reduce<Record<string, boolean>>((acc, item) => {
      acc[item.key] = false;
      return acc;
    }, {}),
    healthNotes: '',
    specialNeeds: false,
    specialNeedsDetails: '',

    // Step 4: Declaration & Signature
    signedByName: user?.fullName || '',
    signedDate: new Date().toISOString().split('T')[0],
    termsAccepted: false,
  });

  const steps = [
    t('admission.steps.student', 'بيانات الطالب'),
    t('admission.steps.family', 'بيانات الأسرة والطوارئ'),
    t('admission.steps.health', 'السجل الطبي والصحي'),
    t('admission.steps.policies', 'اللوائح والتوقيع'),
    t('admission.steps.review', 'مراجعة واعتماد الطلب'),
  ];

  const mutation = useMutation({
    mutationFn: () =>
      admissionsApi.create({
        ...form,
        healthConditions: form.healthConditions,
        currentStep: step,
      }),
    onSuccess: ({ data }) => navigate(`/portal/parent/admissions/${data.id}`),
  });

  function toggleHealthCondition(key: string, val: boolean) {
    setForm((prev) => ({
      ...prev,
      healthConditions: {
        ...prev.healthConditions,
        [key]: val,
      },
    }));
  }

  function next() {
    if (step < 5) setStep(step + 1);
    else mutation.mutate();
  }

  function back() {
    if (step > 1) setStep(step - 1);
  }

  const isStep4Valid = form.termsAccepted && form.signedByName.trim() !== '';

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

              <div className="grid sm:grid-cols-2 gap-4">
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
          </div>
        )}

        {/* STEP 3: MEDICAL & HEALTH CHECKLIST (Extracted 13 Health Conditions) */}
        {step === 3 && (
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
                  placeholder={t('admission.allergyDetails', 'اذكر نوع الحساسية (حساسية طعام، طعام معين، أدوية...)' )}
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

        {/* STEP 4: POLICIES & DECLARATION (Extracted 9 Points & Rules) */}
        {step === 4 && (
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

        {/* STEP 5: REVIEW & SUBMIT */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  {t('admission.steps.review', 'مراجعة وتأكيد كافة بيانات الطلب')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  يرجى التأكد من صحة كافة البيانات المدخلة قبل الاعتماد النهائي للإرسال
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
          disabled={mutation.isPending || (step === 4 && !isStep4Valid)}
          className="rounded-xl px-8 shadow-lg shadow-amber-500/20 font-bold"
        >
          {step === 5
            ? (mutation.isPending ? t('common.submitting', 'جاري الإرسال...') : t('admission.createAndContinue', 'إرسال واعتماد الطلب'))
            : t('common.next', 'التالي')}
        </Button>
      </div>
    </div>
  );
}
