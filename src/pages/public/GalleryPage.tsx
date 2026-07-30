import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Image as ImageIcon, Filter, Sparkles, Eye, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { galleryApi } from '../../api';
import { mediaUrl } from '../../lib/utils';

interface GalleryItem {
  id: string;
  title: string;
  category: string;
  imageUrl?: string;
  media_url?: string;
  description?: string;
  caption?: string;
}

const defaultGalleryItems: GalleryItem[] = [
  { id: '1', title: 'Smart Classroom & Interactive Learning', category: 'ACADEMICS', media_url: '/photos/photo1.jpeg', description: 'Modern bilingual classrooms equipped with digital smart boards.' },
  { id: '2', title: 'Main Campus & Building Entrance', category: 'CAMPUS', media_url: '/photos/hero1.jpeg', description: 'State of the art campus facilities and welcoming atmosphere.' },
  { id: '3', title: 'School Activities & Honors Ceremony', category: 'EVENTS', media_url: '/photos/photo2.jpeg', description: 'Celebrating academic excellence and student achievements.' },
  { id: '4', title: 'Sports Grounds & Physical Fitness', category: 'SPORTS', media_url: '/photos/hero3.jpeg', description: 'Spacious sports fields and physical education facilities.' },
  { id: '5', title: 'Interactive Science & Computer Labs', category: 'ACADEMICS', media_url: '/photos/photo3.jpeg', description: 'Hands-on scientific experiments and modern computer labs.' },
  { id: '6', title: 'School Cultural Performance & Stage', category: 'EVENTS', media_url: '/photos/photo4.jpeg', description: 'Annual cultural festival, arts, and theatrical performances.' },
  { id: '7', title: 'Kindergarten Activity Corner', category: 'CAMPUS', media_url: '/photos/hero2.jpeg', description: 'Safe, colorful, and fun environment for young learners.' },
  { id: '8', title: 'Football & Outdoor Athletics Field', category: 'SPORTS', media_url: '/photos/photo5.jpeg', description: 'Professional sports coaching and team competitions.' },
  { id: '9', title: 'Students Teamwork & Collaborative Projects', category: 'ACADEMICS', media_url: '/photos/hero4.jpeg', description: 'Fostering teamwork, problem solving, and creativity.' },
  { id: '10', title: 'Annual Sports Day & Medals', category: 'EVENTS', media_url: '/photos/photo6.jpeg', description: 'Encouraging sportsmanship and healthy active lifestyle.' },
  { id: '11', title: 'School Library & Quiet Reading Zone', category: 'CAMPUS', media_url: '/photos/photo7.jpeg', description: 'Rich collection of bilingual books, journals, and digital media.' },
  { id: '12', title: 'Art & Design Studio Showcase', category: 'ACADEMICS', media_url: '/photos/photo8.jpeg', description: 'Unleashing artistic talents and creative expression.' },
];

const ITEMS_PER_PAGE = 8;

