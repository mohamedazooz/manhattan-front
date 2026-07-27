import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { seoApi } from '../../api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { PageHeader } from '../../components/ui/Badge';
import { getApiErrorMessage } from '../../lib/formData';
import type { SeoConfig } from '../../types';

export function SeoAdminPage() {
  const qc = useQueryClient();
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
      setSaveError(getApiErrorMessage(error, 'Failed to update SEO settings'));
      setSaveSuccess(false);
    },
  });

  if (isLoading) {
    return <div className="p-6">Loading SEO settings...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <PageHeader title="SEO & Search Engine Settings" subtitle="Manage website metadata, keywords, social preview tags, and verification IDs" />

      {saveSuccess && (
        <div className="p-4 bg-green-50 text-green-700 rounded-md border border-green-200">
          SEO settings updated successfully!
        </div>
      )}

      {saveError && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
          {saveError}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          saveMutation.mutate();
        }}
        className="space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-100"
      >
        <h2 className="text-xl font-bold text-gray-800 border-b pb-3">Basic Site Meta</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Site Title (English)"
            value={form.siteTitle || ''}
            onChange={(e) => setForm({ ...form, siteTitle: e.target.value })}
            placeholder="Manhattan Language School"
            required
          />
          <Input
            label="Site Title (Arabic)"
            value={form.siteTitleAr || ''}
            onChange={(e) => setForm({ ...form, siteTitleAr: e.target.value })}
            placeholder="مدرسة منهاتن للغات"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Site Description (English)</label>
          <textarea
            className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            rows={3}
            value={form.siteDescription || ''}
            onChange={(e) => setForm({ ...form, siteDescription: e.target.value })}
            placeholder="Manhattan Language School provides world-class education..."
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Site Description (Arabic)</label>
          <textarea
            className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            rows={3}
            value={form.siteDescriptionAr || ''}
            onChange={(e) => setForm({ ...form, siteDescriptionAr: e.target.value })}
            placeholder="تقدم مدرسة منهاتن للغات تعليمًا عالمي المستوى..."
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Default Meta Keywords (comma separated)</label>
          <textarea
            className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            rows={2}
            value={form.defaultKeywords || ''}
            onChange={(e) => setForm({ ...form, defaultKeywords: e.target.value })}
            placeholder="Manhattan Language School, Cairo schools, International Education, مدرسة منهاتن للغات"
          />
        </div>

        <h2 className="text-xl font-bold text-gray-800 border-b pb-3 pt-4">Social Media & Sharing (Open Graph / Twitter)</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Default OG Image URL"
            value={form.defaultOgImage || ''}
            onChange={(e) => setForm({ ...form, defaultOgImage: e.target.value })}
            placeholder="https://example.com/images/og-share.jpg"
          />
          <Input
            label="Twitter Handle"
            value={form.twitterHandle || ''}
            onChange={(e) => setForm({ ...form, twitterHandle: e.target.value })}
            placeholder="@manhattanschool"
          />
        </div>

        <h2 className="text-xl font-bold text-gray-800 border-b pb-3 pt-4">Analytics & Search Console</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Google Analytics ID (GA4)"
            value={form.googleAnalyticsId || ''}
            onChange={(e) => setForm({ ...form, googleAnalyticsId: e.target.value })}
            placeholder="G-XXXXXXXXXX"
          />
          <Input
            label="Google Search Console Verification Tag"
            value={form.googleSearchConsoleTag || ''}
            onChange={(e) => setForm({ ...form, googleSearchConsoleTag: e.target.value })}
            placeholder="google-site-verification code string"
          />
        </div>

        <div className="pt-4 flex justify-end">
          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Saving...' : 'Save SEO Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
}
