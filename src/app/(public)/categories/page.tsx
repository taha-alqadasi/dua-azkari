import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { prisma } from '@/lib/prisma'
import { getAllSettings } from '@/lib/settings'
import { PublicHeader } from '@/components/shared/PublicHeader'
import { PublicFooter } from '@/components/shared/PublicFooter'
import { generatePageMetadata } from '@/lib/metadata'
import { 
  ArrowRight,
  FolderOpen,
  TrendingUp,
  Grid3x3
} from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = generatePageMetadata({
  title: 'التصنيفات',
  description: 'استكشف مكتبتنا من الأدعية والأذكار المنظمة في تصنيفات متعددة',
  keywords: ['تصنيفات الأدعية', 'فئات الأذكار', 'أقسام إسلامية'],
  url: '/categories',
})

async function getAllCategories() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { orderNumber: 'asc' },
    select: {
      id: true,
      nameAr: true,
      slug: true,
      description: true,
      color: true,
      icon: true,
      orderNumber: true,
      _count: {
        select: {
          posts: {
            where: { status: 'PUBLISHED' }
          }
        }
      }
    }
  })

  return categories
}

export default async function CategoriesPage() {
  const categories = await getAllCategories()
  const totalPosts = categories.reduce((sum, cat) => sum + cat._count.posts, 0)

  // جلب الإعدادات
  const settings = await getAllSettings()
  const { general, misc } = settings

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
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-primary to-teal-600 rounded-2xl mb-2 md:mb-3 shadow-lg">
              <Grid3x3 className="h-6 w-6 md:h-8 md:w-8 text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">التصنيفات</h2>
            <p className="text-sm md:text-base text-gray-600 px-4">
              استكشف مكتبتنا من الأدعية والأذكار المنظمة في {categories.length} تصنيف
            </p>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white/80 backdrop-blur-sm border-b shadow-sm">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-center gap-4 md:gap-8">
            <div className="flex items-center gap-1 md:gap-2">
              <FolderOpen className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
              <span className="font-bold text-xl md:text-2xl text-gray-900">{categories.length}</span>
              <span className="text-xs md:text-base text-gray-600">تصنيف</span>
            </div>
            <div className="w-px h-4 md:h-6 bg-gray-300" />
            <div className="flex items-center gap-1 md:gap-2">
              <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
              <span className="font-bold text-xl md:text-2xl text-gray-900">{totalPosts}</span>
              <span className="text-xs md:text-base text-gray-600">مقطع صوتي</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 md:py-12">
        {categories.length === 0 ? (
          <Card className="p-8 md:p-16 text-center bg-white/90 backdrop-blur-sm shadow-xl">
            <FolderOpen className="h-16 w-16 md:h-20 md:w-20 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
              لا توجد تصنيفات
            </h3>
            <p className="text-sm md:text-base text-gray-600 mb-6">
              سيتم إضافة التصنيفات قريباً
            </p>
            <Link href="/">
              <Button size="lg" className="shadow-lg">
                العودة للرئيسية
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {categories.map((category) => (
              <Link key={category.id} href={`/category/${category.slug}`}>
                <Card 
                  className="group bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden border-2 border-transparent hover:border-purple-300 hover:-translate-y-1 md:hover:-translate-y-2 cursor-pointer h-full"
                >
                  {/* Icon Header */}
                  <div 
                    className="relative h-32 md:h-40 flex items-center justify-center overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${category.color || '#9333ea'}, ${category.color ? category.color + '99' : '#c084fc'})`
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                    <div className="relative text-5xl md:text-7xl transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 drop-shadow-2xl">
                      {category.icon || '📁'}
                    </div>
                    
                    {/* Count Badge */}
                    <div className="absolute top-2 right-2 md:top-3 md:right-3">
                      <div className="bg-white/90 backdrop-blur-sm text-gray-900 px-2 py-1 md:px-3 rounded-full text-xs md:text-sm font-bold shadow-lg">
                        {category._count.posts} مقطع
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 md:p-5">
                    <h3 
                      className="text-base md:text-xl font-bold mb-2 group-hover:scale-105 transition-transform min-h-[2.5rem] md:min-h-[3rem] flex items-center"
                      style={{ color: category.color || '#9333ea' }}
                    >
                      {category.nameAr}
                    </h3>

                    {category.description && (
                      <p className="text-gray-600 text-xs md:text-sm leading-relaxed line-clamp-2 md:line-clamp-3 mb-3 md:mb-4">
                        {category.description}
                      </p>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 md:pt-4 border-t">
                      <div className="text-xs md:text-sm text-gray-600">
                        <FolderOpen className="h-3 w-3 md:h-4 md:w-4 inline ml-1" />
                        استكشف المقاطع
                      </div>
                      <ArrowRight 
                        className="h-4 w-4 md:h-5 md:w-5 transform group-hover:-translate-x-2 transition-transform"
                        style={{ color: category.color || '#9333ea' }}
                      />
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Call to Action */}
        {categories.length > 0 && (
          <div className="mt-8 md:mt-16 text-center">
            <Card className="inline-block bg-white/90 backdrop-blur-sm shadow-xl p-6 md:p-8 rounded-2xl mx-4 md:mx-0">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 md:mb-3">
                لم تجد ما تبحث عنه؟
              </h3>
              <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
                تصفح جميع المقاطع الصوتية أو عد إلى الصفحة الرئيسية
              </p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                <Link href="/posts" className="w-full sm:w-auto">
                  <Button size="lg" className="gap-2 shadow-lg w-full sm:w-auto">
                    <FolderOpen className="h-5 w-5" />
                    جميع المقاطع
                  </Button>
                </Link>
                <Link href="/" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="gap-2 shadow-lg w-full sm:w-auto">
                    <ArrowRight className="h-5 w-5" />
                    الصفحة الرئيسية
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

