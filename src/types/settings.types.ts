// Settings Types for Dua Azkari Platform
// جميع أنواع الإعدادات المطلوبة

import { z } from 'zod'

// ============= الإعدادات الأساسية (General Settings) =============
export const generalSettingsSchema = z.object({
  siteName: z.string().min(1, 'اسم الموقع مطلوب'),
  siteTitle: z.string().min(1, 'عنوان الموقع مطلوب'),
  siteDescription: z.string().min(1, 'وصف الموقع مطلوب'),
  charset: z.string().default('UTF-8'),
  titleSeparator: z.enum(['-', '|', '•', '/']).default('-'),
  logoUrl: z.string().url('رابط غير صحيح').optional().or(z.literal('')),
  faviconUrl: z.string().url('رابط غير صحيح').optional().or(z.literal('')),
  defaultImageUrl: z.string().url('رابط غير صحيح').optional().or(z.literal('')),
  copyrightText: z.string().default('جميع الحقوق محفوظة © 2025'),
  madeWithLoveText: z.string().default('صُنع بـ ❤️ لخدمة الإسلام')
})

export type GeneralSettings = z.infer<typeof generalSettingsSchema>

// ============= إعدادات الصفحة الرئيسية (Home Page Settings) =============
export const homeBlockSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'عنوان البلوك مطلوب'),
  categoryId: z.string().min(1, 'يجب اختيار قسم'),
  postsCount: z.number().min(1).max(20).default(6),
  icon: z.string().optional(),
  blockColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'يجب إدخال لون HEX صحيح').default('#1e9e94'),
  backgroundColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'يجب إدخال لون HEX صحيح').default('#ffffff'),
  orderNumber: z.number().default(0),
  isActive: z.boolean().default(true)
})

export const homeAdsSchema = z.object({
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
  customAds: z.array(z.object({
    id: z.string(),
    name: z.string(),
    position: z.string(),
    code: z.string(),
    enabled: z.boolean().default(true)
  })).default([])
})

export const homePageSettingsSchema = z.object({
  blocks: z.array(homeBlockSchema).default([]),
  ads: homeAdsSchema
})

export type HomeBlock = z.infer<typeof homeBlockSchema>
export type HomeAds = z.infer<typeof homeAdsSchema>
export type HomePageSettings = z.infer<typeof homePageSettingsSchema>