export function GalleryPage() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lightboxImage, setLightboxImage] = useState<GalleryItem | null>(null);

  const { data: rawItems = [], isLoading } = useQuery<GalleryItem[]>({
    queryKey: ['public-gallery', i18n.language],
    queryFn: () => galleryApi.list(i18n.language).then((res) => res.data),
  });

  const galleryItems = useMemo(() => {
    if (rawItems && rawItems.length > 0) {
      return rawItems.map((item) => ({
        ...item,
        media_url: item.imageUrl || item.media_url || '/photos/photo1.jpeg',
        description: item.caption || item.description,
      }));
    }
    return defaultGalleryItems;
  }, [rawItems]);

  const categories = useMemo(() => {
    return ['all', ...Array.from(new Set(galleryItems.map((item) => item.category).filter(Boolean)))];
  }, [galleryItems]);

  const filteredItems = useMemo(() => {
    return selectedCategory === 'all'
      ? galleryItems
      : galleryItems.filter((item) => item.category === selectedCategory);
  }, [selectedCategory, galleryItems]);

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE) || 1;

  // Clamped page number
  const validPage = Math.min(Math.max(currentPage, 1), totalPages);

  const paginatedItems = useMemo(() => {
    const start = (validPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, validPage]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const startIndex = (validPage - 1) * ITEMS_PER_PAGE + 1;
  const endIndex = Math.min(validPage * ITEMS_PER_PAGE, filteredItems.length);

  return (
    <>
      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-primary-dark via-primary to-blue-800 text-white py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-gold mb-4">
            <Sparkles className="h-4 w-4" />
            <span>MLS MEDIA GALLERY</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            {t('gallery.title', 'School Photo Gallery')}
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-blue-100">
            {t('gallery.subtitle', 'A visual tour inside Manhattan Language School, campus facilities, and student activities.')}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Filters */}
        {categories.length > 1 && (
          <div className="flex items-center justify-center flex-wrap gap-2 mb-10">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-slate-400 mr-2">
              <Filter className="h-4 w-4" />
              <span>{t('gallery.filter', 'Filter:')}</span>
            </div>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 capitalize shadow-xs ${
                  selectedCategory === cat
                    ? 'bg-primary text-white shadow-md scale-105'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat === 'all' ? t('gallery.all', 'All Photos') : cat}
              </button>
            ))}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="h-64 rounded-2xl bg-gray-200 dark:bg-slate-800 animate-pulse"></div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredItems.length === 0 && (
          <div className="text-center py-16 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-gray-300 dark:border-slate-800">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-slate-600 mb-3" />
            <p className="text-lg font-medium text-gray-600 dark:text-slate-400">
              {t('gallery.empty', 'No photos available in this category currently.')}
            </p>
          </div>
        )}

        {/* Gallery Grid */}
        {!isLoading && filteredItems.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {paginatedItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setLightboxImage(item)}
                  className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 transition-all duration-300 cursor-pointer flex flex-col h-72"
                >
                  <div className="relative w-full h-full overflow-hidden bg-slate-900">
                    <img
                      src={mediaUrl(item.media_url)}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                      <span className="text-[10px] font-bold text-gold uppercase tracking-wider mb-1">
                        {item.category}
                      </span>
                      <h3 className="text-white font-semibold text-base line-clamp-1">{item.title}</h3>
                      {item.description && (
                        <p className="text-gray-300 text-xs line-clamp-2 mt-1">{item.description}</p>
                      )}
                      <div className="mt-3 flex items-center gap-1.5 text-xs text-white/90 font-medium">
                        <Eye className="h-4 w-4" />
                        <span>{t('gallery.view', 'Zoom Image')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Component */}
            <div className="mt-12 pt-6 border-t border-gray-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-gray-500 dark:text-slate-400 font-medium">
                {t('gallery.showingCount', 'Showing {{start}} - {{end}} of {{total}} photos', {
                  start: startIndex,
                  end: endIndex,
                  total: filteredItems.length,
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(validPage - 1)}
                    disabled={validPage === 1}
                    className="p-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous page"
                  >
                    {isRtl ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-9 h-9 text-xs font-semibold rounded-lg transition-all ${
                          validPage === pageNum
                            ? 'bg-primary text-white shadow-md scale-105 font-bold'
                            : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handlePageChange(validPage + 1)}
                    disabled={validPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Next page"
                  >
                    {isRtl ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-6 right-6 p-3 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="h-6 w-6" />
          </button>

          <div
            className="max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
              <img
                src={mediaUrl(lightboxImage.media_url)}
                alt={lightboxImage.title}
                className="max-h-[75vh] w-auto object-contain"
              />
            </div>
            <div className="p-6 bg-slate-900 text-white">
              <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary text-white uppercase tracking-wider mb-2">
                {lightboxImage.category}
              </span>
              <h2 className="text-xl font-bold">{lightboxImage.title}</h2>
              {lightboxImage.description && (
                <p className="text-gray-300 text-sm mt-2">{lightboxImage.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
