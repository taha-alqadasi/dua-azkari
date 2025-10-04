import { Metadata } from 'next'
import { getAllSettings } from './settings'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'

// دالة للحصول على metadata من الإعدادات
export async function getMetadataFromSettings(): Promise<Metadata> {
  try {
    const settings = await getAllSettings()
    const { general, webmaster, advancedSeo } = settings
    
    const siteName = general.siteName || 'دعاء أذكاري'
    const siteTitle = general.siteTitle || siteName
    const siteDescription = general.siteDescription || 'منصة إسلامية شاملة للأدعية والأذكار الصحيحة من القرآن الكريم والسنة النبوية الشريفة. استمع، اقرأ، وشارك الأدعية والأذكار اليومية.'
    const logoUrl = general.logoUrl
    const faviconUrl = general.faviconUrl || '/favicon.ico'
    const defaultImage = advancedSeo.defaultOgImage || general.defaultImageUrl || '/og-image.png'

    return {
      metadataBase: new URL(baseUrl),
      title: {
        default: siteTitle,
        template: `%s ${general.titleSeparator || '|'} ${siteName}`,
      },
      description: siteDescription,
      keywords: [
        'أدعية إسلامية',
        'أذكار',
        'القرآن الكريم',
        'السنة النبوية',
        'أدعية يومية',
        'أذكار الصباح',
        'أذكار المساء',
        'دعاء',
        'أذكار النوم',
        'الرقية الشرعية',
        'أدعية مستجابة',
        'islamic prayers',
        'azkar',
        'dua',
        'islamic content'
      ],
      authors: [{ name: siteName }],
      creator: siteName,
      publisher: siteName,
      robots: webmaster.noindex ? {
        index: false,
        follow: false,
      } : {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      alternates: {
        canonical: advancedSeo.canonicalUrl || baseUrl,
        languages: {
          [advancedSeo.siteLanguage || 'ar']: baseUrl,
        },
      },
      openGraph: advancedSeo.enableOpenGraph ? {
        type: 'website',
        locale: `${advancedSeo.siteLanguage || 'ar'}_${advancedSeo.siteRegion || 'SA'}`,
        url: baseUrl,
        title: siteTitle,
        description: siteDescription,
        siteName: siteName,
        images: [
          {
            url: defaultImage,
            width: 1200,
            height: 630,
            alt: siteName,
          },
        ],
      } : undefined,
      twitter: advancedSeo.enableTwitterCards ? {
        card: advancedSeo.twitterCardType || 'summary_large_image',
        title: siteTitle,
        description: siteDescription,
        images: [defaultImage],
      } : undefined,
      icons: {
        icon: faviconUrl,
        shortcut: faviconUrl,
        apple: logoUrl || '/apple-touch-icon.png',
      },
      manifest: '/manifest.json',
      verification: {
        google: webmaster.googleVerification,
        yandex: webmaster.yandexVerification,
        other: {
          'msvalidate.01': webmaster.bingVerification || '',
          'baidu-site-verification': webmaster.baiduVerification || '',
        }
      },
    }
  } catch (error) {
    console.error('Error getting metadata from settings:', error)
    // إرجاع metadata افتراضية في حالة الخطأ
    return defaultMetadata
  }
}

const siteName = 'دعاء أذكاري'
const siteDescription = 'منصة إسلامية شاملة للأدعية والأذكار الصحيحة من القرآن الكريم والسنة النبوية الشريفة. استمع، اقرأ، وشارك الأدعية والأذكار اليومية.'

export const defaultMetadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    'أدعية إسلامية',
    'أذكار',
    'القرآن الكريم',
    'السنة النبوية',
    'أدعية يومية',
    'أذكار الصباح',
    'أذكار المساء',
    'دعاء',
    'أذكار النوم',
    'الرقية الشرعية',
    'أدعية مستجابة',
    'islamic prayers',
    'azkar',
    'dua',
    'islamic content'
  ],
  authors: [{ name: 'دعاء أذكاري' }],
  creator: 'دعاء أذكاري',
  publisher: 'دعاء أذكاري',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: baseUrl,
    languages: {
      'ar': baseUrl,
      'en': baseUrl,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    alternateLocale: ['en_US'],
    url: baseUrl,
    title: siteName,
    description: siteDescription,
    siteName: siteName,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: siteName,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteName,
    description: siteDescription,
    images: ['/twitter-image.png'],
    creator: '@duaazkari',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  verification: process.env.GOOGLE_SITE_VERIFICATION ? {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  } : undefined,
}

export function generatePageMetadata({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
}: {
  title: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article'
}): Metadata {
  const pageUrl = url ? `${baseUrl}${url}` : baseUrl
  const pageImage = image || '/og-image.png'
  const pageDescription = description || siteDescription

  return {
    title,
    description: pageDescription,
    keywords: keywords || defaultMetadata.keywords,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type,
      locale: 'ar_SA',
      url: pageUrl,
      title,
      description: pageDescription,
      siteName,
      images: [
        {
          url: pageImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: pageDescription,
      images: [pageImage],
    },
  }
}

export function generateArticleMetadata({
  title,
  description,
  image,
  url,
  publishedTime,
  modifiedTime,
  authors,
  tags,
}: {
  title: string
  description: string
  image?: string
  url: string
  publishedTime?: Date
  modifiedTime?: Date
  authors?: string[]
  tags?: string[]
}): Metadata {
  return {
    ...generatePageMetadata({
      title,
      description,
      image,
      url,
      type: 'article',
    }),
    openGraph: {
      type: 'article',
      locale: 'ar_SA',
      url: `${baseUrl}${url}`,
      title,
      description,
      siteName,
      publishedTime: publishedTime?.toISOString(),
      modifiedTime: modifiedTime?.toISOString(),
      authors: authors,
      tags: tags,
      images: [
        {
          url: image || '/og-image.png',
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
  }
}

