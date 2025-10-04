import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
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
  ArrowRight,
  Clock,
  User,
  Eye,
  Tag as TagIcon,
  Hash
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
  const tag = await prisma.tag.findUnique({
    where: { slug, isActive: true },
    select: { nameAr: true, description: true }
  })

  if (!tag) {
    return {}
  }

  return generatePageMetadata({
    title: `#${tag.nameAr}`,
    description: tag.description || `مقاطع صوتية بوسم ${tag.nameAr}`,
    keywords: [tag.nameAr, 'وسوم', 'أدعية'],
    url: `/tag/${slug}`,
  })
}

async function getTag(slug: string) {
  // فك تشفير الـ slug للدعم الكامل للأحرف العربية
  const decodedSlug = decodeURIComponent(slug)
  
  const tag = await prisma.tag.findUnique({
    where: {
      slug: decodedSlug,
      isActive: true
    },
    include: {
      posts: {
        where: {
          post: {
            status: 'PUBLISHED'
          }
        },
        include: {
          post: {
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
          }
        },
        orderBy: {
          post: {
            createdAt: 'desc'
          }
        }
      }
    }
  })

  if (!tag) return null

  // تحويل البيانات لتكون سهلة الاستخدام
  return {
    ...tag,
    posts: tag.posts.map(p => p.post)
  }
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export default async function TagPage({ params }: PageProps) {
  const { slug } = await params
  const tag = await getTag(slug)

  if (!tag) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50" dir="rtl">
      {/* Header */}
      <PublicHeader showBackButton backButtonText="الرئيسية" backButtonHref="/" />

      {/* Breadcrumb */}
      <div className="bg-white/80 backdrop-blur-sm border-b shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-gray-600 hover:text-primary transition-colors">
              الرئيسية
            </Link>
            <span className="text-gray-400">/</span>
            <Link href="/tags" className="text-gray-600 hover:text-primary transition-colors">
              الوسوم
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-semibold">{tag.nameAr}</span>
          </div>
        </div>
      </div>

      {/* Tag Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg"
              style={{ 
                background: tag.color 
                  ? `linear-gradient(135deg, ${tag.color}, ${tag.color}99)` 
                  : 'linear-gradient(135deg, #6366f1, #a855f7)'
              }}
            >
              <Hash className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Hash className="h-8 w-8 text-indigo-600" />
                {tag.nameAr}
              </h1>
              <p className="text-gray-600">
                {tag.posts.length} مقطع صوتي
              </p>
            </div>
          </div>
          {tag.description && (
            <p className="mt-4 text-gray-700 leading-relaxed">
              {tag.description}
            </p>
          )}
        </div>
      </div>

      {/* Posts Grid */}
      <main className="container mx-auto px-4 py-8">
        {tag.posts.length === 0 ? (
          <Card className="p-16 text-center bg-white/90 backdrop-blur-sm shadow-xl">
            <TagIcon className="h-20 w-20 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
            لا توجد مقاطع حالياً
          </h3>
          <p className="text-gray-600 mb-6">
            سيتم إضافة مقاطع جديدة قريباً في هذا الوسم
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/listen-all">
              <Button className="gap-2">
                <Play className="h-4 w-4" />
                جميع المقاطع
              </Button>
            </Link>
            <Link href="/tags">
              <Button className="gap-2">
                <TagIcon className="h-4 w-4" />
                جميع الوسوم
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="gap-2">
                <ArrowRight className="h-4 w-4" />
                الرئيسية
              </Button>
            </Link>
          </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tag.posts.map((post) => (
              <Card 
                key={post.id}
                className="group bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden border-2 border-transparent hover:border-indigo-300 hover:-translate-y-1"
              >
                <Link href={`/listen/${post.duaNumber}/${post.slug}`}>
                  {/* Thumbnail */}
                  <div className="relative h-48 bg-gradient-to-br from-indigo-100 to-purple-100 overflow-hidden">
                    {post.thumbnailUrl ? (
                      <img 
                        src={post.thumbnailUrl}
                        alt={post.titleAr}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-indigo-300 text-6xl">
                        🕌
                      </div>
                    )}
                    
                    {/* Play Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center transform scale-50 group-hover:scale-100 transition-all duration-300 shadow-2xl">
                        <Play className="h-8 w-8 mr-1" fill="currentColor" />
                      </div>
                    </div>

                    {/* Category Badge */}
                    <div className="absolute top-3 right-3">
                      <span 
                        className="inline-flex items-center px-3 py-1 text-white rounded-full text-xs font-bold shadow-lg backdrop-blur-sm"
                        style={{ backgroundColor: post.category.color || '#6366f1' }}
                      >
                        {post.category.nameAr}
                      </span>
                    </div>

                    {/* Prayer Number Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center px-2.5 py-1 bg-white/90 backdrop-blur-sm text-indigo-600 rounded-full text-xs font-bold shadow-lg">
                        #{post.duaNumber}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors mb-2 line-clamp-2 leading-relaxed">
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
                        <Play className="h-4 w-4" />
                        <span>استماع</span>
                      </div>
                      <span>•</span>
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
      <PublicFooter />
    </div>
  )
}

