export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
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
  slug: string;
  summary?: string;
  content: string;
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
  slug: string;
  content: string;
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
  content: string;
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
  healthConditions?: Record<string, boolean> | any;
  healthNotes?: string;
  signedByName?: string;
  signedDate?: string;
  termsAccepted?: boolean;
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
  fullName: string;
  email: string;
  phone: string;
  coverLetter?: string;
  yearsExperience?: number;
  curriculumExperience?: string;
  subjectsTaught?: string;
  highestQualification?: string;
  teachingLicenseNo?: string;
  safeguardingAccepted?: boolean;
  currentStep?: number;
  status: string;
  createdAt?: string;
  job?: Job;
  documents?: Array<{ id: string; fileName: string; fileUrl: string; documentType: string }>;
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

export interface AuditLogEntry {
  id: string;
  action: string;
  actionLabel?: string;
  details?: string | null;
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
  createdAt: string;
  user?: { id: string; email: string; fullName: string } | null;
}
