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
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogImage?: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string;
  location: string;
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
  status: string;
  createdAt?: string;
  documents?: Array<{ id: string; fileName: string; fileUrl: string; documentType: string }>;
  notes?: Array<{ id: string; noteContent: string; author: { fullName: string }; createdAt: string }>;
}

export interface DashboardStats {
  admissions: {
    total: number;
    submitted: number;
    underReview: number;
    accepted: number;
    rejected: number;
  };
  blog: {
    published: number;
    draft: number;
    pendingComments: number;
  };
  jobs: {
    open: number;
    closed: number;
    totalApplications: number;
  };
  users: {
    active: number;
    suspended: number;
  };
}
