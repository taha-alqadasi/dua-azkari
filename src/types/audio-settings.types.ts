import { z } from 'zod'

// Audio Settings Schema
export const audioSettingsSchema = z.object({
  // تخطيط الصفحة
  pageLayout: z.enum([
    'single-column',        // عمود واحد
    'two-columns',          // عمودين
    'three-columns',        // ثلاثة أعمدة
    'four-columns',         // أربعة أعمدة
    'masonry',              // تخطيط مرتب (masonry)
    'grid-auto',            // شبكة تلقائية
    'grid-layout',          // المخطط الشبكي (جديد)
    'list-view',            // عرض قائمة
    'timeline',             // عرض زمني
    'carousel'              // عرض دائري
  ]).default('two-columns'),

  // نمط العرض
  displayStyle: z.enum([
    'compact',      // مدمج
    'card',         // بطاقات
    'detailed',     // تفصيلي
    'minimal',      // بسيط
    'elegant'       // أنيق
  ]).default('card'),

  // خيارات العرض
  showReciterName: z.boolean().default(true),
  showDuration: z.boolean().default(true),
  showCategory: z.boolean().default(true),
  showViewCount: z.boolean().default(true),
  showDownloadCount: z.boolean().default(true),
  showDate: z.boolean().default(false),

  // خيارات التنقل والتحميل
  enableLoadMore: z.boolean().default(true),
  postsPerPage: z.number().min(6).max(50).default(12),
  loadMoreButtonText: z.string().default('عرض المزيد'),

  // خيارات الفلترة
  enableCategoryFilter: z.boolean().default(true),
  enableSearch: z.boolean().default(true),
  enableSorting: z.boolean().default(true),

  // خيارات المشغل الصوتي
  autoPlayNext: z.boolean().default(false),
  showPlaylist: z.boolean().default(true),
  showWaveform: z.boolean().default(true),

  // الألوان والستايلات
  cardBackgroundColor: z.string().default('from-white to-gray-50'),
  hoverColor: z.string().default('from-primary to-teal-600'),

  // خيارات SEO
  pageTitle: z.string().default('جميع المقاطع الصوتية'),
  pageDescription: z.string().default('استمع إلى مجموعة شاملة من الأدعية والأذكار'),
  pageKeywords: z.string().default('أدعية، أذكار، مقاطع صوتية، قرآن'),

  // إعدادات الإعلانات
  ads: z.object({
    enabled: z.boolean().default(false),
    publisherId: z.string().optional(),
    headerAd: z.object({
      enabled: z.boolean().default(false),
      code: z.string().optional()
    }),
    footerAd: z.object({
      enabled: z.boolean().default(false),
      code: z.string().optional()
    }),
    sidebarAd: z.object({
      enabled: z.boolean().default(false),
      code: z.string().optional()
    }),
    betweenPostsAd: z.object({
      enabled: z.boolean().default(false),
      code: z.string().optional(),
      showAfterItems: z.number().min(1).max(20).default(6)
    }),
    customAds: z.array(z.object({
      id: z.string(),
      name: z.string(),
      position: z.string(),
      code: z.string(),
      enabled: z.boolean().default(true)
    })).default([])
  })
})

export type AudioSettings = z.infer<typeof audioSettingsSchema>

export const defaultAudioSettings: AudioSettings = {
  pageLayout: 'two-columns' as const,
  displayStyle: 'card' as const,
  showReciterName: true,
  showDuration: true,
  showCategory: true,
  showViewCount: true,
  showDownloadCount: true,
  showDate: false,
  enableLoadMore: true,
  postsPerPage: 12,
  loadMoreButtonText: 'عرض المزيد',
  enableCategoryFilter: true,
  enableSearch: true,
  enableSorting: true,
  autoPlayNext: false,
  showPlaylist: true,
  showWaveform: true,
  cardBackgroundColor: 'from-white to-gray-50',
  hoverColor: 'from-primary to-teal-600',
  pageTitle: 'جميع المقاطع الصوتية',
  pageDescription: 'استمع إلى مجموعة شاملة من الأدعية والأذكار',
  pageKeywords: 'أدعية، أذكار، مقاطع صوتية، قرآن',
  ads: {
    enabled: false,
    publisherId: '',
    headerAd: { enabled: false, code: '' },
    footerAd: { enabled: false, code: '' },
    sidebarAd: { enabled: false, code: '' },
    betweenPostsAd: { enabled: false, code: '', showAfterItems: 6 },
    customAds: []
  }
}

// Labels للـ UI
export const pageLayoutLabels = {
  'single-column': 'عمود واحد',
  'two-columns': 'عمودين',
  'three-columns': 'ثلاثة أعمدة',
  'four-columns': 'أربعة أعمدة',
  'masonry': 'تخطيط مرتب',
  'grid-auto': 'شبكة تلقائية',
  'grid-layout': 'المخطط الشبكي',
  'list-view': 'عرض قائمة',
  'timeline': 'عرض زمني',
  'carousel': 'عرض دائري'
}

export const displayStyleLabels = {
  'compact': 'مدمج',
  'card': 'بطاقات',
  'detailed': 'تفصيلي',
  'minimal': 'بسيط',
  'elegant': 'أنيق'
}

