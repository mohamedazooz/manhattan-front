import type { Notification } from '../types';

export function getNotificationTargetRoute(notification: Notification): string | null {
  if (notification.entityType) {
    switch (notification.entityType) {
      case 'CONTACT_INQUIRY':
        return notification.entityId
          ? `/admin/inquiries?inquiryId=${notification.entityId}`
          : '/admin/inquiries';
      case 'ADMISSION':
        return notification.entityId
          ? `/admin/admissions/${notification.entityId}`
          : '/admin/admissions';
      case 'JOB_APPLICATION':
        return notification.entityId
          ? `/admin/careers?applicationId=${notification.entityId}`
          : '/admin/careers';
      case 'BLOG_COMMENT':
        return notification.entityId
          ? `/admin/blog?commentId=${notification.entityId}`
          : '/admin/blog';
      default: {
        const _exhaustive: never = notification.entityType;
        return _exhaustive;
      }
    }
  }

  const text = `${notification.title} ${notification.message}`.toLowerCase();
  if (text.includes('admission') || text.includes('قبول') || text.includes('التحاق')) {
    return '/admin/admissions';
  }
  if (text.includes('job') || text.includes('career') || text.includes('توظيف') || text.includes('وظيفة')) {
    return '/admin/careers';
  }
  if (text.includes('inquiry') || text.includes('contact') || text.includes('استفسار') || text.includes('اتصل')) {
    return '/admin/inquiries';
  }
  if (text.includes('comment') || text.includes('تعليق') || text.includes('blog') || text.includes('مقال')) {
    return '/admin/blog';
  }
  return null;
}
