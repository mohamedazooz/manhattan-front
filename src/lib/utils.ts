const isProd = import.meta.env.PROD;
const rawApi = import.meta.env.VITE_API_URL || '';
const rawUpload = import.meta.env.VITE_UPLOAD_URL || '';

export const API_URL =
  isProd && (!rawApi || rawApi.includes('localhost'))
    ? 'https://www.manhattanschool.net/api'
    : (rawApi || 'https://www.manhattanschool.net/api');

export const UPLOAD_URL =
  isProd && (!rawUpload || rawUpload.includes('localhost'))
    ? 'https://www.manhattanschool.net'
    : (rawUpload || 'https://www.manhattanschool.net');

export function mediaUrl(path?: string | null): string {
  if (!path) return '';
  let cleanPath = path.trim();
  cleanPath = cleanPath.replace(/(\.(?:png|jpg|jpeg|webp|gif|svg|pdf))\/+$/i, '$1');

  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
    return cleanPath;
  }

  if (cleanPath.startsWith('/storage/') || cleanPath.startsWith('storage/')) {
    const normalized = cleanPath.startsWith('/') ? cleanPath.slice(8) : cleanPath.slice(7);
    cleanPath = normalized;
  }
  if (
    cleanPath.startsWith('/photos/') ||
    cleanPath.startsWith('photos/') ||
    cleanPath.startsWith('/logo') ||
    cleanPath.startsWith('logo') ||
    cleanPath.startsWith('/assets/') ||
    cleanPath.startsWith('assets/') ||
    cleanPath.startsWith('/favicon')
  ) {
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

export function formatCurrency(value: number, lang: string, currency = 'EGP'): string {
  return new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
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

