export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
export const UPLOAD_URL = import.meta.env.VITE_UPLOAD_URL || 'http://localhost:3000';

export function mediaUrl(path?: string | null): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${UPLOAD_URL}${path.startsWith('/') ? path : `/${path}`}`;
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