// ============= إعدادات صفحة المقال/الذكر (Post Page Settings) =============
export const postPageSettingsSchema = z.object({
  showTags: z.boolean().default(true),
  showRelatedPosts: z.boolean().default(true),
  relatedPostsCount: z.number().min(1).max(12).default(6),
  enableComments: z.boolean().default(false),
  enableSharing: z.boolean().default(true),
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
    inContentAd: z.object({
      enabled: z.boolean().default(false),
      code: z.string().optional(),
      position: z.enum(['top', 'middle', 'bottom']).default('middle')
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

export type PostPageSettings = z.infer<typeof postPageSettingsSchema>

// ============= إعدادات صفحة الفئة (Category Page Settings) =============
export const categoryPageSettingsSchema = z.object({
  postsPerPage: z.number().min(6).max(50).default(12),
  showDescription: z.boolean().default(true),
  showPostCount: z.boolean().default(true),
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
    customAds: z.array(z.object({
      id: z.string(),
      name: z.string(),
      position: z.string(),
      code: z.string(),
      enabled: z.boolean().default(true)
    })).default([])
  })
})

export type CategoryPageSettings = z.infer<typeof categoryPageSettingsSchema>

// ============= إعدادات صفحة الوسوم (Tag Page Settings) =============
export const tagPageSettingsSchema = z.object({
  // إعدادات SEO
  seo: z.object({
    title: z.string().default('جميع الوسوم - دعاء أذكاري'),
    description: z.string().default('استكشف جميع وسوم الأدعية والأذكار الإسلامية المصنفة حسب الموضوعات'),
    keywords: z.string().default('وسوم, أدعية, أذكار, تصنيفات إسلامية'),
    ogImage: z.string().url().optional().or(z.literal(''))
  }).default({
    title: 'جميع الوسوم - دعاء أذكاري',
    description: 'استكشف جميع وسوم الأدعية والأذكار الإسلامية المصنفة حسب الموضوعات',
    keywords: 'وسوم, أدعية, أذكار, تصنيفات إسلامية',
    ogImage: ''
  }),
  
  // إعدادات العرض العامة
  postsPerPage: z.number().min(6).max(50).default(12),
  showDescription: z.boolean().default(true),
  showPostCount: z.boolean().default(true),
  
  // إعدادات قسم "الوسوم الأكثر استخداماً"
  mostUsedTags: z.object({
    show: z.boolean().default(true),
    title: z.string().default('الوسوم الأكثر استخداماً'),
    count: z.number().min(3).max(20).default(8),
    sortBy: z.enum(['usage', 'name', 'recent']).default('usage'),
    layout: z.enum(['grid', 'list', 'cloud']).default('grid'),
    manualSelection: z.boolean().default(false), // اختيار يدوي أو تلقائي
    selectedTagIds: z.array(z.string()).default([]) // IDs الوسوم المختارة يدوياً
  }).default({
    show: true,
    title: 'الوسوم الأكثر استخداماً',
    count: 8,
    sortBy: 'usage',
    layout: 'grid',
    manualSelection: false,
    selectedTagIds: []
  }),
  
  // إعدادات قسم "جميع الوسوم"
  allTags: z.object({
    show: z.boolean().default(true),
    title: z.string().default('جميع الوسوم'),
    count: z.number().min(1).max(100).default(50),
    groupByLetter: z.boolean().default(true),
    showEmptyLetters: z.boolean().default(false),
    layout: z.enum(['grid', 'list', 'alphabetical', 'cloud']).default('alphabetical'),
    manualSelection: z.boolean().default(false),
    selectedTagIds: z.array(z.string()).default([])
  }).default({
    show: true,
    title: 'جميع الوسوم',
    count: 50,
    groupByLetter: true,
    showEmptyLetters: false,
    layout: 'alphabetical',
    manualSelection: false,
    selectedTagIds: []
  }),
  
  // إعدادات العرض التفصيلي
  detailedView: z.object({
    show: z.boolean().default(true),
    title: z.string().default('عرض تفصيلي'),
    count: z.number().min(1).max(100).default(20),
    showIcon: z.boolean().default(true),
    showStats: z.boolean().default(true),
    showRelatedTags: z.boolean().default(true),
    relatedTagsCount: z.number().min(3).max(10).default(5),
    cardStyle: z.enum(['minimal', 'detailed', 'compact']).default('detailed'),
    layout: z.enum(['grid', 'list']).default('grid'),
    manualSelection: z.boolean().default(false),
    selectedTagIds: z.array(z.string()).default([])
  }).default({
    show: true,
    title: 'عرض تفصيلي',
    count: 20,
    showIcon: true,
    showStats: true,
    showRelatedTags: true,
    relatedTagsCount: 5,
    cardStyle: 'detailed',
    layout: 'grid',
    manualSelection: false,
    selectedTagIds: []
  }),
  
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
    customAds: z.array(z.object({
      id: z.string(),
      name: z.string(),
      position: z.string(),
      code: z.string(),
      enabled: z.boolean().default(true)
    })).default([])
  })
})

export type TagPageSettings = z.infer<typeof tagPageSettingsSchema>

// ============= إعدادات أدوات المشرفين (Webmaster Tools) =============
export const webmasterSettingsSchema = z.object({
  googleVerification: z.string().optional(),
  yandexVerification: z.string().optional(),
  bingVerification: z.string().optional(),
  baiduVerification: z.string().optional(),
  googleAnalyticsId: z.string().optional(),
  googleTagManagerId: z.string().optional(),
  noindex: z.boolean().default(false),
  robotsTxt: z.string().optional(),
  adsTxt: z.string().optional()
})

export type WebmasterSettings = z.infer<typeof webmasterSettingsSchema>

