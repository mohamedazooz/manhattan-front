export const API_URL = import.meta.env.VITE_API_URL || 'https://www.manhattanschool.net/api';
export const UPLOAD_URL = import.meta.env.VITE_UPLOAD_URL || 'https://www.manhattanschool.net';
export const GCS_BASE_URL = (import.meta.env.VITE_GCS_BASE_URL || 'https://storage.googleapis.com/manhattan-school-bucket').replace(/\/+$/, '');
export const DEFAULT_GCS_LOGO = `${GCS_BASE_URL}/brand/logo.png`;
export const DEFAULT_GCS_PHOTO = `${GCS_BASE_URL}/photos/photo1.jpeg`;

export function mediaUrl(path?: string | null): string {
  if (!path) return '';
  let cleanPath = path.trim();
  cleanPath = cleanPath.replace(/(\.(?:png|jpg|jpeg|webp|gif|svg))\/+$/i, '$1');

  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
    return cleanPath;
  }

  // NestJS local storage or static assets: /uploads/..., /photos/..., etc.
  if (cleanPath.startsWith('/storage/') || cleanPath.startsWith('storage/')) {
    const normalized = cleanPath.startsWith('/') ? cleanPath.slice(8) : cleanPath.slice(7);
    cleanPath = normalized;
  }

  if (cleanPath.startsWith('/photos/') || cleanPath.startsWith('photos/')) {
    const photoName = cleanPath.replace(/^\/?photos\//, '');
    return `${GCS_BASE_URL}/photos/${photoName}`;
  }

  if (cleanPath.startsWith('/logo.png') || cleanPath.startsWith('logo.png') || cleanPath === '/logo' || cleanPath === 'logo') {
    return DEFAULT_GCS_LOGO;
  }

  if (cleanPath.startsWith('/assets/') || cleanPath.startsWith('assets/') || cleanPath.startsWith('/favicon')) {
    return cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
  }

  if (!cleanPath.startsWith('/uploads/') && !cleanPath.startsWith('uploads/')) {
    cleanPath = `/uploads/${cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath}`;
  } else if (!cleanPath.startsWith('/')) {
    cleanPath = `/${cleanPath}`;
  }

  return `${UPLOAD_URL}${cleanPath}`;
}

export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(value: string, lang: string): string {
  return new Date(value).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatRelativeTime(value: string, lang: string): string {
  const date = new Date(value);
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (lang === 'ar') {
    if (diffMinutes < 1) return 'الآن';
    if (diffMinutes < 60) return `منذ ${diffMinutes} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} يوم`;
    return formatDate(value, lang);
  }

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(value, lang);
}

export function getBilingualText(item: any, fieldName: string, lang: string): string {
  if (!item) return '';
  if (lang === 'ar') {
    const arField = `${fieldName}Ar`;
    if (item[arField] && String(item[arField]).trim() !== '') {
      return String(item[arField]);
    }
  }
  return String(item[fieldName] || item[`${fieldName}Ar`] || '');
}

