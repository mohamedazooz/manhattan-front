import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { X, ZoomIn, Image as ImageIcon, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { galleryApi } from '../../api';
import { mediaUrl } from '../../lib/utils';

export interface GalleryItem {
  id: string;
  title: string;
  category: 'EVENTS' | 'CAMPUS' | 'SPORTS' | 'ACADEMICS' | string;
  imageUrl: string;
  caption?: string;
}

const defaultGalleryItems: GalleryItem[] = [
  { id: '1', title: 'Smart Classroom & Interactive Learning', category: 'ACADEMICS', imageUrl: '/photos/photo1.jpeg', caption: 'Modern bilingual classrooms equipped with digital smart boards.' },
  { id: '2', title: 'Main Campus & Building Entrance', category: 'CAMPUS', imageUrl: '/photos/hero1.jpeg', caption: 'State of the art campus facilities and welcoming atmosphere.' },
  { id: '3', title: 'School Activities & Honors Ceremony', category: 'EVENTS', imageUrl: '/photos/photo2.jpeg', caption: 'Celebrating academic excellence and student achievements.' },
  { id: '4', title: 'Sports Grounds & Physical Fitness', category: 'SPORTS', imageUrl: '/photos/hero3.jpeg', caption: 'Spacious sports fields and physical education facilities.' },
  { id: '5', title: 'Interactive Science & Computer Labs', category: 'ACADEMICS', imageUrl: '/photos/photo3.jpeg', caption: 'Hands-on scientific experiments and modern computer labs.' },
  { id: '6', title: 'School Cultural Performance & Stage', category: 'EVENTS', imageUrl: '/photos/photo4.jpeg', caption: 'Annual cultural festival, arts, and theatrical performances.' },
  { id: '7', title: 'Kindergarten Activity Corner', category: 'CAMPUS', imageUrl: '/photos/hero2.jpeg', caption: 'Safe, colorful, and fun environment for young learners.' },
  { id: '8', title: 'Football & Outdoor Athletics Field', category: 'SPORTS', imageUrl: '/photos/photo5.jpeg', caption: 'Professional sports coaching and team competitions.' },
  { id: '9', title: 'Students Teamwork & Collaborative Projects', category: 'ACADEMICS', imageUrl: '/photos/hero4.jpeg', caption: 'Fostering teamwork, problem solving, and creativity.' },
  { id: '10', title: 'Annual Sports Day & Medals', category: 'EVENTS', imageUrl: '/photos/photo6.jpeg', caption: 'Encouraging sportsmanship and healthy active lifestyle.' },
  { id: '11', title: 'School Library & Quiet Reading Zone', category: 'CAMPUS', imageUrl: '/photos/photo7.jpeg', caption: 'Rich collection of bilingual books, journals, and digital media.' },
  { id: '12', title: 'Art & Design Studio Showcase', category: 'ACADEMICS', imageUrl: '/photos/photo8.jpeg', caption: 'Unleashing artistic talents and creative expression.' },
];

export function PhotoGallery() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);

  const { data: rawItems = [] } = useQuery<any[]>({
    queryKey: ['public-gallery-home', i18n.language],
    queryFn: () => galleryApi.list(i18n.language).then((res) => res.data),
  });

  const allItems: GalleryItem[] = rawItems.length > 0
    ? rawItems.map((item) => ({
        id: item.id,
        title: item.title,
        category: item.category || 'EVENTS',
        imageUrl: mediaUrl(item.imageUrl || item.media_url || '/photos/photo1.jpeg'),
        caption: item.caption || item.description,
      }))
    : defaultGalleryItems;

  const categories = [
    { key: 'ALL', label: t('gallery.all', 'All Photos') },
    { key: 'CAMPUS', label: t('gallery.campus', 'Campus & Facilities') },
    { key: 'EVENTS', label: t('gallery.events', 'Events & Activities') },
    { key: 'ACADEMICS', label: t('gallery.academics', 'Academic Life') },
    { key: 'SPORTS', label: t('gallery.sports', 'Sports & Athletics') },
  ];

  const filteredItems = selectedCategory === 'ALL'
    ? allItems
    : allItems.filter((item) => item.category === selectedCategory);

  // Show only top 3 photos on landing page as requested
  const displayedItems = filteredItems.slice(0, 3);

  /**
   * Move the lightbox selection by `delta` positions within the displayed set.
   * Wraps around at both ends so arrow keys never dead-end.
   */
  const step = useCallback(
    (delta: number) => {
      setActiveItem((current) => {
        if (!current || displayedItems.length === 0) return current;
        const index = displayedItems.findIndex((item) => item.id === current.id);
        if (index === -1) return current;
        const nextIndex = (index + delta + displayedItems.length) % displayedItems.length;
        return displayedItems[nextIndex];
      });
    },
    [displayedItems],
  );

  // Keyboard navigation while the lightbox is open.
  // Arrow semantics are mirrored in RTL so "next" always follows reading order.
  useEffect(() => {
    if (!activeItem) return;
    const onKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          setActiveItem(null);
          break;
        case 'ArrowRight':
          event.preventDefault();
          step(isRtl ? -1 : 1);
          break;
        case 'ArrowLeft':
          event.preventDefault();
          step(isRtl ? 1 : -1);
          break;
        case 'Home':
          event.preventDefault();
          if (displayedItems.length) setActiveItem(displayedItems[0]);
          break;
        case 'End':
          event.preventDefault();
          if (displayedItems.length) setActiveItem(displayedItems[displayedItems.length - 1]);
          break;
        default:
          break;
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [activeItem, step, isRtl, displayedItems]);

  return (
    <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-10 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{t('gallery.title', 'School Photo Gallery')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {t('gallery.title', 'School Photo Gallery')}
          </h2>
          <p className="text-slate-300 text-sm sm:text-base font-light">
            {t('gallery.subtitle', 'A visual tour inside Manhattan Language School, campus facilities, and student activities.')}
          </p>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap justify-center gap-2 pt-4">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 ${
                  selectedCategory === cat.key
                    ? 'bg-amber-400 text-slate-950 shadow-lg scale-105'
                    : 'bg-white/10 text-slate-200 hover:bg-white/20 border border-white/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid - Max 3 Items */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AnimatePresence>
            {displayedItems.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                key={item.id}
                onClick={() => setActiveItem(item)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveItem(item);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={t('gallery.view', 'Zoom Image') + ': ' + item.title}
                className="group relative h-72 rounded-2xl overflow-hidden cursor-pointer shadow-xl border border-white/10 bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

                {/* Content info */}
                <div className="absolute inset-0 p-5 flex flex-col justify-end text-white">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      {item.category}
                    </span>
                    <div className="p-2 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                      <ZoomIn className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <h3 className="font-bold text-base leading-snug line-clamp-1">{item.title}</h3>
                  {item.caption && (
                    <p className="text-xs text-slate-300 line-clamp-2 mt-1 font-light opacity-90">
                      {item.caption}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* See More CTA Button */}
        <div className="mt-12 text-center">
          <Link
            to="/gallery"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-sm sm:text-base hover:from-amber-300 hover:to-amber-400 transition-all duration-300 shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-105 group"
          >
            <span>{t('gallery.seeMore', 'View More Photos (Full Gallery)')}</span>
            {isRtl ? (
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            ) : (
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            )}
          </Link>
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activeItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveItem(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={activeItem.title}
              className="relative max-w-4xl w-full bg-slate-900 rounded-3xl overflow-hidden border border-white/20 shadow-2xl space-y-4"
            >
              <button
                onClick={() => setActiveItem(null)}
                className="absolute top-4 end-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 backdrop-blur-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                aria-label={t('common.close', 'Close')}
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>

              <div className="max-h-[70vh] overflow-hidden bg-slate-950 flex items-center justify-center">
                <img
                  src={activeItem.imageUrl}
                  alt={activeItem.title}
                  className="max-h-[70vh] w-full object-contain"
                />
              </div>

              <div className="p-6 space-y-2 text-white">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                    {activeItem.category}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold">{activeItem.title}</h3>
                {activeItem.caption && (
                  <p className="text-sm text-slate-300 font-light">{activeItem.caption}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
