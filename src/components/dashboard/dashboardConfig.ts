import type { LucideIcon } from 'lucide-react';
import {
  ClipboardList,
  Briefcase,
  Newspaper,
  Camera,
  GraduationCap,
  FileText,
  Image,
  Settings,
  Search,
  Mail,
  Bell,
  Users,
  Shield,
  LayoutDashboard,
} from 'lucide-react';

export interface DashboardModuleConfig {
  moduleKey: string;
  labelKey: string;
  adminRoute: string;
  permission: string;
  statsKey: string;
  icon: LucideIcon;
  getPrimaryValue: (stats: Record<string, unknown>) => number | string;
}

export const DASHBOARD_MODULE_CONFIG: DashboardModuleConfig[] = [
  {
    moduleKey: 'admissions',
    labelKey: 'admin.admissions',
    adminRoute: '/admin/admissions',
    permission: 'VIEW_ALL_ADMISSIONS',
    statsKey: 'admissions',
    icon: ClipboardList,
    getPrimaryValue: (s) => (s.admissions as { total?: number })?.total ?? 0,
  },
  {
    moduleKey: 'admission-requirements',
    labelKey: 'admin.navRequirements',
    adminRoute: '/admin/admission-requirements',
    permission: 'MANAGE_ADMISSION_REQUIREMENTS',
    statsKey: 'admissionRequirements',
    icon: ClipboardList,
    getPrimaryValue: (s) => (s.admissionRequirements as { active?: number })?.active ?? 0,
  },
  {
    moduleKey: 'careers',
    labelKey: 'admin.careers',
    adminRoute: '/admin/careers',
    permission: 'MANAGE_JOBS',
    statsKey: 'jobs',
    icon: Briefcase,
    getPrimaryValue: (s) => (s.jobs as { open?: number })?.open ?? 0,
  },
  {
    moduleKey: 'blog',
    labelKey: 'admin.blog',
    adminRoute: '/admin/blog',
    permission: 'UPDATE_BLOG',
    statsKey: 'blog',
    icon: Newspaper,
    getPrimaryValue: (s) => (s.blog as { published?: number })?.published ?? 0,
  },
  {
    moduleKey: 'gallery',
    labelKey: 'admin.navGallery',
    adminRoute: '/admin/gallery',
    permission: 'MANAGE_GALLERY',
    statsKey: 'gallery',
    icon: Camera,
    getPrimaryValue: (s) => (s.gallery as { total?: number })?.total ?? 0,
  },
  {
    moduleKey: 'education',
    labelKey: 'admin.navEducation',
    adminRoute: '/admin/education',
    permission: 'MANAGE_EDUCATION',
    statsKey: 'education',
    icon: GraduationCap,
    getPrimaryValue: (s) => (s.education as { total?: number })?.total ?? 0,
  },
  {
    moduleKey: 'pages',
    labelKey: 'admin.pages',
    adminRoute: '/admin/pages',
    permission: 'MANAGE_ABOUT_US',
    statsKey: 'pages',
    icon: FileText,
    getPrimaryValue: (s) => (s.pages as { total?: number })?.total ?? 0,
  },
  {
    moduleKey: 'about-us',
    labelKey: 'admin.about',
    adminRoute: '/admin/about',
    permission: 'MANAGE_ABOUT_US',
    statsKey: 'aboutUs',
    icon: FileText,
    getPrimaryValue: (s) => (s.aboutUs as { total?: number })?.total ?? 0,
  },
  {
    moduleKey: 'landing',
    labelKey: 'admin.hero',
    adminRoute: '/admin/landing/hero',
    permission: 'MANAGE_LANDING',
    statsKey: 'landing',
    icon: Image,
    getPrimaryValue: (s) => (s.landing as { sectionsPublished?: number })?.sectionsPublished ?? 0,
  },
  {
    moduleKey: 'settings',
    labelKey: 'admin.settings',
    adminRoute: '/admin/settings',
    permission: 'UPDATE_SYSTEM_CONFIG',
    statsKey: 'settings',
    icon: Settings,
    getPrimaryValue: () => '—',
  },
  {
    moduleKey: 'seo',
    labelKey: 'admin.seo',
    adminRoute: '/admin/seo',
    permission: 'UPDATE_SYSTEM_CONFIG',
    statsKey: 'seo',
    icon: Search,
    getPrimaryValue: () => '—',
  },
  {
    moduleKey: 'inquiries',
    labelKey: 'admin.inquiries',
    adminRoute: '/admin/inquiries',
    permission: 'VIEW_DASHBOARD',
    statsKey: 'inquiries',
    icon: Mail,
    getPrimaryValue: (s) => (s.inquiries as { new?: number })?.new ?? 0,
  },
  {
    moduleKey: 'notifications',
    labelKey: 'admin.notifications',
    adminRoute: '/admin/notifications',
    permission: 'VIEW_DASHBOARD',
    statsKey: 'notifications',
    icon: Bell,
    getPrimaryValue: (s) => (s.notifications as { unread?: number })?.unread ?? 0,
  },
  {
    moduleKey: 'email',
    labelKey: 'admin.navEmail',
    adminRoute: '/admin/email',
    permission: 'MANAGE_EMAIL_TEMPLATES',
    statsKey: 'email',
    icon: Mail,
    getPrimaryValue: (s) => (s.email as { templates?: number })?.templates ?? 0,
  },
  {
    moduleKey: 'users',
    labelKey: 'admin.navUsers',
    adminRoute: '/admin/users',
    permission: 'MANAGE_USERS',
    statsKey: 'users',
    icon: Users,
    getPrimaryValue: (s) => (s.users as { active?: number })?.active ?? 0,
  },
  {
    moduleKey: 'roles',
    labelKey: 'admin.navRoles',
    adminRoute: '/admin/roles',
    permission: 'MANAGE_ROLES',
    statsKey: 'roles',
    icon: Shield,
    getPrimaryValue: (s) => (s.roles as { total?: number })?.total ?? 0,
  },
  {
    moduleKey: 'audit',
    labelKey: 'admin.audit',
    adminRoute: '/admin/audit',
    permission: 'MANAGE_ROLES',
    statsKey: 'audit',
    icon: LayoutDashboard,
    getPrimaryValue: () => '—',
  },
];

