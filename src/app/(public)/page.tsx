import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { prisma } from '@/lib/prisma'
import { getAllSettings } from '@/lib/settings'
import { PublicHeader } from '@/components/shared/PublicHeader'
import { PublicFooter } from '@/components/shared/PublicFooter'
import { AdsManager } from '@/components/shared/AdsManager'
import { 
  Volume2,
  TrendingUp,
  BookOpen,
  Clock,
  FolderOpen,
  Eye,
  Play,
  User,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Headphones,
  Shield,
  Zap,
  Heart,
  Star,
  Download,
  Share2
} from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'
import Image from 'next/image'

// تحسين الأداء - ISR مع revalidation كل دقيقة
export const revalidate = 60

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'

// Metadata will be generated dynamically in the component
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getAllSettings()
  const { general, advancedSeo, socialMedia } = settings

  const siteName = general.siteTitle || 'دعاء أذكاري - منصة الأدعية والأذكار الإسلامية'
  const siteDescription = general.siteDescription || 'منصة إسلامية شاملة للأدعية والأذكار الصحيحة من القرآن الكريم والسنة النبوية الشريفة. استمع، اقرأ، وشارك أدعية الصباح والمساء، الرقية الشرعية، وجميع الأذكار اليومية بجودة صوت عالية.'

  return {
    metadataBase: new URL(baseUrl),
    title: siteName,
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
    'أذكار الصلاة',
    'دعاء الاستخارة',
    'أذكار السفر',
    'Islamic prayers',
    'Azkar',
    'Dua',
    'Islamic audio',
    'Quran',
    'Sunnah'
  ],
    authors: [{ name: general.siteName, url: baseUrl }],
    creator: general.siteName,
    publisher: general.siteName,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
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
        'ar-SA': baseUrl,
        'ar': baseUrl,
      },
    },
    ...(advancedSeo.enableOpenGraph && {
      openGraph: {
        type: 'website',
        locale: `${advancedSeo.siteLanguage}_${advancedSeo.siteRegion}`,
        url: baseUrl,
        title: siteName,
        description: siteDescription,
        siteName: general.siteName,
        images: [
          {
            url: advancedSeo.defaultOgImage || `${baseUrl}/og-image.png`,
            width: 1200,
            height: 630,
            alt: siteName,
            type: 'image/png',
          },
        ],
      },
    }),
    ...(advancedSeo.enableTwitterCards && {
      twitter: {
        card: advancedSeo.twitterCardType,
        title: siteName,
        description: siteDescription,
        images: [advancedSeo.defaultOgImage || `${baseUrl}/twitter-image.png`],
        creator: socialMedia.twitterUsername || '@duaazkari',
        site: socialMedia.twitterUsername || '@duaazkari',
      },
    }),
    icons: {
      icon: [
        { url: general.faviconUrl || '/favicon.ico', sizes: 'any' },
        { url: general.faviconUrl || '/icon.png', type: 'image/png', sizes: '32x32' },
      ],
      shortcut: general.faviconUrl || '/favicon.ico',
      apple: [
        { url: general.faviconUrl || '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      ],
    },
    manifest: '/manifest.json',
    category: 'religion',
    classification: 'Islamic Content',
    other: {
      'mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
    },
  }
}

async function getHomeData() {
  const settings = await getAllSettings()
  const homeSettings = settings.homePage

  // جلب البيانات بناءً على البلوكات المخصصة أو الافتراضية
  const [
    recentPosts,
    categories,
    stats
  ] = await Promise.all([
    // أحدث المقاطع
    prisma.post.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      take: 6,
      select: {
        id: true,
        duaNumber: true,
        titleAr: true,
        slug: true,
        description: true,
        thumbnailUrl: true,
        audioDuration: true,
        reciterName: true,
        viewCount: true,
        category: {
          select: {
            nameAr: true,
            slug: true,
            color: true
          }
        }
      }
    }),
    // التصنيفات
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { orderNumber: 'asc' },
      take: 8,
      select: {
        id: true,
        nameAr: true,
        slug: true,
        color: true,
        icon: true,
        _count: {
          select: {
            posts: {
              where: { status: 'PUBLISHED' }
            }
          }
        }
      }
    }),
    // الإحصائيات
    Promise.all([
      prisma.post.count({ where: { status: 'PUBLISHED' } }),
      prisma.post.aggregate({
        _sum: { viewCount: true }
      }),
      prisma.category.count({ where: { isActive: true } })
    ])
  ])

  // جلب المنشورات لكل بلوك مخصص
  const customBlocks = await Promise.all(
    homeSettings.blocks
      .filter(block => block.isActive)
      .sort((a, b) => a.orderNumber - b.orderNumber)
      .map(async (block) => {
        const posts = await prisma.post.findMany({
          where: {
            status: 'PUBLISHED',
            categoryId: block.categoryId
          },
          orderBy: { publishedAt: 'desc' },
          take: block.postsCount,
          select: {
            id: true,
            duaNumber: true,
            titleAr: true,
            slug: true,
            description: true,
            thumbnailUrl: true,
            audioDuration: true,
            reciterName: true,
            viewCount: true,
            category: {
              select: {
                nameAr: true,
                slug: true,
                color: true
              }
            }
          }
        })

        return {
          ...block,
          posts
        }
      })
  )

  return {
    recentPosts,
    categories,
    customBlocks,
    settings,
    stats: {
      totalPosts: stats[0],
      totalViews: stats[1]._sum.viewCount || 0,
      totalCategories: stats[2]
    }
  }
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

