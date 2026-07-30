import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAppLanguage } from '../../i18n';

export function GlobalBackButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const lang = useAppLanguage();
  const isAr = lang === 'ar';

  // Do not display floating back button on landing homepage
  if (location.pathname === '/') {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => navigate(-1)}
      className="fixed bottom-6 start-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary-dark/90 text-white hover:bg-primary-dark shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-md border border-white/20 active:scale-95 group text-xs font-bold"
      title={isAr ? 'رجوع للصفحة السابقة' : 'Go back to previous page'}
      aria-label={isAr ? 'رجوع' : 'Back'}
    >
      <ArrowLeft className="w-4 h-4 rtl:rotate-180 transition-transform group-hover:-translate-x-1 rtl:group-hover:translate-x-1" />
      <span>{isAr ? 'رجوع' : 'Back'}</span>
    </button>
  );
}