export interface OverviewCardDef {
  id: string;
  labelKey: string;
  permission?: string;
  roles?: string[];
  getValue: (stats: Record<string, unknown>) => number;
  alertThreshold?: number;
  section: 'admissions' | 'careers' | 'content' | 'system';
}

export const OVERVIEW_CARD_DEFS: OverviewCardDef[] = [
  {
    id: 'admissions-total',
    labelKey: 'admin.totalAdmissions',
    permission: 'VIEW_ALL_ADMISSIONS',
    getValue: (s) => (s.admissions as { total?: number })?.total ?? 0,
    section: 'admissions',
  },
  {
    id: 'admissions-submitted',
    labelKey: 'admin.submittedAdmissions',
    permission: 'VIEW_ALL_ADMISSIONS',
    getValue: (s) => (s.admissions as { submitted?: number })?.submitted ?? 0,
    alertThreshold: 10,
    section: 'admissions',
  },
  {
    id: 'admissions-review',
    labelKey: 'admin.underReview',
    permission: 'VIEW_ALL_ADMISSIONS',
    getValue: (s) => (s.admissions as { underReview?: number })?.underReview ?? 0,
    section: 'admissions',
  },
  {
    id: 'admissions-accepted',
    labelKey: 'admin.acceptedAdmissions',
    permission: 'VIEW_ALL_ADMISSIONS',
    getValue: (s) => (s.admissions as { accepted?: number })?.accepted ?? 0,
    section: 'admissions',
  },
  {
    id: 'admissions-rejected',
    labelKey: 'admin.rejectedAdmissions',
    permission: 'VIEW_ALL_ADMISSIONS',
    getValue: (s) => (s.admissions as { rejected?: number })?.rejected ?? 0,
    section: 'admissions',
  },
  {
    id: 'jobs-open',
    labelKey: 'admin.openJobs',
    permission: 'MANAGE_JOBS',
    getValue: (s) => (s.jobs as { open?: number })?.open ?? 0,
    section: 'careers',
  },
  {
    id: 'jobs-apps',
    labelKey: 'admin.totalApplications',
    permission: 'MANAGE_JOBS',
    getValue: (s) => (s.jobs as { totalApplications?: number })?.totalApplications ?? 0,
    section: 'careers',
  },
  {
    id: 'blog-published',
    labelKey: 'admin.publishedPosts',
    permission: 'UPDATE_BLOG',
    getValue: (s) => (s.blog as { published?: number })?.published ?? 0,
    section: 'content',
  },
  {
    id: 'blog-draft',
    labelKey: 'admin.draftPosts',
    permission: 'UPDATE_BLOG',
    getValue: (s) => (s.blog as { draft?: number })?.draft ?? 0,
    section: 'content',
  },
  {
    id: 'blog-comments',
    labelKey: 'admin.pendingComments',
    permission: 'UPDATE_BLOG',
    getValue: (s) => (s.blog as { pendingComments?: number })?.pendingComments ?? 0,
    alertThreshold: 5,
    section: 'content',
  },
  {
    id: 'content-drafts',
    labelKey: 'admin.contentDrafts',
    permission: 'UPDATE_BLOG',
    getValue: (s) => (s.content as { totalDrafts?: number })?.totalDrafts ?? 0,
    section: 'content',
  },
  {
    id: 'inquiries-new',
    labelKey: 'admin.newInquiries',
    permission: 'VIEW_DASHBOARD',
    getValue: (s) => (s.inquiries as { new?: number })?.new ?? 0,
    alertThreshold: 5,
    section: 'system',
  },
  {
    id: 'notifications-unread',
    labelKey: 'admin.unreadNotifications',
    permission: 'VIEW_DASHBOARD',
    getValue: (s) => (s.notifications as { unread?: number })?.unread ?? 0,
    section: 'system',
  },
  {
    id: 'email-failed',
    labelKey: 'admin.failedEmails',
    permission: 'MANAGE_EMAIL_TEMPLATES',
    getValue: (s) => (s.email as { failedLogs?: number })?.failedLogs ?? 0,
    alertThreshold: 1,
    section: 'system',
  },
  {
    id: 'users-active',
    labelKey: 'admin.activeUsers',
    permission: 'MANAGE_USERS',
    getValue: (s) => (s.users as { active?: number })?.active ?? 0,
    section: 'system',
  },
];
