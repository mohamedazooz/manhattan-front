export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  permissions?: string[];
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  permissions: string[];
  exp: number;
}

export interface LandingHero {
  id: string;
  title: string;
  titleAr?: string;
  subtitle?: string;
  subtitleAr?: string;
  ctaText?: string;
  ctaTextAr?: string;
  ctaLink?: string;
  imageUrl?: string;
  isActive?: boolean;
}

export interface LandingSection {
  id: string;
  key: string;
  title: string;
  titleAr?: string;
  content: string;
  contentAr?: string;
  imageUrl?: string;
  sortOrder: number;
  status?: string;
}

export interface EducationProgram {
  id: string;
  title: string;
  titleAr?: string;
  slug: string;
  summary?: string;
  summaryAr?: string;
  content: string;
  contentAr?: string;
  level: string;
  coverImageUrl?: string;
  status: string;
  sortOrder?: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogImage?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  titleAr?: string;
  slug: string;
  content: string;
  contentAr?: string;
  coverImageUrl?: string;
  status: string;
  category?: { id: string; name: string };
  author?: { fullName: string };
  createdAt: string;
  comments?: Array<{ id: string; content: string; status: string; createdAt: string; author?: { fullName: string } }>;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogImage?: string;
}

export interface Job {
  id: string;
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  requirements: string;
  requirementsAr?: string;
  location: string;
  locationAr?: string;
  employmentType: string;
  status: string;
}

export interface StaticPage {
  id: string;
  slug: string;
  title: string;
  titleAr?: string;
  content: string;
  contentAr?: string;
  status: string;
  sortOrder?: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogImage?: string;
}

export interface SeoConfig {
  id: string;
  siteTitle: string;
  siteTitleAr?: string;
  siteDescription?: string;
  siteDescriptionAr?: string;
  defaultKeywords?: string;
  defaultOgImage?: string;
  twitterHandle?: string;
  googleAnalyticsId?: string;
  googleSearchConsoleTag?: string;
  updatedAt?: string;
}

export interface Admission {
  id: string;
  studentFirstName: string;
  studentLastName: string;
  dateOfBirth: string;
  gradeLevel: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  nationality?: string;
  gender?: string;
  previousSchool?: string;
  languagesSpoken?: string;
  specialNeeds?: boolean;
  specialNeedsDetails?: string;
  academicYear?: string;
  siblingEnrolled?: boolean;
  parentRelationship?: string;
  parentNationality?: string;
  parentEmployer?: string;
  motherName?: string;
  motherNationality?: string;
  motherOccupation?: string;
  motherEmployerAddress?: string;
  motherPhone?: string;
  emergencyContactAddress?: string;
  emergencyContactPhone?: string;
  emergencyContactName?: string;
  emergencyContactRelation?: string;
  streetAddress?: string;
  city?: string;
  governorate?: string;
  nationalId?: string;
  parentNationalId?: string;
  healthConditions?: Record<string, boolean> | any;
  healthNotes?: string;
  hasAllergy?: boolean;
  allergyDetails?: string;
  enrollmentDate?: string;
  signedByName?: string;
  signedDate?: string;
  termsAccepted?: boolean;
  documentsCompletedAt?: string | null;
  currentStep?: number;
  status: string;
  referenceNumber?: string | null;
  createdAt?: string;
  documents?: Array<{ id: string; fileName: string; fileUrl: string; documentType: string }>;
  notes?: Array<{ id: string; noteContent: string; author: { fullName: string }; createdAt: string }>;
  statusHistory?: Array<{
    id: string;
    fromStatus: string;
    toStatus: string;
    note?: string | null;
    createdAt: string;
    changedBy?: { fullName: string; email: string } | null;
  }>;
}

