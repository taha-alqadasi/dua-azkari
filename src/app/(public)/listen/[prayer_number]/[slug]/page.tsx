import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getAllSettings } from '@/lib/settings'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PublicHeader } from '@/components/shared/PublicHeader'
import { PublicFooter } from '@/components/shared/PublicFooter'
import { AdsManager } from '@/components/shared/AdsManager'
import { RelatedPostsCard } from '@/components/shared/RelatedPostsCard'
import { generateArticleMetadata } from '@/lib/metadata'
import type { Metadata } from 'next'
import type { PostSettings } from '@/types/post-settings.types'
import {
  Download,
  Share2,
  Eye,
  Calendar,
  User,
  Tag,
  FolderOpen,
  Clock,
  ChevronLeft
} from 'lucide-react'

// تعطيل الـ cache لهذه الصفحة
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PageProps {
  params: Promise<{
    prayer_number: string
    slug: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { prayer_number, slug } = await params
  const post = await prisma.post.findFirst({
    where: {
      duaNumber: parseInt(prayer_number),
      slug,
      status: 'PUBLISHED'
    },
    select: {
      titleAr: true,
      description: true,
      thumbnailUrl: true,
      createdAt: true,
      updatedAt: true,
      author: { select: { name: true } },
      tags: { include: { tag: { select: { nameAr: true } } } }
    }
  })

  if (!post) {
    return {}
  }

  return generateArticleMetadata({
    title: post.titleAr,
    description: post.description || '',
    image: post.thumbnailUrl || undefined,
    url: `/listen/${prayer_number}/${slug}`,
    publishedTime: post.createdAt,
    modifiedTime: post.updatedAt,
    authors: post.author ? [post.author.name] : [],
    tags: post.tags.map(t => t.tag.nameAr)
  })
}

async function getPost(prayerNumber: number, slug: string) {
  // فك تشفير الـ slug للدعم الكامل للأحرف العربية
  const decodedSlug = decodeURIComponent(slug)
  
  const post = await prisma.post.findFirst({
    where: {
      duaNumber: prayerNumber,
      slug: decodedSlug,
      status: 'PUBLISHED'
    },
    include: {
      author: {
        select: {
          id: true,
          name: true
        }
      },
      category: {
        select: {
          id: true,
          nameAr: true,
          slug: true,
          color: true
        }
      },
      tags: {
        include: {
          tag: {
            select: {
              id: true,
              nameAr: true,
              slug: true,
              color: true
            }
          }
        }
      }
    }
  })

  return post
}

async function getRelatedPosts(categoryId: string, currentPostId: string, selectedCategories?: string[], maxPosts: number = 10) {
  // تحديد الأقسام التي سيتم الجلب منها
  const categoriesToFetch = selectedCategories && selectedCategories.length > 0 
    ? selectedCategories 
    : [categoryId]

  const relatedPosts = await prisma.post.findMany({
    where: {
      categoryId: { in: categoriesToFetch },
      status: 'PUBLISHED',
      id: { not: currentPostId }
    },
    take: maxPosts,
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true,
      duaNumber: true,
      titleAr: true,
      slug: true,
      audioDuration: true,
      reciterName: true
    }
  })

  return relatedPosts
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

function formatFileSize(bytes: bigint): string {
  const megabytes = Number(bytes) / (1024 * 1024)
  return megabytes.toFixed(2) + ' MB'
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

export default async function PostPage({ params }: PageProps) {
  const { prayer_number, slug } = await params
  const prayerNumber = parseInt(prayer_number)

  if (isNaN(prayerNumber)) {
    notFound()
  }

  const post = await getPost(prayerNumber, slug)

  if (!post) {
    notFound()
  }

  // جلب الإعدادات
  const settings = await getAllSettings()
  const { general, misc } = settings

  // جلب إعدادات صفحة المقال
  const postSettingsRecord = await prisma.setting.findUnique({
    where: { settingKey: 'post' }
  })
  
  const postSettings: PostSettings = postSettingsRecord?.settingValue as PostSettings || {
    pageLayout: 'single-column',
    relatedPostsCards: [{
      id: 'default',
      enabled: true,
      title: 'ذات صلة',
      backgroundColor: 'from-purple-600 to-pink-600',
      icon: 'folder',
      displayMode: 'auto',
      selectedCategories: [],
      maxPosts: 10,
      showReciterName: true,
      showDuration: true,
      displayStyle: 'compact',
      columnsLayout: 'double',
      order: 0,
    }]
  }

  // جلب المنشورات ذات الصلة لكل بطاقة
  const relatedPostsForCards = await Promise.all(
    postSettings.relatedPostsCards.map(async (cardSettings) => {
      if (!cardSettings.enabled) return []
      
      const selectedCategories = cardSettings.displayMode === 'manual' 
        ? cardSettings.selectedCategories 
        : undefined
        
      return await getRelatedPosts(
        post.categoryId, 
        post.id, 
        selectedCategories,
        cardSettings.maxPosts
      )
    })
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50" dir="rtl">
      {/* Header */}
      <PublicHeader 
        showBackButton 
        backButtonText="الرئيسية" 
        backButtonHref="/"
        siteName={general.siteName}
        siteDescription={general.siteDescription}
        logoUrl={general.logoUrl}
      />
      
      {/* إعلان Header */}
      <AdsManager page="post" position="header" />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link>
            <ChevronLeft className="h-4 w-4" />
            <Link href={`/category/${post.category.slug}`} className="hover:text-primary transition-colors">
              {post.category.nameAr}
            </Link>
            <ChevronLeft className="h-4 w-4" />
            <span className="text-gray-900 font-medium line-clamp-1">{post.titleAr}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className={postSettings.pageLayout === 'two-columns' ? 'max-w-7xl mx-auto' : 'max-w-5xl mx-auto'}>
          <div className={postSettings.pageLayout === 'two-columns' ? 'grid grid-cols-1 lg:grid-cols-3 gap-6' : ''}>
            {/* Main Content Column */}
            <div className={postSettings.pageLayout === 'two-columns' ? 'lg:col-span-2' : ''}>
              {/* Prayer Card */}
              <Card className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-2xl rounded-2xl overflow-hidden mb-6">
            <CardContent className="p-8">
                {/* Prayer Number Badge */}
                <div className="mb-4">
                  <span className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold border border-white/30">
                    رقم الدعاء: {post.duaNumber}
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                  {post.titleAr}
                </h1>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 text-sm mb-6 text-white/90">
                  {post.category && (
                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-4 w-4" />
                      <span>{post.category.nameAr}</span>
                    </div>
                  )}

                  {post.reciterName && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{post.reciterName}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{formatDuration(post.audioDuration)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>{post.viewCount.toLocaleString('ar-SA')} مشاهدة</span>
                  </div>
                </div>

                {/* Audio Player */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <audio
                    controls
                    className="w-full h-12 mb-4 rounded-lg"
                    preload="metadata"
                  >
                    <source src={post.audioUrl} type="audio/mpeg" />
                    متصفحك لا يدعم عنصر الصوت.
                  </audio>
                  
                  <div className="flex flex-wrap gap-3">
                    <a href={post.audioUrl} download target="_blank" rel="noopener noreferrer" className="flex-1 min-w-[200px]">
                      <Button variant="secondary" className="w-full gap-2 bg-white/90 hover:bg-white text-gray-900">
                        <Download className="h-4 w-4" />
                        تحميل Mp3
                        {post.audioFileSize && (
                          <span className="text-xs text-gray-600">
                            ({formatFileSize(post.audioFileSize)})
                          </span>
                        )}
                      </Button>
                    </a>
                    <Button variant="secondary" className="gap-2 bg-white/90 hover:bg-white text-gray-900">
                      <Share2 className="h-4 w-4" />
                      مشاركة
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {post.description && (
              <Card className="bg-white shadow-lg rounded-2xl mb-6">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4 text-gray-900">الوصف</h2>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {post.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Content */}
            {post.content && (
              <Card className="bg-white shadow-lg rounded-2xl mb-6">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4 text-gray-900">نص الدعاء</h2>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-800 leading-loose text-xl whitespace-pre-wrap" style={{ fontFamily: "'Cairo', 'Tajawal', 'Amiri', sans-serif" }}>
                      {post.content}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tags */}
            {post.tags.length > 0 && (
              <Card className="bg-white shadow-lg rounded-2xl mb-6">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Tag className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-bold text-gray-900">الوسوم</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map(({ tag }) => (
                      <Link
                        key={tag.id}
                        href={`/tag/${tag.slug}`}
                        className="px-4 py-2 rounded-full text-sm font-medium hover:shadow-md transition-all"
                        style={{
                          backgroundColor: tag.color ? tag.color + '20' : '#f0f9ff',
                          color: tag.color || '#1e9e94',
                          border: `1px solid ${tag.color ? tag.color + '40' : '#1e9e9440'}`
                        }}
                      >
                        {tag.nameAr}
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

              {/* Post Info */}
              <Card className="bg-white shadow-lg rounded-2xl mb-6">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>تاريخ النشر: {formatDate(post.createdAt)}</span>
                    </div>
                    {post.updatedAt !== post.createdAt && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>آخر تحديث: {formatDate(post.updatedAt)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Related Posts في نهاية المحتوى - للتخطيط بعمود واحد */}
              {postSettings.pageLayout === 'single-column' && postSettings.relatedPostsCards.map((cardSettings, index) => (
                <div key={cardSettings.id || index} className="mb-6">
                  <RelatedPostsCard 
                    relatedPosts={relatedPostsForCards[index] || []}
                    settings={cardSettings}
                  />
                </div>
              ))}
            </div>

            {/* Sidebar - للتخطيط بعمودين */}
            {postSettings.pageLayout === 'two-columns' && (
              <div className="lg:col-span-1 space-y-6">
                {postSettings.relatedPostsCards.map((cardSettings, index) => (
                  <RelatedPostsCard 
                    key={cardSettings.id || index}
                    relatedPosts={relatedPostsForCards[index] || []}
                    settings={cardSettings}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <PublicFooter 
        siteName={general.siteName}
        siteDescription={general.siteDescription}
        logoUrl={general.logoUrl}
        copyrightText={general.copyrightText}
        contactEmail={misc.contactEmail}
        contactPhone={misc.contactPhone}
      />
    </div>
  )
}