// ============= إعدادات الأداء (Performance Settings) =============
export const performanceSettingsSchema = z.object({
  enableCache: z.boolean().default(true),
  cacheMaxAge: z.number().min(0).max(3600).default(60),
  lazyLoadImages: z.boolean().default(true),
  lazyLoadScripts: z.boolean().default(true),
  lazyLoadAds: z.boolean().default(true),
  lazyLoadAnalytics: z.boolean().default(true),
  minifyHtml: z.boolean().default(true),
  minifyCss: z.boolean().default(true),
  minifyJs: z.boolean().default(true),
  enableGzip: z.boolean().default(true),
  enableBrotli: z.boolean().default(true)
})

export type PerformanceSettings = z.infer<typeof performanceSettingsSchema>

// ============= إعدادات منصات التواصل (Social Media Settings) =============
export const socialMediaSettingsSchema = z.object({
  enabled: z.boolean().default(true), // تشغيل/إيقاف عرض السوشال ميديا
  facebook: z.string().url('رابط غير صحيح').optional().or(z.literal('')),
  facebookAppId: z.string().optional(),
  twitter: z.string().url('رابط غير صحيح').optional().or(z.literal('')),
  twitterUsername: z.string().optional(),
  linkedin: z.string().url('رابط غير صحيح').optional().or(z.literal('')),
  youtube: z.string().url('رابط غير صحيح').optional().or(z.literal('')),
  instagram: z.string().url('رابط غير صحيح').optional().or(z.literal('')),
  pinterest: z.string().url('رابط غير صحيح').optional().or(z.literal('')),
  telegram: z.string().url('رابط غير صحيح').optional().or(z.literal('')),
  whatsapp: z.string().optional(),
  whatsappChannel: z.string().url('رابط غير صحيح').optional().or(z.literal('')),
  tiktok: z.string().url('رابط غير صحيح').optional().or(z.literal('')),
  snapchat: z.string().url('رابط غير صحيح').optional().or(z.literal(''))
})

export type SocialMediaSettings = z.infer<typeof socialMediaSettingsSchema>

// ============= إعدادات SEO المتقدم (Advanced SEO Settings) =============
export const advancedSeoSettingsSchema = z.object({
  enableJsonLd: z.boolean().default(true),
  enableOpenGraph: z.boolean().default(true),
  enableTwitterCards: z.boolean().default(true),
  enableBreadcrumbs: z.boolean().default(true),
  defaultOgImage: z.string().url('رابط غير صحيح').optional().or(z.literal('')),
  twitterCardType: z.enum(['summary', 'summary_large_image', 'app', 'player']).default('summary_large_image'),
  siteLanguage: z.string().default('ar'),
  siteRegion: z.string().default('SA'),
  canonicalUrl: z.string().url('رابط غير صحيح').optional().or(z.literal('')),
  alternateLanguages: z.array(z.object({
    lang: z.string(),
    url: z.string().url()
  })).default([])
})

export type AdvancedSeoSettings = z.infer<typeof advancedSeoSettingsSchema>

// ============= إعدادات القوائم (Menu Settings) =============
export const menuItemSchema: z.ZodType<{
  id: string
  label: string
  url: string
  icon?: string
  target: '_self' | '_blank'
  orderNumber: number
  isActive: boolean
  category?: string
  children: Array<{
    id: string
    label: string
    url: string
    icon?: string
    target: '_self' | '_blank'
    orderNumber: number
    isActive: boolean
    category?: string
    children: any[]
  }>
}> = z.object({
  id: z.string(),
  label: z.string().min(1, 'التسمية مطلوبة'),
  url: z.string().min(1, 'الرابط مطلوب'),
  icon: z.string().optional(),
  target: z.enum(['_self', '_blank']).default('_self'),
  orderNumber: z.number().default(0),
  isActive: z.boolean().default(true),
  category: z.string().optional(),
  children: z.array(z.lazy(() => menuItemSchema)).default([])
})

export const menuSettingsSchema = z.object({
  headerMenu: z.array(menuItemSchema).default([]),
  footerMenu: z.array(menuItemSchema).default([]),
  sidebarMenu: z.array(menuItemSchema).default([])
})

