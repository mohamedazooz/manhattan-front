export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
export const UPLOAD_URL = import.meta.env.VITE_UPLOAD_URL || 'http://localhost:3001';

export function mediaUrl(path?: string | null): string {
  if (!path) return '';
  let cleanPath = path.trim();
  cleanPath = cleanPath.replace(/(\.(?:png|jpg|jpeg|webp|gif|svg))\/+$/i, '$1');

  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
    return cleanPath;
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

