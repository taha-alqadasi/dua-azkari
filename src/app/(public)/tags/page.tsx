import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { prisma } from '@/lib/prisma'
import { getAllSettings } from '@/lib/settings'
import { PublicHeader } from '@/components/shared/PublicHeader'
import { PublicFooter } from '@/components/shared/PublicFooter'
import { generatePageMetadata } from '@/lib/metadata'
import { 
  ArrowRight,
  Tag,
  TrendingUp,
  Hash,
  Volume2
} from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getAllSettings()
  const tagPageSettings = settings.tagPage
  
  return {
    title: tagPageSettings.seo.title || 'الوسوم - دعاء أذكاري',
    description: tagPageSettings.seo.description || 'استكشف المقاطع حسب المواضيع والكلمات المفتاحية',
    keywords: tagPageSettings.seo.keywords || 'وسوم الأدعية, مواضيع إسلامية, كلمات مفتاحية',
    openGraph: tagPageSettings.seo.ogImage ? {
      images: [tagPageSettings.seo.ogImage]
    } : undefined
  }
}

async function getAllTags() {
  const tags = await prisma.tag.findMany({
    where: { isActive: true },
    orderBy: { nameAr: 'asc' },
    select: {
      id: true,
      nameAr: true,
      slug: true,
      posts: {
        where: {
          post: {
            status: 'PUBLISHED'
          }
        },
        select: {
          postId: true
        }
      }
    }
  })

  return tags.map(tag => ({
    id: tag.id,
    nameAr: tag.nameAr,
    slug: tag.slug,
    _count: {
      posts: tag.posts.length
    }
  }))
}

