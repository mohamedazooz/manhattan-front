import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Upload,
  Search,
  Check,
  Trash2,
  Copy,
  Loader2,
  FolderOpen,
} from 'lucide-react';
import { storageApi, type StorageFileItem } from '../../api';
import { mediaUrl } from '../../lib/utils';
import { Modal } from '../ui/DataTable';
import { Button } from '../ui/Button';

interface MediaPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  title?: string;
  defaultFolder?: string;
}

const FOLDERS = [
  { key: 'all', labelAr: 'الكل', labelEn: 'All Files' },
  { key: 'brand', labelAr: 'الشعار والبراند', labelEn: 'Brand Logos' },
  { key: 'photos', labelAr: 'صور الموقع', labelEn: 'Site Photos' },
  { key: 'heroes', labelAr: 'الهيرو سلايدر', labelEn: 'Hero Slides' },
  { key: 'gallery', labelAr: 'معرض الصور', labelEn: 'Gallery' },
  { key: 'blog', labelAr: 'المدونة والمقالات', labelEn: 'Blog' },
  { key: 'education', labelAr: 'البرامج الدراسية', labelEn: 'Education' },
];

export function MediaPickerModal({
  open,
  onClose,
  onSelect,
  title,
  defaultFolder = 'all',
}: MediaPickerModalProps) {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeFolder, setActiveFolder] = useState<string>(defaultFolder);
  const [search, setSearch] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { data: filesResponse, isLoading, refetch } = useQuery({
    queryKey: ['storage-files-picker', activeFolder],
    queryFn: () => storageApi.listFiles(activeFolder === 'all' ? undefined : activeFolder).then((r) => r.data),
    enabled: open,
  });

  const deleteMutation = useMutation({
    mutationFn: (key: string) => storageApi.delete(key),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['storage-files-picker'] });
      refetch();
    },
  });

  const files: StorageFileItem[] = filesResponse?.data || [];

  const filteredFiles = files.filter((f) =>
    f.key.toLowerCase().includes(search.toLowerCase()) ||
    f.url.toLowerCase().includes(search.toLowerCase())
  );

  async function handleFileUpload(file: File) {
    if (!file) return;
    setUploading(true);
    try {
      const folderToUse = activeFolder === 'all' ? 'misc' : activeFolder;
      const res = await storageApi.upload(file, folderToUse);
      const url = res.data.fileUrl || res.data.url;
      qc.invalidateQueries({ queryKey: ['storage-files-picker'] });
      refetch();
      onSelect(url);
      onClose();
    } catch {
      // Error handled
    } finally {
      setUploading(false);
    }
  }

  function copyToClipboard(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title || (isAr ? 'اختر صورة من Google Cloud Storage' : 'Select Image from Google Cloud Storage')}
      wide
    >
      <div className="space-y-4 text-slate-800 dark:text-slate-100">
        {/* Header Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-100 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
          {/* Folder Tabs */}
          <div className="flex flex-wrap gap-1.5 overflow-x-auto text-xs font-semibold">
            {FOLDERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setActiveFolder(f.key)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeFolder === f.key
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {isAr ? f.labelAr : f.labelEn}
              </button>
            ))}
          </div>

          {/* Direct Upload Button */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileUpload(f);
              }}
            />
            <Button
              type="button"
              variant="gold"
              className="text-xs py-1.5 px-3 flex items-center gap-1.5 shadow-sm"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              <span>{uploading ? (isAr ? 'جاري الرفع...' : 'Uploading...') : (isAr ? 'رفع صورة جديدة' : 'Upload New Image')}</span>
            </Button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 rtl:right-3 rtl:left-auto top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isAr ? 'بحث بالاسم أو الرابط...' : 'Search by name or URL...'}
            className="w-full pl-9 rtl:pr-9 rtl:pl-3 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Image Grid */}
        <div className="max-h-[380px] overflow-y-auto p-1">
          {isLoading ? (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-xs font-medium">{isAr ? 'جاري تحميل الصور من GCS...' : 'Loading images from GCS...'}</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="py-16 text-center text-slate-400 border border-dashed rounded-xl flex flex-col items-center justify-center gap-2">
              <FolderOpen className="w-10 h-10 text-slate-300" />
              <p className="text-sm font-semibold">{isAr ? 'لا توجد صور في هذا المجلد' : 'No images found in this folder'}</p>
              <p className="text-xs">{isAr ? 'قم برفع أول صورة إلى Google Cloud Storage' : 'Upload your first image to Google Cloud Storage'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredFiles.map((file) => {
                const resolvedUrl = mediaUrl(file.url);
                return (
                  <div
                    key={file.key}
                    className="group relative rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs hover:shadow-md hover:border-primary/50 transition-all flex flex-col justify-between"
                  >
                    {/* Thumbnail */}
                    <div className="h-32 w-full bg-slate-100 dark:bg-slate-950 relative overflow-hidden flex items-center justify-center">
                      <img
                        src={resolvedUrl}
                        alt={file.key}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = mediaUrl('/photos/photo1.jpeg');
                        }}
                      />

                      {/* Select Overlay */}
                      <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                        <Button
                          type="button"
                          variant="gold"
                          className="text-xs py-1 px-2.5 font-bold shadow-md"
                          onClick={() => {
                            onSelect(resolvedUrl);
                            onClose();
                          }}
                        >
                          <Check className="w-3.5 h-3.5 mr-1 rtl:ml-1" />
                          <span>{isAr ? 'اختيار' : 'Select'}</span>
                        </Button>
                      </div>
                    </div>

                    {/* Footer Actions & Info */}
                    <div className="p-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="truncate max-w-[110px]" title={file.key}>
                        {file.key.split('/').pop()}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          title={isAr ? 'نسخ رابط الصورة' : 'Copy image URL'}
                          onClick={() => copyToClipboard(resolvedUrl, file.key)}
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-primary transition-colors"
                        >
                          {copiedKey === file.key ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                        <button
                          type="button"
                          title={isAr ? 'حذف من GCS' : 'Delete from GCS'}
                          onClick={() => {
                            if (window.confirm(isAr ? 'هل أنت تأكد من حذف هذه الصورة من Google Cloud Storage؟' : 'Are you sure you want to delete this file from GCS?')) {
                              deleteMutation.mutate(file.key);
                            }
                          }}
                          className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/50 text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
