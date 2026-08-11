import { useEffect, useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { seoApi, storageApi } from '../../api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { PageHeader } from '../../components/ui/Badge';
import { getApiErrorMessage } from '../../lib/formData';
import { mediaUrl } from '../../lib/utils';
import type { SeoConfig } from '../../types';
import { Search, Share2, BarChart2, CheckCircle, Save, Upload, FolderOpen } from 'lucide-react';
import { MediaPickerModal } from '../../components/admin/MediaPickerModal';

export function SeoAdminPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const ogFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingOg, setIsUploadingOg] = useState(false);
  const [openPicker, setOpenPicker] = useState(false);
  const [form, setForm] = useState<Partial<SeoConfig>>({
    siteTitle: '',
    siteTitleAr: '',
    siteDescription: '',
    siteDescriptionAr: '',
    defaultKeywords: '',
    defaultOgImage: '',
    twitterHandle: '',
    googleAnalyticsId: '',
    googleSearchConsoleTag: '',
  });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['seo-global-admin'],
    queryFn: () => seoApi.getGlobal().then((res) => res.data),
  });

  useEffect(() => {
    if (data) {
      setForm({
        siteTitle: data.siteTitle || '',
        siteTitleAr: data.siteTitleAr || '',
        siteDescription: data.siteDescription || '',
        siteDescriptionAr: data.siteDescriptionAr || '',
        defaultKeywords: data.defaultKeywords || '',
        defaultOgImage: data.defaultOgImage || '',
        twitterHandle: data.twitterHandle || '',
        googleAnalyticsId: data.googleAnalyticsId || '',
        googleSearchConsoleTag: data.googleSearchConsoleTag || '',
      });
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: () => seoApi.updateGlobal(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['seo-global-admin'] });
      setSaveSuccess(true);
      setSaveError(null);
      setTimeout(() => setSaveSuccess(false), 3000);
    },
    onError: (error) => {
      setSaveError(getApiErrorMessage(error, t('common.errorSave', 'Failed to save SEO settings')));
      setSaveSuccess(false);
    },
  });

  if (isLoading) {
    return <div className="p-6 text-slate-500">{t('common.loading', 'Loading SEO settings...')}</div>;
  }

  return (
    <div className="w-full space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <PageHeader
          title={t('admin.seoCrud.title', 'SEO & Meta Settings')}
          subtitle={t('admin.seoCrud.subtitle', 'Configure global meta titles, keywords, descriptions, and OpenGraph tags.')}
        />
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 flex items-center gap-2 font-medium">
          <CheckCircle className="h-5 w-5 text-emerald-600" />
          {t('common.saveSuccess', 'SEO Settings saved successfully!')}
        </div>
      )}

      {saveError && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 font-medium">
          {saveError}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          saveMutation.mutate();
        }}
        className="space-y-6"
      >
        {/* Section 1: Basic Site Meta */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-5">
          <div className="flex items-center gap-2 border-b pb-3">
            <Search className="h-5 w-5 text-primary" />
            <h2 className="text-base font-bold text-slate-800">{t('admin.seoCrud.metaTitle', 'Site Meta Info')}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t('admin.seoCrud.siteTitleEn', 'Site Title (English)')}
              value={form.siteTitle || ''}
              onChange={(e) => setForm({ ...form, siteTitle: e.target.value })}
              placeholder="Manhattan Language School"
              required
            />
            <Input
              label={t('admin.seoCrud.siteTitleAr', 'Site Title (Arabic)')}
              value={form.siteTitleAr || ''}
              onChange={(e) => setForm({ ...form, siteTitleAr: e.target.value })}
              placeholder="مدرسة منهاتن للغات"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">{t('admin.seoCrud.metaDescriptionEn', 'Meta Description (English)')}</label>
              <textarea
                className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none min-h-[90px]"
                value={form.siteDescription || ''}
                onChange={(e) => setForm({ ...form, siteDescription: e.target.value })}
                placeholder="Manhattan Language School provides world-class education..."
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">{t('admin.seoCrud.metaDescriptionAr', 'Meta Description (Arabic)')}</label>
              <textarea
                className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none min-h-[90px]"
                value={form.siteDescriptionAr || ''}
                onChange={(e) => setForm({ ...form, siteDescriptionAr: e.target.value })}
                placeholder="تقدم مدرسة منهاتن للغات تعليمًا عالمي المستوى..."
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">{t('admin.seoCrud.keywords', 'Keywords (comma separated)')}</label>
            <textarea
              className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              rows={2}
              value={form.defaultKeywords || ''}
              onChange={(e) => setForm({ ...form, defaultKeywords: e.target.value })}
              placeholder="مدرسة مانهاتن للغات, مدرسة لغات, رياض الأطفال, الابتدائي, الإعدادي, Manhattan Language School"
            />
          </div>
        </div>

        {/* Section 2: Social Media OpenGraph */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-5">
          <div className="flex items-center gap-2 border-b pb-3">
            <Share2 className="h-5 w-5 text-primary" />
            <h2 className="text-base font-bold text-slate-800">معاينة المشاركة في وسائل التواصل (OpenGraph)</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Input
                label="رابط صورة المشاركة التلقائية (OG Image)"
                value={form.defaultOgImage || ''}
                onChange={(e) => setForm({ ...form, defaultOgImage: e.target.value })}
                placeholder="https://example.com/images/og-share.jpg"
              />
              <div className="flex items-center gap-3 pt-1">
                <input
                  ref={ogFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setIsUploadingOg(true);
                    try {
                      const res = await storageApi.upload(file, 'seo');
                      const url = res.data.fileUrl || res.data.url;
                      setForm((prev) => ({ ...prev, defaultOgImage: url }));
                    } catch (err) {
                      console.error('Failed to upload OG Image', err);
                    } finally {
                      setIsUploadingOg(false);
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="text-xs py-1.5 px-3 flex items-center gap-1.5 shadow-2xs"
                  disabled={isUploadingOg}
                  onClick={() => ogFileInputRef.current?.click()}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploadingOg ? 'جاري الرفع...' : 'رفع من الكمبيوتر'}</span>
                </Button>
                <Button
                  type="button"
                  variant="gold"
                  className="text-xs py-1.5 px-3 flex items-center gap-1.5 shadow-2xs font-bold"
                  onClick={() => setOpenPicker(true)}
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>مكتبة الصور (GCS)</span>
                </Button>

                <MediaPickerModal
                  open={openPicker}
                  onClose={() => setOpenPicker(false)}
                  defaultFolder="seo"
                  onSelect={(url) => setForm((prev) => ({ ...prev, defaultOgImage: url }))}
                />
                {form.defaultOgImage && (
                  <span className="text-xs text-slate-500 truncate max-w-[200px]">
                    تم التحديد: {form.defaultOgImage}
                  </span>
                )}
              </div>

              {form.defaultOgImage && (
                <div className="mt-2 rounded-lg border p-2 bg-slate-50 flex items-center gap-3">
                  <img
                    src={mediaUrl(form.defaultOgImage)}
                    alt="OG Preview"
                    className="h-14 w-24 object-cover rounded border"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <div className="text-xs text-slate-600">
                    <span className="font-semibold block">معاينة الصورة</span>
                    <span className="text-slate-400">تظهر عند مشاركة رابط الموقع على مواقع التواصل الاجتماعي</span>
                  </div>
                </div>
              )}
            </div>

            <Input
              label="حساب منصة X (تويتر)"
              value={form.twitterHandle || ''}
              onChange={(e) => setForm({ ...form, twitterHandle: e.target.value })}
              placeholder="@manhattanschool"
            />
          </div>
        </div>

        {/* Section 3: Analytics & Webmaster */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-5">
          <div className="flex items-center gap-2 border-b pb-3">
            <BarChart2 className="h-5 w-5 text-primary" />
            <h2 className="text-base font-bold text-slate-800">أدوات الإحصائيات وجوجل (Google Analytics & Search Console)</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="معرف تحليلات جوجل GA4"
              value={form.googleAnalyticsId || ''}
              onChange={(e) => setForm({ ...form, googleAnalyticsId: e.target.value })}
              placeholder="G-XXXXXXXXXX"
            />
            <Input
              label="كود التحقق من Google Search Console"
              value={form.googleSearchConsoleTag || ''}
              onChange={(e) => setForm({ ...form, googleSearchConsoleTag: e.target.value })}
              placeholder="google-site-verification-string..."
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={saveMutation.isPending} className="py-2.5 px-6 shadow-sm flex items-center gap-2">
            <Save className="h-4 w-4" />
            <span>{saveMutation.isPending ? 'جاري الحفظ...' : 'حفظ إعدادات SEO الشاملة'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