export interface JobApplication {
  id: string;
  referenceNumber?: string | null;
  fullName: string;
  email: string;
  phone: string;
  coverLetter?: string;
  yearsExperience?: number;
  curriculumExperience?: string;
  subjectsTaught?: string;
  highestQualification?: string;
  teachingLicenseNo?: string;
  availableStartDate?: string;
  nationalId?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  streetAddress?: string;
  city?: string;
  governorate?: string;
  university?: string;
  graduationYear?: number;
  major?: string;
  noticePeriod?: string;
  expectedSalary?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  safeguardingAccepted?: boolean;
  pledgeOriginalsAtInterview?: boolean;
  currentStep?: number;
  status: string;
  rating?: number | null;
  interviewDate?: string | null;
  interviewLocation?: string | null;
  interviewNotes?: string | null;
  matchScore?: number | null;
  createdAt?: string;
  job?: Job;
  documents?: Array<{ id: string; fileName: string; fileUrl: string; documentType: string }>;
  comments?: Array<{ id: string; comment: string; createdAt: string; author?: { fullName: string } }>;
  statusHistory?: Array<{
    id: string;
    fromStatus: string;
    toStatus: string;
    note?: string | null;
    createdAt: string;
    changedBy?: { fullName: string; email: string } | null;
  }>;
}

export interface DashboardStats {
  admissions?: {
    total: number;
    draft?: number;
    submitted: number;
    underReview: number;
    accepted: number;
    rejected: number;
    recent: Array<{
      id: string;
      referenceNumber?: string | null;
      studentFirstName: string;
      studentLastName: string;
      gradeLevel: string;
      status: string;
      parentEmail: string;
      createdAt: string;
      updatedAt: string;
    }>;
  };
  blog?: {
    published: number;
    draft: number;
    pendingComments: number;
  };
  jobs?: {
    open: number;
    closed: number;
    totalApplications: number;
    byStatus?: Record<string, number>;
    recentApplications: Array<{
      id: string;
      status: string;
      fullName: string;
      email: string;
      createdAt: string;
      job?: { id: string; title: string; titleAr?: string };
    }>;
  };
  gallery?: { published: number; draft: number; total: number };
  education?: { published: number; draft: number; total: number };
  pages?: { published: number; draft: number; total: number };
  aboutUs?: { published: number; draft: number; total: number };
  landing?: { activeHeroes: number; sectionsPublished: number; sectionsDraft: number };
  inquiries?: { new: number; read?: number; replied?: number; archived?: number; total?: number };
  notifications?: { unread: number; total: number };
  email?: { templates: number; failedLogs: number; sentLogs: number };
  users?: { active: number; suspended: number; total?: number };
  roles?: { total: number };
  admissionRequirements?: { active: number; total: number };
  jobRequirements?: { active: number; total: number };
  content?: { totalDrafts: number };
  settings?: { configured: boolean };
  seo?: { configured: boolean };
  audit?: { recentCount: number };
}

export interface DashboardModuleMeta {
  moduleKey: string;
  labelEn: string;
  labelAr: string;
  adminRoute: string;
  permission: string;
  statsKey: string;
}

export type AuditCategory =
  | 'auth'
  | 'admissions'
  | 'jobs'
  | 'content'
  | 'users'
  | 'system'
  | 'inquiries'
  | 'other';

export type AuditSeverity = 'info' | 'success' | 'warning' | 'danger';

export interface AuditLogEntry {
  id: string;
  action: string;
  actionLabel?: string;
  actionLabelEn?: string;
  details?: string | null;
  detailsLabel?: string | null;
  detailsLabelEn?: string | null;
  category?: AuditCategory;
  moduleLabel?: string;
  moduleLabelEn?: string;
  severity?: AuditSeverity;
  ipAddress?: string | null;
  createdAt: string;
  user?: { id: string; email: string; fullName: string } | null;
}

export interface AuditLogResponse {
  items: AuditLogEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  status: 'UNREAD' | 'READ' | 'ARCHIVED';
  userId?: string | null;
  entityType?: 'CONTACT_INQUIRY' | 'ADMISSION' | 'JOB_APPLICATION' | 'BLOG_COMMENT' | null;
  entityId?: string | null;
  createdAt: string;
  user?: { id: string; email: string; fullName: string } | null;
}

export interface GalleryImage {
  id: string;
  title: string;
  titleAr?: string;
  caption?: string;
  captionAr?: string;
  imageUrl: string;
  altText?: string;
  category: string;
  status: string;
  sortOrder?: number;
}

export interface FormDocument {
  id: string;
  category: 'STUDENT' | 'STAFF';
  subCategory?: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  title?: string;
  description?: string;
  requiredStatus: 'REQUIRED' | 'TRANSFER' | 'OPTIONAL';
  downloadUrl?: string;
  downloadName?: string;
  iconType?: string;
  status: string;
  sortOrder?: number;
}
