import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getAllSettings } from '@/lib/settings'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PublicHeader } from '@/components/shared/PublicHeader'
import { PublicFooter } from '@/components/shared/PublicFooter'
import { generatePageMetadata } from '@/lib/metadata'
import type { Metadata } from 'next'
import {
  Play,
  Share2,
  Heart,
  Clock,
  User,
  Eye,
  FolderOpen
} from 'lucide-react'

// تعطيل الـ cache لهذه الصفحة
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  // فك تشفير الـ slug العربي
  const decodedSlug = decodeURIComponent(slug)
  
  const category = await prisma.category.findUnique({
    where: { slug: decodedSlug, isActive: true },
    select: { nameAr: true, description: true }
  })

  if (!category) {
    return {}
  }

  return generatePageMetadata({
    title: category.nameAr,
    description: category.description || `مقاطع صوتية من تصنيف ${category.nameAr}`,
    keywords: [category.nameAr, 'أدعية', 'أذكار'],
    url: `/category/${decodedSlug}`,
  })
}

async function getCategory(slug: string) {
  // فك تشفير الـ slug العربي
  const decodedSlug = decodeURIComponent(slug)
  
  const category = await prisma.category.findUnique({
    where: {
      slug: decodedSlug,
      isActive: true
    },
    include: {
      posts: {
        where: {
          status: 'PUBLISHED'
        },
        orderBy: {
          createdAt: 'desc'
        },
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
              color: true
            }
          }
        }
      }
    }
  })

  return category
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params
  // فك تشفير الـ slug العربي
  const decodedSlug = decodeURIComponent(slug)
  const category = await getCategory(decodedSlug)

  if (!category) {
    notFound()
  }

  // جلب الإعدادات
  const settings = await getAllSettings()
  const { general, misc } = settings

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50" dir="rtl">
      {/* Header */}
      <PublicHeader 
        showBackButton 
        backButtonText="الرئيسية" 
        backButtonHref="/"
        siteName={general.siteName}
        siteDescription={general.siteDescription}
        logoUrl={general.logoUrl}
      />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-gray-600 hover:text-primary transition-colors">
              الرئيسية
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-semibold">{category.nameAr}</span>
          </div>
        </div>
      </div>

      {/* Category Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg"
              style={{ backgroundColor: category.color || '#1e9e94' }}
            >
              {category.icon || '📿'}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {category.nameAr}
              </h1>
              <p className="text-gray-600">
                {category.posts.length} مقطع صوتي
              </p>
            </div>
          </div>
          {category.description && (
            <p className="mt-4 text-gray-700 leading-relaxed">
              {category.description}
            </p>
          )}
        </div>
      </div>

      {/* Posts Grid */}
      <main className="container mx-auto px-4 py-8">
        {category.posts.length === 0 ? (
          <Card className="p-12 text-center bg-white shadow-xl">
            <FolderOpen className="h-20 w-20 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              لا توجد مقاطع حالياً
            </h3>
            <p className="text-gray-600 mb-6">
              سيتم إضافة مقاطع جديدة قريباً في هذا التصنيف
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/listen-all">
                <Button className="gap-2">
                  <Play className="h-4 w-4" />
                  جميع المقاطع
                </Button>
              </Link>
              <Link href="/categories">
                <Button className="gap-2">
                  <FolderOpen className="h-4 w-4" />
                  جميع التصنيفات
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="gap-2">
                  الرئيسية
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {category.posts.map((post) => (
              <Card 
                key={post.id}
                className="group bg-white shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden border-2 border-transparent hover:border-primary/30"
              >
                <Link href={`/listen/${post.duaNumber}/${post.slug}`}>
                  {/* Thumbnail */}
                  <div className="relative h-48 bg-gradient-to-br from-primary/10 to-teal-50 overflow-hidden">
                    {post.thumbnailUrl ? (
                      <img 
                        src={post.thumbnailUrl}
                        alt={post.titleAr}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary/30 text-6xl">
                        🕌
                      </div>
                    )}
                    
                    {/* Play Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300 shadow-2xl">
                        <Play className="h-8 w-8 mr-1" fill="currentColor" />
                      </div>
                    </div>

                    {/* Prayer Number Badge */}
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center px-3 py-1 bg-primary text-white rounded-full text-sm font-bold shadow-lg">
                        رقم {post.duaNumber}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors mb-2 line-clamp-2 leading-relaxed">
                      {post.titleAr}
                    </h3>

                    {post.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                        {post.description}
                      </p>
                    )}

                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      {post.reciterName && (
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span className="line-clamp-1">{post.reciterName}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatDuration(post.audioDuration)}</span>
                      </div>

                      {post.viewCount > 0 && (
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span>{post.viewCount}</span>
                        </div>
                      )}
                    </div>

                    {/* Meta Actions */}
                    <div className="flex items-center gap-2 pt-4 border-t text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Share2 className="h-4 w-4" />
                        <span>مشاركة</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        <span>حفظ</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        )}
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