export type MenuItem = z.infer<typeof menuItemSchema>
export type MenuSettings = z.infer<typeof menuSettingsSchema>

// ============= إعدادات الأيقونات (Icons Settings) =============
export const iconSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'اسم الأيقونة مطلوب'),
  emoji: z.string().optional(),
  imageUrl: z.string().url('رابط غير صحيح').optional(),
  category: z.string().default('general'),
  isActive: z.boolean().default(true)
})

export const iconsSettingsSchema = z.object({
  icons: z.array(iconSchema).default([]),
  defaultIcon: z.string().default('📿'),
  moreIcon: z.string().default('➕')
})

export type Icon = z.infer<typeof iconSchema>
export type IconsSettings = z.infer<typeof iconsSettingsSchema>

// ============= أكواد خاصة (Custom Code Settings) =============
export const customCodeSettingsSchema = z.object({
  headerCode: z.string().optional(),
  footerCode: z.string().optional(),
  customCss: z.string().optional(),
  customJs: z.string().optional()
})

export type CustomCodeSettings = z.infer<typeof customCodeSettingsSchema>

// ============= إعدادات متفرقة (Miscellaneous Settings) =============
export const miscSettingsSchema = z.object({
  themeColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'يجب إدخال لون HEX صحيح').default('#1e9e94'),
  enableStatistics: z.boolean().default(true),
  scriptVersion: z.string().default('1.0.0'),
  maintenanceMode: z.boolean().default(false),
  maintenanceMessage: z.string().optional(),
  enableNewsletter: z.boolean().default(false),
  contactEmail: z.string().email('بريد إلكتروني غير صحيح').optional(),
  contactPhone: z.string().optional()
})

export type MiscSettings = z.infer<typeof miscSettingsSchema>

// ============= نوع شامل لجميع الإعدادات =============
export interface AllSettings {
  general: GeneralSettings
  homePage: HomePageSettings
  postPage: PostPageSettings
  audioPage: import('./audio-settings.types').AudioSettings
  categoryPage: CategoryPageSettings
  tagPage: TagPageSettings
  webmaster: WebmasterSettings
  performance: PerformanceSettings
  socialMedia: SocialMediaSettings
  advancedSeo: AdvancedSeoSettings
  menus: MenuSettings
  icons: IconsSettings
  customCode: CustomCodeSettings
  misc: MiscSettings
}

// مجموعات الإعدادات
export type SettingGroup = 
  | 'general'
  | 'homePage'
  | 'postPage'
  | 'audioPage'
  | 'categoryPage'
  | 'tagPage'
  | 'webmaster'
  | 'performance'
  | 'socialMedia'
  | 'advancedSeo'
  | 'menus'
  | 'icons'
  | 'customCode'
  | 'misc'

