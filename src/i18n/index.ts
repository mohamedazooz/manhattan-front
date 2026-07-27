import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import ar from './ar.json';

const saved = localStorage.getItem('lang') || 'en';

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, ar: { translation: ar } },
  lng: saved,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

document.documentElement.dir = saved === 'ar' ? 'rtl' : 'ltr';
document.documentElement.lang = saved;

export default i18n;

export function setAppLanguage(lang: 'en' | 'ar') {
  localStorage.setItem('lang', lang);
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;
  i18n.changeLanguage(lang);
}

export function useAppLanguage(): 'en' | 'ar' {
  return i18n.language === 'ar' ? 'ar' : 'en';
}
