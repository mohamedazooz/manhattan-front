export const LOCAL_PHOTOS = [
  '/photos/photo1.jpeg',
  '/photos/photo2.jpeg',
  '/photos/photo3.jpeg',
  '/photos/photo4.jpeg',
  '/photos/photo5.jpeg',
  '/photos/photo6.jpeg',
  '/photos/photo7.jpeg',
  '/photos/photo8.jpeg',
  '/photos/photo9.jpeg',
  '/photos/photo10.jpeg',
  '/photos/hero1.jpeg',
  '/photos/hero2.jpeg',
  '/photos/hero3.jpeg',
  '/photos/hero4.jpeg',
];

export const PERMISSION_GROUPS: Record<string, { label: string; permissions: string[] }> = {
  content: {
    label: 'إدارة المحتوى والمقالات والميديا',
    permissions: [
      'CREATE_BLOG',
      'UPDATE_BLOG',
      'APPROVE_COMMENTS',
      'MANAGE_EDUCATION',
      'MANAGE_GALLERY',
      'MANAGE_LANDING',
      'MANAGE_ABOUT_US',
    ],
  },
  admissions: {
    label: 'طلبات القبول والتسجيل والطلاب',
    permissions: [
      'VIEW_ALL_ADMISSIONS',
      'UPDATE_ADMISSION_STATUS',
      'ADD_ADMISSION_NOTE',
      'CREATE_ADMISSION',
      'VIEW_OWN_ADMISSION',
      'MANAGE_ADMISSION_REQUIREMENTS',
    ],
  },
  users: {
    label: 'إدارة المستخدمين والأدوار والأمان',
    permissions: ['MANAGE_USERS', 'MANAGE_ROLES'],
  },
  careers: {
    label: 'الوظائف والتوظيف والتقديمات',
    permissions: [
      'MANAGE_JOBS',
      'VIEW_APPLICATIONS',
      'CREATE_JOB_APPLICATION',
      'VIEW_OWN_JOB_APPLICATION',
    ],
  },
  system: {
    label: 'إعدادات النظام والرسائل والتنبيهات',
    permissions: [
      'UPDATE_SYSTEM_CONFIG',
      'VIEW_DASHBOARD',
      'MANAGE_EMAIL_TEMPLATES',
      'MANAGE_NOTIFICATIONS',
    ],
  },
};

export const ROLE_ARABIC_NAMES: Record<string, { ar: string; badge: string }> = {
  ADMIN: { ar: 'مدير النظام الرئيسي', badge: 'bg-purple-100 text-purple-800 border-purple-200' },
  TEACHER: { ar: 'معلم / طاقم تدريس', badge: 'bg-blue-100 text-blue-800 border-blue-200' },
  PARENT: { ar: 'ولي أمر', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  APPLICANT: { ar: 'متقدم لوظيفة', badge: 'bg-amber-100 text-amber-800 border-amber-200' },
  STUDENT: { ar: 'طالب', badge: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  GUEST: { ar: 'زائر', badge: 'bg-slate-100 text-slate-700 border-slate-200' },
};
