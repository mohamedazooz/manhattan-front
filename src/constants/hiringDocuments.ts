export interface HiringDocumentDef {
  key: string;
  code: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  badgeAr?: string;
  badgeEn?: string;
  icon: string;
  requiredFor: 'ALL' | 'MALES' | 'NON_EDUCATION_GRADUATES' | 'FEMALES';
  isMandatory?: boolean;
}

export const HIRING_DOCUMENTS: HiringDocumentDef[] = [
  {
    key: 'criminal_record',
    code: 'CRIMINAL_RECORD',
    titleAr: '1- الفيش الجنائي',
    titleEn: '1. Criminal Record / Police Clearance',
    descriptionAr: 'صحيفة الحالة الجنائية موجهة لمدرسة منهاتن للغات (سارية المفعول).',
    descriptionEn: 'Official police clearance certificate addressed to Manhattan Language School.',
    icon: 'ShieldCheck',
    requiredFor: 'ALL',
    isMandatory: true,
  },
  {
    key: 'birth_certificate',
    code: 'BIRTH_CERTIFICATE',
    titleAr: '2- أصل شهادة الميلاد',
    titleEn: '2. Original Birth Certificate',
    descriptionAr: 'شهادة الميلاد كمبيوتر الأصلية.',
    descriptionEn: 'Original computer birth certificate.',
    icon: 'FileText',
    requiredFor: 'ALL',
    isMandatory: false,
  },
  {
    key: 'graduation_certificate',
    code: 'GRADUATION_CERTIFICATE',
    titleAr: '3- أصل شهادة التخرج',
    titleEn: '3. Original Graduation Certificate',
    descriptionAr: 'أصل شهادة المؤهل الدراسي الجامعي/البكالوريوس/الماجستير.',
    descriptionEn: 'Original degree/graduation certificate (Bachelor/Master).',
    icon: 'GraduationCap',
    requiredFor: 'ALL',
    isMandatory: true,
  },
  {
    key: 'educational_diploma',
    code: 'EDUCATIONAL_DIPLOMA',
    titleAr: '4- دبلومة تربوى لغير خريجين كليات التربية',
    titleEn: '4. Educational Diploma (For Non-Education Graduates)',
    descriptionAr: 'مطلوبة للمدرسين من خريجي الكليات غير التربوية.',
    descriptionEn: 'Required for teachers who graduated from non-educational faculties.',
    badgeAr: 'خاص بغير كليات التربية',
    badgeEn: 'Non-Education Majors',
    icon: 'Award',
    requiredFor: 'NON_EDUCATION_GRADUATES',
    isMandatory: false,
  },
  {
    key: 'national_id',
    code: 'NATIONAL_ID',
    titleAr: '5- صورة البطاقة الشخصية',
    titleEn: '5. Copy of National ID',
    descriptionAr: 'صورة بطاقة الرقم القومي سارية المفعول (الوجهين).',
    descriptionEn: 'Valid National ID card copy (Front & Back).',
    icon: 'CreditCard',
    requiredFor: 'ALL',
    isMandatory: true,
  },
  {
    key: 'personal_photos',
    code: 'PERSONAL_PHOTOS',
    titleAr: '6- 8 صور شخصية',
    titleEn: '6. 8 Personal Photographs',
    descriptionAr: 'عدد 8 صور شخصية حديثة بخلفية بيضاء (4×6).',
    descriptionEn: '8 recent passport-sized photographs (white background).',
    icon: 'Image',
    requiredFor: 'ALL',
    isMandatory: false,
  },
  {
    key: 'military_status',
    code: 'MILITARY_STATUS',
    titleAr: '7- موقف التجنيد بالنسبة للذكور',
    titleEn: '7. Military Status Certificate (Males)',
    descriptionAr: 'شهادة أداء الخدمة العسكرية أو الإعفاء النهائى/الاستثناء (للذكور).',
    descriptionEn: 'Military completion or exemption certificate for male applicants.',
    badgeAr: 'للذكور فقط',
    badgeEn: 'Males Only',
    icon: 'FileCheck',
    requiredFor: 'MALES',
    isMandatory: false,
  },
  {
    key: 'public_service',
    code: 'PUBLIC_SERVICE',
    titleAr: '8- شهادة الخدمة العامة',
    titleEn: '8. Public Service Certificate',
    descriptionAr: 'شهادة أداء الخدمة العامة أو الإعفاء منها (للإناث والذكور إن وجد).',
    descriptionEn: 'Public Service completion or exemption certificate.',
    icon: 'FileBadge',
    requiredFor: 'ALL',
    isMandatory: false,
  },
  {
    key: 'insurance_form_111',
    code: 'INSURANCE_FORM_111',
    titleAr: '9- استمارة 111 تأمينات',
    titleEn: '9. Form 111 Insurance / Medical Check',
    descriptionAr: 'استمارة الفحص الطبي (نموذج 111 تأمينات صحية).',
    descriptionEn: 'Official health & medical examination Form 111.',
    icon: 'Stethoscope',
    requiredFor: 'ALL',
    isMandatory: false,
  },
  {
    key: 'labor_card',
    code: 'LABOR_CARD',
    titleAr: '10- كعب عمل',
    titleEn: '10. Labor Work Card (Ka\'b \'Amal)',
    descriptionAr: 'كعب عمل صادر من مكتب العمل التابع لمحل الإقامة.',
    descriptionEn: 'Work Labor card issued by the regional employment bureau.',
    icon: 'Briefcase',
    requiredFor: 'ALL',
    isMandatory: false,
  },
  {
    key: 'insurance_print',
    code: 'INSURANCE_PRINT',
    titleAr: '11- برنت تأميني',
    titleEn: '11. Social Insurance Printout',
    descriptionAr: 'طباعة الرقم التأميني وموقف الاشتراكات من الهيئة القومية للتأمين الاجتماعي.',
    descriptionEn: 'Official insurance number & history printout from Social Insurance Authority.',
    icon: 'Printer',
    requiredFor: 'ALL',
    isMandatory: false,
  },
];

export function getMandatoryHiringDocumentCodes(): string[] {
  return HIRING_DOCUMENTS.filter((doc) => doc.isMandatory).map((doc) => doc.code);
}

export function isDocumentUploaded(
  code: string,
  documentFiles: Record<string, File | null>,
  uploadedDocTypes: Set<string>,
): boolean {
  return !!documentFiles[code] || uploadedDocTypes.has(code);
}
