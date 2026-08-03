export type AdminPageGuideKey =
  | 'hero'
  | 'sections'
  | 'studentLife'
  | 'about'
  | 'pages'
  | 'formDocuments'
  | 'education'
  | 'gallery'
  | 'blog'
  | 'jobRequirements';

export interface AdminPageGuideConfig {
  guideKey: AdminPageGuideKey;
  publicPath: string;
  /** Optional careers apply path for job requirements */
  secondaryPath?: string;
}

export const ADMIN_PAGE_GUIDES: Record<AdminPageGuideKey, AdminPageGuideConfig> = {
  hero: { guideKey: 'hero', publicPath: '/' },
  sections: { guideKey: 'sections', publicPath: '/' },
  studentLife: { guideKey: 'studentLife', publicPath: '/student-life' },
  about: { guideKey: 'about', publicPath: '/about' },
  pages: { guideKey: 'pages', publicPath: '/pages' },
  formDocuments: { guideKey: 'formDocuments', publicPath: '/parents/forms' },
  education: { guideKey: 'education', publicPath: '/academics' },
  gallery: { guideKey: 'gallery', publicPath: '/' },
  blog: { guideKey: 'blog', publicPath: '/news' },
  jobRequirements: {
    guideKey: 'jobRequirements',
    publicPath: '/careers',
    secondaryPath: '/careers',
  },
};
