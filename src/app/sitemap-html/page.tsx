import { prisma } from '@/lib/prisma'
import { PublicHeader } from '@/components/shared/PublicHeader'
import { PublicFooter } from '@/components/shared/PublicFooter'
import { generatePageMetadata } from '@/lib/metadata'
import { Card } from '@/components/ui/card'
import { Map, Volume2, FolderOpen, Hash, FileText } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'خريطة الموقع',
  description: 'خريطة شاملة لجميع صفحات موقع دعاء أذكاري',
  keywords: ['خريطة الموقع', 'sitemap', 'جميع الصفحات'],
  url: '/sitemap-html',
})

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Revalidate every hour

async function getSitemapData() {
  const [posts, categories, tags, pages] = await Promise.all([
    prisma.post.findMany({
      where: { status: 'PUBLISHED' },
      select: {
        duaNumber: true,
        titleAr: true,
        slug: true,
      },
      orderBy: { duaNumber: 'asc' }
    }),
    prisma.category.findMany({
      where: { isActive: true },
      select: {
        nameAr: true,
        slug: true,
      },
      orderBy: { orderNumber: 'asc' }
    }),
    prisma.tag.findMany({
      where: { isActive: true },
      select: {
        nameAr: true,
        slug: true,
      },
      orderBy: { nameAr: 'asc' }
    }),
    prisma.page.findMany({
      where: { status: 'PUBLISHED' },
      select: {
        titleAr: true,
        slug: true,
      },
      orderBy: { createdAt: 'desc' }
    })
  ])

  return { posts, categories, tags, pages }
}

export default async function SitemapHtmlPage() {
  const { posts, categories, tags, pages } = await getSitemapData()

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50" dir="rtl">
      {/* Header */}
      <PublicHeader showBackButton backButtonText="الرئيسية" backButtonHref="/" />

      {/* Page Title */}
      <div className="bg-white/80 backdrop-blur-sm border-b shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-teal-600 rounded-2xl mb-3 shadow-lg">
              <Map className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">خريطة الموقع</h2>
            <p className="text-gray-600">
              تصفح جميع صفحات الموقع بسهولة
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* Main Pages */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-teal-600 flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">الصفحات الرئيسية</h3>
            </div>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-primary hover:underline">
                  الصفحة الرئيسية
                </Link>
              </li>
              <li>
                <Link href="/listen-all" className="text-primary hover:underline">
                  جميع المقاطع الصوتية
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-primary hover:underline">
                  التصنيفات
                </Link>
              </li>
              <li>
                <Link href="/tags" className="text-primary hover:underline">
                  الوسوم
                </Link>
              </li>
              {pages.map((page) => (
                <li key={page.slug}>
                  <Link href={`/${page.slug}`} className="text-primary hover:underline">
                    {page.titleAr}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>

          {/* Categories */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                <FolderOpen className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">التصنيفات ({categories.length})</h3>
            </div>
            <ul className="space-y-2 max-h-96 overflow-y-auto">
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link href={`/category/${category.slug}`} className="text-primary hover:underline">
                    {category.nameAr}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>

          {/* Tags */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                <Hash className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">الوسوم ({tags.length})</h3>
            </div>
            <ul className="space-y-2 max-h-96 overflow-y-auto">
              {tags.map((tag) => (
                <li key={tag.slug}>
                  <Link href={`/tag/${tag.slug}`} className="text-primary hover:underline">
                    #{tag.nameAr}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>

          {/* Posts */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600 to-teal-600 flex items-center justify-center">
                <Volume2 className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">المقاطع الصوتية ({posts.length})</h3>
            </div>
            <ul className="space-y-2 max-h-96 overflow-y-auto">
              {posts.map((post) => (
                <li key={post.slug}>
                  <Link href={`/listen/${post.duaNumber}/${post.slug}`} className="text-primary hover:underline">
                    {post.titleAr}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <PublicFooter />
    </div>
  )
}