export default async function TagsPage() {
  const allTags = await getAllTags()
  const totalPosts = allTags.reduce((sum, tag) => sum + tag._count.posts, 0)

  // جلب الإعدادات
  const settings = await getAllSettings()
  const { general, misc, tagPage } = settings

  // تحديد الوسوم الأكثر استخداماً بناءً على الإعدادات
  let mostUsedTags: Array<{
    id: string
    nameAr: string
    slug: string
    _count: { posts: number }
  }> = []
  if (tagPage.mostUsedTags.show) {
    if (tagPage.mostUsedTags.manualSelection && tagPage.mostUsedTags.selectedTagIds.length > 0) {
      // اختيار يدوي - جلب الوسوم المحددة فقط
      mostUsedTags = allTags.filter(tag => 
        tagPage.mostUsedTags.selectedTagIds.includes(tag.id)
      )
    } else {
      // اختيار تلقائي - جلب الأكثر استخداماً
      const sortedTags = [...allTags].sort((a, b) => {
        if (tagPage.mostUsedTags.sortBy === 'usage') {
          return b._count.posts - a._count.posts
        } else if (tagPage.mostUsedTags.sortBy === 'name') {
          return a.nameAr.localeCompare(b.nameAr)
        } else { // recent
          return 0 // يمكن إضافة تاريخ الإنشاء لاحقاً
        }
      })
      mostUsedTags = sortedTags.slice(0, tagPage.mostUsedTags.count || 8)
    }
  }

  // تحضير الوسوم للعرض حسب الحجم (للسحابة)
  const tagsBySize = allTags.map(tag => ({
    ...tag,
    size: (tag._count.posts > 20 ? 'xl' : 
          tag._count.posts > 10 ? 'lg' : 
          tag._count.posts > 5 ? 'md' : 'sm') as 'xl' | 'lg' | 'md' | 'sm'
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50" dir="rtl">
      {/* Header */}
      <PublicHeader 
        showSearch={true}
        siteName={general.siteName}
        siteDescription={general.siteDescription}
        logoUrl={general.logoUrl}
      />
      
      {/* Page Title */}
      <div className="bg-white/80 backdrop-blur-sm border-b shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-teal-600 rounded-2xl mb-3 shadow-lg">
              <Hash className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {tagPage.seo.title?.replace(' - دعاء أذكاري', '').replace('الوسوم - ', '') || 'الوسوم'}
            </h2>
            {tagPage.showDescription && (
              <p className="text-gray-600">
                {tagPage.seo.description || 'استكشف المقاطع حسب المواضيع والكلمات المفتاحية'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      {tagPage.showPostCount && (
        <div className="bg-white/80 backdrop-blur-sm border-b shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-center gap-4 sm:gap-8 flex-wrap">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                <span className="font-bold text-xl sm:text-2xl text-gray-900">{allTags.length}</span>
                <span className="text-sm sm:text-base text-gray-600">وسم</span>
              </div>
              <div className="w-px h-6 bg-gray-300 hidden sm:block" />
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                <span className="font-bold text-xl sm:text-2xl text-gray-900">{totalPosts}</span>
                <span className="text-sm sm:text-base text-gray-600">مقطع موسوم</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {allTags.length === 0 ? (
          <Card className="p-16 text-center bg-white/90 backdrop-blur-sm shadow-xl">
            <Tag className="h-20 w-20 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              لا توجد وسوم
            </h3>
            <p className="text-gray-600 mb-6">
              سيتم إضافة الوسوم قريباً
            </p>
            <Link href="/">
              <Button size="lg" className="shadow-lg">
                العودة للرئيسية
              </Button>
            </Link>
          </Card>
        ) : (
          <>
            {/* الوسوم الأكثر استخداماً */}
            {tagPage.mostUsedTags.show && mostUsedTags.length > 0 && (
              <div className="mb-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                  {tagPage.mostUsedTags.title}
                </h3>
                
                {/* Grid Layout */}
                {tagPage.mostUsedTags.layout === 'grid' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {mostUsedTags.map((tag, index) => (
                      <Link key={tag.id} href={`/tag/${tag.slug}`}>
                        <Card 
                          className="group bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden border-2 border-transparent hover:border-blue-300 hover:-translate-y-1 cursor-pointer p-6"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                                {index + 1}
                              </div>
                              <Hash className="h-5 w-5 text-blue-600" />
                            </div>
                            {tagPage.showPostCount && (
                              <span className="text-2xl font-bold text-blue-600">
                                {tag._count.posts}
                              </span>
                            )}
                          </div>
                          <h4 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {tag.nameAr}
                          </h4>
                          {tagPage.showPostCount && (
                            <p className="text-sm text-gray-600 mt-1">
                              {tag._count.posts} مقطع
                            </p>
                          )}
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}

                {/* List Layout */}
                {tagPage.mostUsedTags.layout === 'list' && (
                  <div className="space-y-3">
                    {mostUsedTags.map((tag, index) => (
                      <Link key={tag.id} href={`/tag/${tag.slug}`}>
                        <Card className="group bg-white/90 backdrop-blur-sm shadow-md hover:shadow-xl transition-all duration-300 p-4 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {tag.nameAr}
                              </h4>
                              {tagPage.showPostCount && (
                                <p className="text-sm text-gray-600">
                                  {tag._count.posts} مقطع
                                </p>
                              )}
                            </div>
                          </div>
                          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-all" />
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Cloud Layout */}
                {tagPage.mostUsedTags.layout === 'cloud' && (
                  <Card className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-6">
                    <div className="flex flex-wrap gap-3 justify-center">
                      {mostUsedTags.map((tag) => {
                        const size = tag._count.posts > 15 ? 'text-3xl' : 
                                    tag._count.posts > 10 ? 'text-2xl' : 
                                    tag._count.posts > 5 ? 'text-xl' : 'text-lg'
                        
                        return (
                          <Link key={tag.id} href={`/tag/${tag.slug}`}>
                            <button
                              className={`
                                ${size}
                                bg-gradient-to-r from-blue-500 to-purple-600
                                text-white font-bold rounded-full px-6 py-3
                                hover:shadow-xl hover:scale-110
                                transition-all duration-300 shadow-md
                              `}
                            >
                              <Hash className="inline h-4 w-4 ml-1" />
                              {tag.nameAr}
                              {tagPage.showPostCount && (
                                <span className="mr-2 opacity-90 text-sm">({tag._count.posts})</span>
                              )}
                            </button>
                          </Link>
                        )
                      })}
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* جميع الوسوم - Tag Cloud */}
            {tagPage.allTags.show && (
              <div className="mb-12">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Tag className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  {tagPage.allTags.title}
                </h3>
                <Card className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-4 sm:p-6 md:p-8">
                  <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
                    {tagsBySize.map((tag) => {
                      const sizeClasses: Record<'xl' | 'lg' | 'md' | 'sm', string> = {
                        xl: 'text-lg sm:text-2xl md:text-3xl px-4 py-2 sm:px-6 sm:py-3',
                        lg: 'text-base sm:text-xl md:text-2xl px-3 py-1.5 sm:px-5 sm:py-2.5',
                        md: 'text-sm sm:text-lg md:text-xl px-3 py-1.5 sm:px-4 sm:py-2',
                        sm: 'text-xs sm:text-base px-2 py-1 sm:px-3 sm:py-1.5'
                      }
                      
                      const colorClasses = [
                        'from-blue-500 to-cyan-600',
                        'from-purple-500 to-pink-600',
                        'from-green-500 to-teal-600',
                        'from-orange-500 to-red-600',
                        'from-indigo-500 to-blue-600'
                      ]
                      
                      const colorClass = colorClasses[Math.floor(Math.random() * colorClasses.length)]
                      const sizeClass = sizeClasses[tag.size]
                      
                      return (
                        <Link key={tag.id} href={`/tag/${tag.slug}`}>
                          <button
                            className={`
                              ${sizeClass}
                              bg-gradient-to-r ${colorClass}
                              text-white font-bold rounded-full
                              hover:shadow-xl hover:scale-105 sm:hover:scale-110
                              transition-all duration-300
                              shadow-md
                              whitespace-nowrap
                            `}
                          >
                            <Hash className="inline h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                            {tag.nameAr}
                            {tagPage.showPostCount && (
                              <span className="mr-1 sm:mr-2 opacity-90 text-xs sm:text-sm">
                                ({tag._count.posts})
                              </span>
                            )}
                          </button>
                        </Link>
                      )
                    })}
                  </div>
                </Card>
              </div>
            )}

            {/* العرض التفصيلي - All Tags Grid */}
            {tagPage.detailedView.show && (
              <div className="mt-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  عرض تفصيلي
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {allTags.map((tag) => (
                    <Link key={tag.id} href={`/tag/${tag.slug}`}>
                      <Card 
                        className="group bg-white/90 backdrop-blur-sm shadow-md hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden border border-gray-200 hover:border-blue-300 cursor-pointer p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {tagPage.detailedView.showIcon && (
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                                <Hash className="h-5 w-5" />
                              </div>
                            )}
                            <div>
                              <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {tag.nameAr}
                              </h4>
                              {tagPage.detailedView.showStats && tagPage.showPostCount && (
                                <p className="text-xs text-gray-600">
                                  {tag._count.posts} مقطع
                                </p>
                              )}
                            </div>
                          </div>
                          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:-translate-x-1 transition-all" />
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Call to Action */}
        {allTags.length > 0 && (
          <div className="mt-16 text-center">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl p-6 sm:p-8 rounded-2xl mx-auto max-w-4xl">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                استكشف المزيد
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6">
                تصفح المقاطع حسب التصنيفات أو عد إلى الصفحة الرئيسية
              </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link href="/listen-all" className="w-full sm:w-auto">
                <Button size="lg" className="gap-2 shadow-lg w-full sm:w-auto">
                  <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-sm sm:text-base">جميع المقاطع</span>
                </Button>
              </Link>
              <Link href="/categories" className="w-full sm:w-auto">
                <Button size="lg" className="gap-2 shadow-lg w-full sm:w-auto">
                  <Tag className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-sm sm:text-base">التصنيفات</span>
                </Button>
              </Link>
              <Link href="/" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="gap-2 shadow-lg w-full sm:w-auto">
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-sm sm:text-base">الصفحة الرئيسية</span>
                </Button>
              </Link>
            </div>
            </Card>
          </div>
        )}
      </main>

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
