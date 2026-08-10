import type { TFunction } from 'i18next';
import type { DashboardStats } from '../types';

export type OpsHealth = 'healthy' | 'attention' | 'critical';

export type ActionSeverity = 'critical' | 'warning' | 'info';

export interface DashboardActionItem {
  id: string;
  title: string;
  count: number;
  link: string;
  priority: number;
  severity: ActionSeverity;
}

export interface PipelineStage {
  key: string;
  label: string;
  count: number;
  color: string;
  href?: string;
}

export function buildDashboardActions(
  stats: DashboardStats,
  hasPermission: (permission: string) => boolean,
  t: TFunction,
): DashboardActionItem[] {
  const items: DashboardActionItem[] = [];

  const failedEmails = stats.email?.failedLogs ?? 0;
  if (hasPermission('MANAGE_EMAIL_TEMPLATES') && failedEmails > 0) {
    items.push({
      id: 'email-failed',
      title: t('admin.failedEmails'),
      count: failedEmails,
      link: '/admin/email',
      priority: 1,
      severity: 'critical',
    });
  }

  const admissionsQueue = (stats.admissions?.submitted ?? 0) + (stats.admissions?.underReview ?? 0);
  if (hasPermission('VIEW_ALL_ADMISSIONS') && admissionsQueue > 0) {
    items.push({
      id: 'admissions-queue',
      title: t('admin.submittedAdmissions'),
      count: admissionsQueue,
      link: '/admin/admissions',
      priority: 2,
      severity: admissionsQueue >= 10 ? 'warning' : 'info',
    });
  }

  const newInquiries = stats.inquiries?.new ?? 0;
  if (hasPermission('VIEW_DASHBOARD') && newInquiries > 0) {
    items.push({
      id: 'inquiries',
      title: t('admin.newInquiries'),
      count: newInquiries,
      link: '/admin/inquiries',
      priority: 3,
      severity: newInquiries >= 5 ? 'warning' : 'info',
    });
  }

  const pendingComments = stats.blog?.pendingComments ?? 0;
  if (hasPermission('UPDATE_BLOG') && pendingComments > 0) {
    items.push({
      id: 'comments',
      title: t('admin.pendingComments'),
      count: pendingComments,
      link: '/admin/blog',
      priority: 4,
      severity: 'info',
    });
  }

  const jobReviewQueue =
    (stats.jobs?.byStatus?.SUBMITTED ?? 0) + (stats.jobs?.byStatus?.REVIEWING ?? 0);
  if (hasPermission('MANAGE_JOBS') && jobReviewQueue > 0) {
    items.push({
      id: 'jobs-review',
      title: t('admin.jobsAwaitingReview', 'Applications awaiting review'),
      count: jobReviewQueue,
      link: '/admin/careers',
      priority: 5,
      severity: 'info',
    });
  }

  const unreadNotifications = stats.notifications?.unread ?? 0;
  if (hasPermission('VIEW_DASHBOARD') && unreadNotifications > 0) {
    items.push({
      id: 'notifications',
      title: t('admin.unreadNotifications'),
      count: unreadNotifications,
      link: '/admin/notifications',
      priority: 6,
      severity: 'info',
    });
  }

  const contentDrafts = stats.content?.totalDrafts ?? 0;
  if (hasPermission('UPDATE_BLOG') && contentDrafts > 0) {
    items.push({
      id: 'content-drafts',
      title: t('admin.contentDrafts'),
      count: contentDrafts,
      link: '/admin/blog',
      priority: 7,
      severity: 'info',
    });
  }

  return items.sort((a, b) => a.priority - b.priority);
}

export function computeOpsHealth(actions: DashboardActionItem[]): OpsHealth {
  if (actions.some((a) => a.severity === 'critical')) {
    return 'critical';
  }
  if (actions.length > 0) {
    return 'attention';
  }
  return 'healthy';
}

export function countTotalActions(actions: DashboardActionItem[]): number {
  return actions.reduce((sum, item) => sum + item.count, 0);
}

export function isDashboardEmpty(stats: DashboardStats): boolean {
  const admissions = stats.admissions?.total ?? 0;
  const jobs = stats.jobs?.totalApplications ?? 0;
  const inquiries = stats.inquiries?.total ?? 0;
  const blog = (stats.blog?.published ?? 0) + (stats.blog?.draft ?? 0);

  return admissions === 0 && jobs === 0 && inquiries === 0 && blog === 0;
}

export function buildAdmissionPipeline(stats: DashboardStats, t: TFunction): PipelineStage[] {
  return [
    {
      key: 'SUBMITTED',
      label: t('status.SUBMITTED'),
      count: stats.admissions?.submitted ?? 0,
      color: 'bg-blue-500',
      href: '/admin/admissions',
    },
    {
      key: 'UNDER_REVIEW',
      label: t('status.UNDER_REVIEW'),
      count: stats.admissions?.underReview ?? 0,
      color: 'bg-amber-500',
      href: '/admin/admissions',
    },
    {
      key: 'ACCEPTED',
      label: t('status.ACCEPTED'),
      count: stats.admissions?.accepted ?? 0,
      color: 'bg-emerald-500',
      href: '/admin/admissions',
    },
    {
      key: 'REJECTED',
      label: t('status.REJECTED'),
      count: stats.admissions?.rejected ?? 0,
      color: 'bg-rose-400',
      href: '/admin/admissions',
    },
  ];
}

export function buildJobsPipeline(stats: DashboardStats, t: TFunction): PipelineStage[] {
  const byStatus = stats.jobs?.byStatus ?? {};

  return [
    {
      key: 'SUBMITTED',
      label: t('status.SUBMITTED'),
      count: byStatus.SUBMITTED ?? 0,
      color: 'bg-blue-500',
      href: '/admin/careers',
    },
    {
      key: 'REVIEWING',
      label: t('status.REVIEWING'),
      count: byStatus.REVIEWING ?? 0,
      color: 'bg-amber-500',
      href: '/admin/careers',
    },
    {
      key: 'SHORTLISTED',
      label: t('status.SHORTLISTED'),
      count: byStatus.SHORTLISTED ?? 0,
      color: 'bg-indigo-500',
      href: '/admin/careers',
    },
    {
      key: 'ACCEPTED',
      label: t('status.ACCEPTED'),
      count: byStatus.ACCEPTED ?? 0,
      color: 'bg-emerald-500',
      href: '/admin/careers',
    },
  ];
}
