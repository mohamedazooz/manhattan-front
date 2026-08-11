import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Upload,
  Search,
  Trash2,
  Copy,
  Check,
  FolderOpen,
  Image as ImageIcon,
  Loader2,
  ExternalLink,
  Cloud,
  HardDrive,
  RefreshCw,
} from 'lucide-react';
import { storageApi, type StorageFileItem } from '../../api';
import { mediaUrl } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/DataTable';

const FOLDERS = [
  { key: 'all', labelAr: 'كل الصور والملفات', labelEn: 'All Files' },
  { key: 'brand', labelAr: 'الشعار والبراند (Brand)', labelEn: 'Brand & Logos' },
  { key: 'photos', labelAr: 'صور الموقع الرئيسية (Photos)', labelEn: 'Site Photos' },
  { key: 'heroes', labelAr: 'صور السلايدر (Heroes)', labelEn: 'Hero Slides' },
  { key: 'gallery', labelAr: 'صور المعرض (Gallery)', labelEn: 'Gallery' },
  { key: 'blog', labelAr: 'صور المقالات والمدونة (Blog)', labelEn: 'Blog' },
  { key: 'education', labelAr: 'صور المراحل الدراسية (Education)', labelEn: 'Education' },
];

export function AdminMediaLibraryPage() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeFolder, setActiveFolder] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<StorageFileItem | null>(null);

  const { data: filesResponse, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['admin-storage-files', activeFolder],
    queryFn: () => storageApi.listFiles(activeFolder === 'all' ? undefined : activeFolder).then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (key: string) => storageApi.delete(key),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-storage-files'] });
      refetch();
    },
  });

  const files: StorageFileItem[] = filesResponse?.data || [];

  const filteredFiles = files.filter((f) =>
    f.key.toLowerCase().includes(search.toLowerCase()) ||
    f.url.toLowerCase().includes(search.toLowerCase())
  );

  async function handleFileUpload(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    try {
      const folderToUse = activeFolder === 'all' ? 'photos' : activeFolder;
      for (let i = 0; i < fileList.length; i++) {
        await storageApi.upload(fileList[i], folderToUse);
      }
      qc.invalidateQueries({ queryKey: ['admin-storage-files'] });
      refetch();
    } catch {
      // Handled
    } finally {
      setUploading(false);
    }
  }

  function copyToClipboard(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-primary-dark to-slate-900 text-white p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Cloud className="w-6 h-6 text-gold" />
            <h1 className="text-xl sm:text-2xl font-bold">
              {isAr ? 'المكتبة الرقمية وإدارة الصور (Google Cloud Storage)' : 'Media Library (Google Cloud Storage)'}
            </h1>
          </div>
          <p className="text-xs text-slate-300">
            {isAr
              ? 'إدارة كافة الصور والوسائط المرفوعة بالسحابة، رفع صور جديدة، ونسخ الروابط المباشرة لـ GCS.'
              : 'Manage cloud media assets, upload new files, and generate direct GCS links.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="border-white/20 text-white hover:bg-white/10 text-xs py-2 px-3 flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
            <span>{isAr ? 'تحديث' : 'Refresh'}</span>
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files)}
          />
          <Button
            variant="gold"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="text-xs font-bold py-2 px-4 flex items-center gap-2 shadow-lg"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>{uploading ? (isAr ? 'جاري الرفع...' : 'Uploading...') : (isAr ? '+ رفع صور جديدة لـ GCS' : '+ Upload to GCS')}</span>
          </Button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-4 border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500">{isAr ? 'إجمالي الملفات' : 'Total Files'}</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{files.length}</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Cloud className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500">{isAr ? 'محرك التخزين' : 'Storage Driver'}</p>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Google Cloud Storage (GCS)</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500">{isAr ? 'المجلد النشط' : 'Active Folder'}</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[150px]">
              {FOLDERS.find((f) => f.key === activeFolder)?.[isAr ? 'labelAr' : 'labelEn']}
            </p>
          </div>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        {/* Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          {/* Folder Filter Tabs */}
          <div className="flex flex-wrap gap-1.5 overflow-x-auto text-xs font-semibold">
            {FOLDERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setActiveFolder(f.key)}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  activeFolder === f.key
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {isAr ? f.labelAr : f.labelEn}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 rtl:right-3 rtl:left-auto top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isAr ? 'بحث بالاسم أو المسار...' : 'Search files...'}
              className="w-full pl-9 rtl:pr-9 rtl:pl-3 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFileUpload(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-900/50 flex flex-col items-center justify-center gap-2 group"
        >
          <Cloud className="w-10 h-10 text-slate-400 group-hover:text-primary group-hover:scale-110 transition-all" />
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
              {isAr ? 'اسحب الصور وإسقطها هنا للرفع إلى GCS' : 'Drag & drop images here to upload to GCS'}
            </p>
            <p className="text-[11px] text-slate-400">
              {isAr ? 'أو انقر هنا لتحديد الملفات من جهازك' : 'or click to browse files from your device'}
            </p>
          </div>
        </div>

        {/* Media Grid */}
        {isLoading ? (
          <div className="py-24 text-center text-slate-400 flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm font-semibold">{isAr ? 'جاري جلب قائمة الصور من Google Cloud Storage...' : 'Fetching images from GCS...'}</p>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="py-20 text-center text-slate-400 border border-dashed rounded-2xl flex flex-col items-center justify-center gap-3">
            <FolderOpen className="w-12 h-12 text-slate-300" />
            <div className="space-y-1">
              <p className="text-base font-bold text-slate-700 dark:text-slate-200">{isAr ? 'لا توجد صور في هذا القسم' : 'No images found'}</p>
              <p className="text-xs text-slate-400">{isAr ? 'يمكنك رفع صور جديدة باستخدام رز الرفع أعلاه' : 'Upload new images using the button above'}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredFiles.map((file) => {
              const resolvedUrl = mediaUrl(file.url);
              return (
                <div
                  key={file.key}
                  className="group relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs hover:shadow-xl hover:border-primary/50 transition-all flex flex-col justify-between"
                >
                  {/* Thumbnail */}
                  <div
                    className="h-44 w-full bg-slate-100 dark:bg-slate-950 relative overflow-hidden flex items-center justify-center cursor-pointer"
                    onClick={() => setPreviewImage(file)}
                  >
                    <img
                      src={resolvedUrl}
                      alt={file.key}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = mediaUrl('/photos/photo1.jpeg');
                      }}
                    />
                    <div className="absolute top-2 left-2 bg-slate-950/70 text-white text-[10px] px-2 py-0.5 rounded-md font-mono">
                      {formatBytes(file.size)}
                    </div>
                  </div>

                  {/* Metadata & Actions */}
                  <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate" title={file.key}>
                        {file.key.split('/').pop()}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-400 truncate font-mono" title={resolvedUrl}>
                      {resolvedUrl}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                      <Button
                        type="button"
                        variant="outline"
                        className="text-[11px] py-1 px-2.5 flex items-center gap-1.5"
                        onClick={() => copyToClipboard(resolvedUrl, file.key)}
                      >
                        {copiedKey === file.key ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === file.key ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ الرابط' : 'Copy URL')}</span>
                      </Button>

                      <div className="flex items-center gap-1">
                        <a
                          href={resolvedUrl}
                          target="_blank"
                          rel="noreferrer"
                          title={isAr ? 'فتح في نافذة جديدة' : 'Open in new tab'}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-primary transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          type="button"
                          title={isAr ? 'حذف من GCS' : 'Delete file'}
                          onClick={() => {
                            if (window.confirm(isAr ? 'هل أنت تأكد من حذف هذه الصورة من Google Cloud Storage؟' : 'Are you sure you want to delete this file from GCS?')) {
                              deleteMutation.mutate(file.key);
                            }
                          }}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Full Resolution Preview Lightbox Modal */}
      {previewImage && (
        <Modal
          open={!!previewImage}
          onClose={() => setPreviewImage(null)}
          title={previewImage.key.split('/').pop() || 'Image Preview'}
          wide
        >
          <div className="space-y-4 text-slate-800 dark:text-slate-100">
            <div className="max-h-[60vh] overflow-hidden rounded-2xl bg-slate-950 flex items-center justify-center p-2">
              <img
                src={mediaUrl(previewImage.url)}
                alt={previewImage.key}
                className="max-h-[58vh] max-w-full object-contain rounded-lg"
              />
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">{isAr ? 'المسار الكلي (Key):' : 'File Key:'}</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{previewImage.key}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{isAr ? 'الحجم:' : 'File Size:'}</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{formatBytes(previewImage.size)}</span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-slate-500 shrink-0">{isAr ? 'الرابط المباشر:' : 'Direct URL:'}</span>
                <span className="font-mono text-primary font-bold truncate">{previewImage.url}</span>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button
                variant="outline"
                onClick={() => copyToClipboard(mediaUrl(previewImage.url), previewImage.key)}
              >
                <Copy className="w-4 h-4 mr-1.5 rtl:ml-1.5" />
                {isAr ? 'نسخ رابط الصورة' : 'Copy Image Link'}
              </Button>
              <Button variant="primary" onClick={() => setPreviewImage(null)}>
                {isAr ? 'إغلاق' : 'Close'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