export default async function PublicHomePage() {
  const { recentPosts, categories, stats, customBlocks, settings } = await getHomeData()
  
  const { general, misc } = settings
  const siteName = general.siteTitle
  const siteDescription = general.siteDescription
  const logoUrl = general.logoUrl

  // Schema.org structured data للـ SEO المتقدم (if enabled)
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${baseUrl}/#organization`,
    "name": "دعاء أذكاري",
    "url": baseUrl,
    "logo": {
      "@type": "ImageObject",
      "url": `${baseUrl}/logo.png`,
      "width": 512,
      "height": 512
    },
    "description": siteDescription,
    "sameAs": [
      "https://www.facebook.com/duaazkari",
      "https://twitter.com/duaazkari",
      "https://www.instagram.com/duaazkari",
      "https://www.youtube.com/@duaazkari"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "availableLanguage": ["Arabic", "English"]
    }
  }

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    "url": baseUrl,
    "name": "دعاء أذكاري",
    "description": siteDescription,
    "publisher": {
      "@id": `${baseUrl}/#organization`
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "inLanguage": "ar-SA"
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "الرئيسية",
        "item": baseUrl
      }
    ]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50" dir="rtl">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema)
        }}
      />

      {/* Header */}
      <PublicHeader 
        showSearch={true} 
        logoUrl={logoUrl} 
        siteName={siteName}
        siteDescription={siteDescription}
      />

      {/* إعلان Header */}
      <AdsManager page="home" position="header" />

      {/* Hero Section - Enhanced Design */}
      <section className="relative bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 text-white overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Islamic Pattern Overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
        }}></div>

        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-5xl mx-auto">
            {/* Main Content */}
            <div className="text-center mb-12">
              {/* Icon with Animation */}
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl mb-6 shadow-2xl border-2 border-white/30 hover:scale-110 transition-transform duration-300">
                <Sparkles className="h-12 w-12 text-white animate-pulse" />
              </div>

              {/* Main Heading - SEO Optimized */}
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight drop-shadow-lg">
                دعاء أذكاري
              </h1>
              <p className="text-2xl md:text-3xl text-white/95 mb-4 leading-relaxed font-medium">
                منصتك الموثوقة للأدعية والأذكار الصحيحة
              </p>
              <p className="text-lg md:text-xl text-white/80 mb-10 leading-relaxed max-w-3xl mx-auto">
                استمع واقرأ الأدعية والأذكار من القرآن الكريم والسنة النبوية الشريفة بجودة صوت عالية
              </p>

              {/* CTA Buttons - Enhanced */}
              <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
                <Link href="/listen-all">
                  <Button 
                    size="lg" 
                    className="bg-white text-emerald-700 hover:bg-white/90 text-xl px-10 py-7 shadow-2xl font-bold rounded-2xl hover:scale-105 transition-all duration-300"
                    aria-label="استمع إلى جميع المقاطع الصوتية"
                  >
                    <Play className="h-6 w-6 ml-2" fill="currentColor" />
                    ابدأ الاستماع الآن
                  </Button>
                </Link>
                <Link href="/categories">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-3 border-white text-white hover:bg-white hover:text-emerald-700 text-xl px-10 py-7 shadow-2xl font-bold rounded-2xl hover:scale-105 transition-all duration-300 bg-white/10 backdrop-blur-sm"
                    aria-label="تصفح جميع التصنيفات"
                  >
                    <FolderOpen className="h-6 w-6 ml-2" />
                    تصفح التصنيفات
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stats Cards - Modern Design */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="bg-white/15 backdrop-blur-lg border-2 border-white/30 p-6 hover:bg-white/25 transition-all duration-300 hover:scale-105 hover:-translate-y-1 shadow-2xl rounded-2xl group">
                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Volume2 className="h-7 w-7 text-white" />
                  </div>
                  <div className="text-4xl font-bold mb-2" aria-label={`${stats.totalPosts} مقطع صوتي`}>
                    {stats.totalPosts}
                  </div>
                  <div className="text-base text-white/90 font-medium">مقطع صوتي</div>
                </div>
              </Card>

              <Card className="bg-white/15 backdrop-blur-lg border-2 border-white/30 p-6 hover:bg-white/25 transition-all duration-300 hover:scale-105 hover:-translate-y-1 shadow-2xl rounded-2xl group">
                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <TrendingUp className="h-7 w-7 text-white" />
                  </div>
                  <div className="text-4xl font-bold mb-2" aria-label={`${stats.totalViews} مشاهدة`}>
                    {stats.totalViews.toLocaleString('ar-SA')}
                  </div>
                  <div className="text-base text-white/90 font-medium">مشاهدة</div>
                </div>
              </Card>

              <Card className="bg-white/15 backdrop-blur-lg border-2 border-white/30 p-6 hover:bg-white/25 transition-all duration-300 hover:scale-105 hover:-translate-y-1 shadow-2xl rounded-2xl group">
                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <BookOpen className="h-7 w-7 text-white" />
                  </div>
                  <div className="text-4xl font-bold mb-2" aria-label={`${stats.totalCategories} تصنيف`}>
                    {stats.totalCategories}
                  </div>
                  <div className="text-base text-white/90 font-medium">تصنيف متنوع</div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Wave Divider - Smooth Transition */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto" preserveAspectRatio="none">
            <path fill="#f0fdf4" d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* Features Section - لماذا دعاء أذكاري */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl mb-4 shadow-lg">
              <Star className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">لماذا دعاء أذكاري؟</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              منصة متميزة تجمع الأصالة والتقنية لخدمة المسلمين
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <Card className="group bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-emerald-100 hover:border-emerald-300 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 rounded-3xl">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">محتوى موثوق</h3>
                <p className="text-gray-600 leading-relaxed">
                  جميع الأدعية والأذكار من مصادر صحيحة ومعتمدة من القرآن والسنة
                </p>
              </div>
            </Card>

            {/* Feature 2 */}
            <Card className="group bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-cyan-100 hover:border-cyan-300 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 rounded-3xl">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-cyan-600 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                  <Headphones className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">جودة صوت عالية</h3>
                <p className="text-gray-600 leading-relaxed">
                  استمع إلى الأدعية بأصوات جميلة وبجودة صوت HD واضحة
                </p>
              </div>
            </Card>

            {/* Feature 3 */}
            <Card className="group bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-100 hover:border-purple-300 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 rounded-3xl">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">سريع وسهل</h3>
                <p className="text-gray-600 leading-relaxed">
                  واجهة بسيطة وسريعة للوصول إلى ما تبحث عنه بكل سهولة
                </p>
              </div>
            </Card>

            {/* Feature 4 */}
            <Card className="group bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-100 hover:border-orange-300 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 rounded-3xl">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">مجاني بالكامل</h3>
                <p className="text-gray-600 leading-relaxed">
                  جميع المحتويات متاحة مجاناً لوجه الله تعالى دون أي رسوم
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-16">
        {/* Categories Section */}
        <section className="mb-20" aria-labelledby="categories-heading">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl mb-4 shadow-lg">
              <FolderOpen className="h-7 w-7 text-white" />
            </div>
            <h2 id="categories-heading" className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              تصنيفات الأدعية والأذكار
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              اختر من بين مجموعة متنوعة من التصنيفات المنظمة حسب المناسبات والموضوعات
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link key={category.id} href={`/category/${category.slug}`}>
                <Card className="group bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl p-6 flex flex-col items-center text-center border-2 border-transparent hover:border-primary/30 hover:-translate-y-2">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-4xl font-bold mb-4 shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300"
                    style={{ backgroundColor: category.color || '#1e9e94' }}
                  >
                    {category.icon || '📿'}
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors mb-2">
                    {category.nameAr}
                  </h4>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Volume2 className="h-3 w-3" />
                    <span>{category._count.posts} مقطع</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/categories">
              <Button size="lg" variant="outline" className="gap-2 hover:bg-primary hover:text-white transition-all">
                عرض جميع التصنيفات
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Custom Blocks Section */}
        {customBlocks.length > 0 && customBlocks.map((block, blockIndex) => (
          block.posts.length > 0 && (
            <section key={block.id} className={blockIndex > 0 ? 'mt-20' : ''} aria-labelledby={`block-${block.id}-heading`}>
              <div className="text-center mb-12">
                <div
                  className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 shadow-lg text-3xl"
                  style={{ backgroundColor: block.blockColor }}
                >
                  {block.icon}
                </div>
                <h2 id={`block-${block.id}-heading`} className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  {block.title}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {block.posts.map((post) => (
                  <Card
                    key={post.id}
                    className="group bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden border-2 border-transparent hover:border-primary/30 hover:-translate-y-1"
                  >
                    <Link href={`/listen/${post.duaNumber}/${post.slug}`}>
                      {/* Thumbnail */}
                      <div className="relative h-48 overflow-hidden" style={{ backgroundColor: block.backgroundColor }}>
                        {post.thumbnailUrl ? (
                          <img
                            src={post.thumbnailUrl}
                            alt={post.titleAr}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-6xl">
                            {block.icon || '🕌'}
                          </div>
                        )}

                        {/* Play Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                          <div
                            className="w-16 h-16 rounded-full text-white flex items-center justify-center transform scale-50 group-hover:scale-100 transition-all duration-300 shadow-2xl"
                            style={{ backgroundColor: block.blockColor }}
                          >
                            <Play className="h-8 w-8 mr-1" fill="currentColor" />
                          </div>
                        </div>

                        {/* Category Badge */}
                        <div className="absolute top-3 right-3">
                          <span
                            className="inline-flex items-center px-3 py-1 text-white rounded-full text-xs font-bold shadow-lg backdrop-blur-sm"
                            style={{ backgroundColor: post.category.color || block.blockColor }}
                          >
                            {post.category.nameAr}
                          </span>
                        </div>

                        {/* Prayer Number Badge */}
                        <div className="absolute top-3 left-3">
                          <span className="inline-flex items-center px-2.5 py-1 bg-white/90 backdrop-blur-sm text-primary rounded-full text-xs font-bold shadow-lg">
                            #{post.duaNumber}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h4 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors mb-2 line-clamp-2 leading-relaxed min-h-[3.5rem]">
                          {post.titleAr}
                        </h4>

                        {post.description && (
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
                            {post.description}
                          </p>
                        )}

                        {/* Meta Info */}
                        <div className="space-y-2">
                          {post.reciterName && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <User className="h-4 w-4 shrink-0" />
                              <span className="line-clamp-1">{post.reciterName}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{formatDuration(post.audioDuration)}</span>
                            </div>

                            {post.viewCount > 0 && (
                              <>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                  <Eye className="h-4 w-4" />
                                  <span>{post.viewCount.toLocaleString('ar-SA')}</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </Card>
                ))}
              </div>
            </section>
          )
        ))}

        {/* Recent Posts Section */}
        {customBlocks.length === 0 && (
          <section aria-labelledby="recent-posts-heading">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl mb-4 shadow-lg">
                <Volume2 className="h-7 w-7 text-white" />
              </div>
              <h2 id="recent-posts-heading" className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                أحدث المقاطع الصوتية
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                استمتع بأحدث الأدعية والأذكار المضافة بأصوات جميلة وجودة عالية
              </p>
            </div>

            {recentPosts.length === 0 ? (
            <Card className="p-16 text-center bg-white/90 backdrop-blur-sm shadow-xl rounded-3xl">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
                <Volume2 className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                لا توجد مقاطع صوتية بعد
              </h3>
              <p className="text-gray-600 mb-8 text-lg">
                ابدأ بإضافة أول مقطع صوتي من لوحة التحكم
              </p>
              <Link href="/admin/login">
                <Button size="lg" className="gap-2 shadow-lg text-lg px-8 py-6">
                  <ArrowRight className="h-5 w-5" />
                  الذهاب إلى لوحة التحكم
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentPosts.map((post) => (
                <Card
                  key={post.id}
                  className="group bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden border-2 border-transparent hover:border-primary/30 hover:-translate-y-1"
                >
                  <Link href={`/listen/${post.duaNumber}/${post.slug}`}>
                    {/* Thumbnail */}
                    <div className="relative h-48 bg-gradient-to-br from-primary/10 to-teal-50 overflow-hidden">
                      {post.thumbnailUrl ? (
                        <img
                          src={post.thumbnailUrl}
                          alt={post.titleAr}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary/30 text-6xl">
                          🕌
                        </div>
                      )}

                      {/* Play Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center transform scale-50 group-hover:scale-100 transition-all duration-300 shadow-2xl">
                          <Play className="h-8 w-8 mr-1" fill="currentColor" />
                        </div>
                      </div>

                      {/* Category Badge */}
                      <div className="absolute top-3 right-3">
                        <span
                          className="inline-flex items-center px-3 py-1 text-white rounded-full text-xs font-bold shadow-lg backdrop-blur-sm"
                          style={{ backgroundColor: post.category.color || '#1e9e94' }}
                        >
                          {post.category.nameAr}
                        </span>
                      </div>

                      {/* Prayer Number Badge */}
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center px-2.5 py-1 bg-white/90 backdrop-blur-sm text-primary rounded-full text-xs font-bold shadow-lg">
                          #{post.duaNumber}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h4 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors mb-2 line-clamp-2 leading-relaxed min-h-[3.5rem]">
                        {post.titleAr}
                      </h4>

                      {post.description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
                          {post.description}
                        </p>
                      )}

                      {/* Meta Info */}
                      <div className="space-y-2">
                        {post.reciterName && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="h-4 w-4 shrink-0" />
                            <span className="line-clamp-1">{post.reciterName}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{formatDuration(post.audioDuration)}</span>
                          </div>

                          {post.viewCount > 0 && (
                            <>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                <span>{post.viewCount.toLocaleString('ar-SA')}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          )}

            {recentPosts.length > 0 && (
              <div className="text-center mt-12">
                <Link href="/listen-all">
                  <Button 
                    size="lg" 
                    className="gap-3 shadow-2xl text-xl px-10 py-7 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-2xl hover:scale-105 transition-all font-bold"
                    aria-label="استمع إلى جميع المقاطع الصوتية"
                  >
                    <Play className="h-6 w-6" fill="currentColor" />
                    استمع إلى جميع المقاطع
                    <ArrowRight className="h-6 w-6" />
                  </Button>
                </Link>
              </div>
            )}
          </section>
        )}
      </main>

      {/* Final CTA Section */}
      <section className="relative bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 text-white py-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-20 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        </div>

        <div className="relative container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-6 shadow-xl">
              <Sparkles className="h-8 w-8 text-white animate-pulse" />
            </div>

            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              ابدأ رحلتك الروحانية الآن
            </h2>
            <p className="text-xl md:text-2xl text-white/90 mb-10 leading-relaxed max-w-2xl mx-auto">
              انضم إلى آلاف المستخدمين الذين يستفيدون يومياً من منصة دعاء أذكاري
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link href="/listen-all">
                <Button 
                  size="lg" 
                  className="bg-white text-emerald-700 hover:bg-white/90 text-xl px-10 py-7 shadow-2xl font-bold rounded-2xl hover:scale-105 transition-all duration-300 min-w-[250px]"
                  aria-label="ابدأ الاستماع للمقاطع الصوتية"
                >
                  <Play className="h-6 w-6 ml-2" fill="currentColor" />
                  ابدأ الاستماع
                </Button>
              </Link>
              
              <Link href="/categories">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-3 border-white text-white hover:bg-white hover:text-emerald-700 text-xl px-10 py-7 shadow-2xl font-bold rounded-2xl hover:scale-105 transition-all duration-300 bg-white/10 backdrop-blur-sm min-w-[250px]"
                  aria-label="استكشف جميع التصنيفات"
                >
                  <FolderOpen className="h-6 w-6 ml-2" />
                  استكشف التصنيفات
                </Button>
              </Link>
            </div>

            {/* Quick Features */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-white" />
                <span>محتوى موثوق 100%</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-white" />
                <span>مجاني بالكامل</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-white" />
                <span>جودة صوت عالية</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <PublicFooter
        siteName={general.siteName}
        siteDescription={general.siteDescription}
        logoUrl={general.logoUrl}
        copyrightText={general.copyrightText}
        madeWithLoveText={general.madeWithLoveText}
        contactEmail={misc.contactEmail}
        contactPhone={misc.contactPhone}
      />
    </div>
  )
}
