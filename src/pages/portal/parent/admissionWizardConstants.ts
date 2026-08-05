export const GRADE_OPTIONS = [
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
];

export const HEALTH_CONDITIONS_LIST = [
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

export const REQUIRED_DOCUMENTS_LIST = [
  {
    code: 'BIRTH_CERTIFICATE',
    title: 'شهادة الميلاد الرقمية / المميكنة',
    titleEn: 'Computerized Birth Certificate',
    desc: 'صورة طبق الأصل من شهادة الميلاد بالرقم القومي للطالب',
    icon: '📄',
    required: true,
  },
  {
    code: 'PREVIOUS_REPORT',
    title: 'أحدث شهادة دراسية / بيان نجاح',
    titleEn: 'Previous School Report',
    desc: 'آخر كشف درجات أو بيان نجاح معتمد من المدرسة السابقة',
    icon: '🎓',
    required: false,
  },
  {
    code: 'STUDENT_PHOTO',
    title: 'صورة شخصية حديثة للطالب',
    titleEn: 'Recent Student Photo',
    desc: 'صورة شخصية بخلفية بيضاء وواضحة المعالم للطالب',
    icon: '🖼️',
    required: true,
  },
  {
    code: 'PARENT_PASSPORT',
    title: 'بطاقة الرقم القومي / جواز سفر ولي الأمر',
    titleEn: 'Parent ID / Passport',
    desc: 'صورة سارية لبطاقة الرقم القومي أو جواز السفر لولي الأمر',
    icon: '🪪',
    required: true,
  },
  {
    code: 'HEALTH_RECORD',
    title: 'البطاقة الصحية',
    titleEn: 'Health Record',
    desc: 'البطاقة الصحية أو الشهادة الطبية الأولية للطالب',
    icon: '🏥',
    required: false,
  },
  {
    code: 'IMMUNIZATION_RECORD',
    title: 'سجل التطعيمات',
    titleEn: 'Immunization Record',
    desc: 'صورة واضحة لسجل أو كارت تطعيمات الطالب المعتمد من الجهة الصحية',
    icon: '💉',
    required: true,
  },
  {
    code: 'SCHOOL_REFERENCE',
    title: 'إفادة / توصية من المدرسة السابقة',
    titleEn: 'School Recommendation Letter',
    desc: 'إفادة حسن سير وسلوك أو خطاب توصية (إن وجد)',
    icon: '📋',
    required: false,
  },
];

export type RequiredDocumentItem = (typeof REQUIRED_DOCUMENTS_LIST)[number];

export function getAdmissionDocumentMeta(code: string): RequiredDocumentItem {
  const found = REQUIRED_DOCUMENTS_LIST.find((doc) => doc.code === code);
  if (found) return found;
  return {
    code,
    title: code.replace(/_/g, ' '),
    titleEn: code.replace(/_/g, ' '),
    desc: '',
    icon: '📄',
    required: true,
  };
}

export type AdmissionWizardFormState = {
  studentFirstName: string;
  studentLastName: string;
  dateOfBirth: string;
  gradeLevel: string;
  nationality: string;
  gender: string;
  nationalId: string;
  academicYear: string;
  previousSchool: string;
  languagesSpoken: string;
  siblingEnrolled: boolean;
  streetAddress: string;
  city: string;
  governorate: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  parentNationalId: string;
  parentRelationship: string;
  parentNationality: string;
  parentEmployer: string;
  motherName: string;
  motherNationality: string;
  motherOccupation: string;
  motherEmployerAddress: string;
  motherPhone: string;
  emergencyContactName: string;
  emergencyContactRelation: string;
  emergencyContactAddress: string;
  emergencyContactPhone: string;
  hasAllergy: boolean;
  allergyDetails: string;
  healthConditions: Record<string, boolean>;
  healthNotes: string;
  specialNeeds: boolean;
  specialNeedsDetails: string;
  signedByName: string;
  signedDate: string;
  termsAccepted: boolean;
};

export function createInitialAdmissionForm(
  user?: { fullName?: string; email?: string } | null,
): AdmissionWizardFormState {
  return {
    studentFirstName: '',
    studentLastName: '',
    dateOfBirth: '',
    gradeLevel: 'Kindergarten',
    nationality: '',
    gender: '',
    nationalId: '',
    academicYear: '2026-2027',
    previousSchool: '',
    languagesSpoken: 'Arabic, English',
    siblingEnrolled: false,
    streetAddress: '',
    city: '',
    governorate: '',
    parentName: user?.fullName || '',
    parentEmail: user?.email || '',
    parentPhone: '',
    parentNationalId: '',
    parentRelationship: 'father',
    parentNationality: '',
    parentEmployer: '',
    motherName: '',
    motherNationality: '',
    motherOccupation: '',
    motherEmployerAddress: '',
    motherPhone: '',
    emergencyContactName: '',
    emergencyContactRelation: '',
    emergencyContactAddress: '',
    emergencyContactPhone: '',
    hasAllergy: false,
    allergyDetails: '',
    healthConditions: HEALTH_CONDITIONS_LIST.reduce<Record<string, boolean>>((acc, item) => {
      acc[item.key] = false;
      return acc;
    }, {}),
    healthNotes: '',
    specialNeeds: false,
    specialNeedsDetails: '',
    signedByName: user?.fullName || '',
    signedDate: new Date().toISOString().split('T')[0],
    termsAccepted: false,
  };
}