// القيم الافتراضية
export const defaultSettings: AllSettings = {
  general: {
    siteName: 'دعاء أذكاري',
    siteTitle: 'دعاء أذكاري - منصة الأدعية والأذكار الإسلامية',
    siteDescription: 'منصة إسلامية شاملة للأدعية والأذكار الصحيحة من القرآن الكريم والسنة النبوية الشريفة',
    charset: 'UTF-8',
    titleSeparator: '-',
    logoUrl: '',
    faviconUrl: '',
    defaultImageUrl: '',
    copyrightText: 'جميع الحقوق محفوظة © 2025 دعاء أذكاري',
    madeWithLoveText: 'صُنع بـ ❤️ لخدمة الإسلام'
  },
  homePage: {
    blocks: [],
    ads: {
      enabled: false,
      publisherId: '',
      headerAd: { enabled: false, code: '' },
      footerAd: { enabled: false, code: '' },
      sidebarAd: { enabled: false, code: '' },
      customAds: []
    }
  },
  postPage: {
    showTags: true,
    showRelatedPosts: true,
    relatedPostsCount: 6,
    enableComments: false,
    enableSharing: true,
    ads: {
      enabled: false,
      publisherId: '',
      headerAd: { enabled: false, code: '' },
      footerAd: { enabled: false, code: '' },
      sidebarAd: { enabled: false, code: '' },
      inContentAd: { enabled: false, code: '', position: 'middle' },
      customAds: []
    }
  },
  audioPage: {
    pageLayout: 'two-columns',
    displayStyle: 'card',
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
  },
  categoryPage: {
    postsPerPage: 12,
    showDescription: true,
    showPostCount: true,
    ads: {
      enabled: false,
      publisherId: '',
      headerAd: { enabled: false, code: '' },
      footerAd: { enabled: false, code: '' },
      sidebarAd: { enabled: false, code: '' },
      customAds: []
    }
  },
  tagPage: {
    seo: {
      title: 'جميع الوسوم - دعاء أذكاري',
      description: 'استكشف جميع وسوم الأدعية والأذكار الإسلامية المصنفة حسب الموضوعات',
      keywords: 'وسوم, أدعية, أذكار, تصنيفات إسلامية',
      ogImage: ''
    },
    postsPerPage: 12,
    showDescription: true,
    showPostCount: true,
    mostUsedTags: {
      show: true,
      title: 'الوسوم الأكثر استخداماً',
      count: 8,
      sortBy: 'usage' as const,
      layout: 'grid' as const,
      manualSelection: false,
      selectedTagIds: []
    },
    allTags: {
      show: true,
      title: 'جميع الوسوم',
      count: 50,
      groupByLetter: true,
      showEmptyLetters: false,
      layout: 'alphabetical' as const,
      manualSelection: false,
      selectedTagIds: []
    },
    detailedView: {
      show: true,
      title: 'عرض تفصيلي',
      count: 20,
      showIcon: true,
      showStats: true,
      showRelatedTags: true,
      relatedTagsCount: 5,
      cardStyle: 'detailed' as const,
      layout: 'grid' as const,
      manualSelection: false,
      selectedTagIds: []
    },
    ads: {
      enabled: false,
      publisherId: '',
      headerAd: { enabled: false, code: '' },
      footerAd: { enabled: false, code: '' },
      sidebarAd: { enabled: false, code: '' },
      customAds: []
    }
  },
  webmaster: {
    googleVerification: '',
    yandexVerification: '',
    bingVerification: '',
    baiduVerification: '',
    googleAnalyticsId: '',
    googleTagManagerId: '',
    noindex: false,
    robotsTxt: '',
    adsTxt: ''
  },
  performance: {
    enableCache: true,
    cacheMaxAge: 60,
    lazyLoadImages: true,
    lazyLoadScripts: true,
    lazyLoadAds: true,
    lazyLoadAnalytics: true,
    minifyHtml: true,
    minifyCss: true,
    minifyJs: true,
    enableGzip: true,
    enableBrotli: true
  },
  socialMedia: {
    enabled: true, // مفعل افتراضياً
    facebook: '',
    facebookAppId: '',
    twitter: '',
    twitterUsername: '',
    linkedin: '',
    youtube: '',
    instagram: '',
    pinterest: '',
    telegram: '',
    whatsapp: '',
    whatsappChannel: '',
    tiktok: '',
    snapchat: ''
  },
  advancedSeo: {
    enableJsonLd: true,
    enableOpenGraph: true,
    enableTwitterCards: true,
    enableBreadcrumbs: true,
    defaultOgImage: '',
    twitterCardType: 'summary_large_image',
    siteLanguage: 'ar',
    siteRegion: 'SA',
    canonicalUrl: '',
    alternateLanguages: []
  },
  menus: {
    headerMenu: [],
    footerMenu: [],
    sidebarMenu: []
  },
  icons: {
    icons: [],
    defaultIcon: '📿',
    moreIcon: '➕'
  },
  customCode: {
    headerCode: '',
    footerCode: '',
    customCss: '',
    customJs: ''
  },
  misc: {
    themeColor: '#1e9e94',
    enableStatistics: true,
    scriptVersion: '1.0.0',
    maintenanceMode: false,
    maintenanceMessage: '',
    enableNewsletter: false,
    contactEmail: '',
    contactPhone: ''
  }
}

