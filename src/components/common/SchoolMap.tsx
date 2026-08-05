import { useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SchoolMapProps {
  googleMapsUrl?: string;
  embedUrl?: string;
  address?: string;
  className?: string;
  height?: string;
  showOverlayCard?: boolean;
}

export function SchoolMap({
  googleMapsUrl = 'https://maps.app.goo.gl/aCF8oV9RvreCyaXu9',
  embedUrl,
  address = 'مدرسة مانهاتن للغات، مدينة الشيخ زايد، محافظة الجيزة، مصر',
  className = '',
  height = '100%',
  showOverlayCard = true,
}: SchoolMapProps) {
  const { i18n } = useTranslation();
  const [isLoaded, setIsLoaded] = useState(false);
  const isAr = i18n.language === 'ar';

  const defaultEmbed = `https://maps.google.com/maps?q=${encodeURIComponent(
    address || 'مدرسة مانهاتن للغات Sheikh Zayed Giza'
  )}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  const finalEmbedUrl = embedUrl || defaultEmbed;
  const directMapsUrl = googleMapsUrl || 'https://maps.app.goo.gl/aCF8oV9RvreCyaXu9';

  return (
    <div className={`relative w-full overflow-hidden bg-slate-900 shadow-inner group ${className}`} style={{ minHeight: '280px', height }}>
      {/* Loading Skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900 text-slate-400 animate-pulse">
          <MapPin className="h-10 w-10 text-amber-400 animate-bounce mb-2" />
          <span className="text-xs font-semibold">{isAr ? 'جاري تحميل الخريطة...' : 'Loading map...'}</span>
        </div>
      )}

      {/* Embedded Google Map Iframe */}
      <iframe
        title="School Location Map"
        src={finalEmbedUrl}
        className="h-full w-full border-0 transition-all duration-300"
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        onLoad={() => setIsLoaded(true)}
      />

      {/* Floating Info Overlay Card */}
      {showOverlayCard && (
        <div className="absolute bottom-3 inset-x-3 sm:inset-x-auto sm:end-4 sm:bottom-4 z-20 max-w-sm rounded-2xl bg-slate-950/90 backdrop-blur-md p-3.5 border border-slate-800 text-white shadow-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-amber-400/20 text-amber-400 shrink-0">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-xs text-amber-300 truncate">
                {isAr ? 'موقع مدرسة مانهاتن للغات' : 'Manhattan Language School Location'}
              </div>
              <div className="text-[11px] text-slate-300 truncate mt-0.5">
                {address}
              </div>
            </div>
          </div>

          <a
            href={directMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-md transition-all active:scale-95"
            title={isAr ? 'فتح في خرائط جوجل' : 'Open in Maps'}
          >
            <Navigation className="h-3.5 w-3.5" />
            <span>{isAr ? 'خرائط جوجل' : 'Maps'}</span>
          </a>
        </div>
      )}
    </div>
  );
}
