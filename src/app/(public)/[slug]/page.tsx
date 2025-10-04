import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getAllSettings } from '@/lib/settings'
import { PublicHeader } from '@/components/shared/PublicHeader'
import { PublicFooter } from '@/components/shared/PublicFooter'
import { generatePageMetadata } from '@/lib/metadata'
import { Card } from '@/components/ui/card'
import { FileText, Calendar, HelpCircle } from 'lucide-react'
import FAQAccordion, { type FAQItem } from '@/components/public/FAQAccordion'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

async function getPageBySlug(slug: string) {
  const page = await prisma.page.findUnique({
    where: {
      slug: slug,
      status: 'PUBLISHED'
    },
    include: {
      author: {
        select: {
          name: true
        }
      }
    }
  })

  return page
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const page = await getPageBySlug(slug)

  if (!page) {
    return {}
  }

  return generatePageMetadata({
    title: page.seoTitle || page.titleAr,
    description: page.seoDescription || page.titleAr,
    keywords: page.seoKeywords?.split(',') || [],
    url: `/${slug}`,
  })
}

export default async function StaticPage({ params }: PageProps) {
  const { slug } = await params
  const page = await getPageBySlug(slug)

  if (!page) {
    notFound()
  }

  // جلب الإعدادات
  const settings = await getAllSettings()
  const { general, misc } = settings

  // Parse FAQ items if template is 'faq'
  let faqItems: FAQItem[] = []
  if (page.template === 'faq') {
    try {
      const parsed = JSON.parse(page.content)
      faqItems = Array.isArray(parsed) ? parsed : []
    } catch (error) {
      console.error('Error parsing FAQ items:', error)
      faqItems = []
    }
  }

  // Generate FAQ Schema.org structured data
  const faqSchema = page.template === 'faq' && faqItems.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer.replace(/<[^>]*>/g, '') // Remove HTML tags for schema
      }
    }))
  } : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50" dir="rtl">
      {/* FAQ Schema.org Structured Data */}
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      {/* Header */}
      <PublicHeader 
        showBackButton 
        backButtonText="الرئيسية" 
        backButtonHref="/"
        siteName={general.siteName}
        siteDescription={general.siteDescription}
        logoUrl={general.logoUrl}
      />

      {/* Page Title */}
      <div className="bg-white/80 backdrop-blur-sm border-b shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-teal-600 rounded-2xl mb-3 shadow-lg">
              {page.template === 'faq' ? (
                <HelpCircle className="h-8 w-8 text-white" />
              ) : (
                <FileText className="h-8 w-8 text-white" />
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{page.titleAr}</h1>
            {page.titleEn && (
              <p className="text-gray-600">{page.titleEn}</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {page.template === 'faq' ? (
            /* FAQ Template */
            <div className="space-y-6">
              {faqItems.length > 0 ? (
                <FAQAccordion items={faqItems} />
              ) : (
                <Card className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden p-12 text-center">
                  <HelpCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">لا توجد أسئلة شائعة متاحة حالياً</p>
                </Card>
              )}

              {/* Meta Info */}
              <Card className="bg-white/90 backdrop-blur-sm shadow-md rounded-lg p-6">
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>آخر تحديث: {new Date(page.updatedAt).toLocaleDateString('ar-SA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </div>
                  {page.author && (
                    <>
                      <span>•</span>
                      <span>بواسطة: {page.author.name}</span>
                    </>
                  )}
                </div>
              </Card>
            </div>
          ) : (
            /* Default Template */
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden">
              <div className="p-8 md:p-12">
                {/* Content */}
                <div 
                  className="prose prose-lg max-w-none
                    prose-headings:text-gray-900 prose-headings:font-bold
                    prose-p:text-gray-700 prose-p:leading-relaxed
                    prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                    prose-strong:text-gray-900 prose-strong:font-bold
                    prose-ul:list-disc prose-ul:mr-6
                    prose-ol:list-decimal prose-ol:mr-6
                    prose-li:text-gray-700
                    prose-blockquote:border-r-4 prose-blockquote:border-primary 
                    prose-blockquote:pr-4 prose-blockquote:italic
                    prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 
                    prose-code:rounded prose-code:text-sm"
                  dangerouslySetInnerHTML={{ __html: page.content }}
                />

                {/* Meta Info */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>آخر تحديث: {new Date(page.updatedAt).toLocaleDateString('ar-SA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</span>
                    </div>
                    {page.author && (
                      <>
                        <span>•</span>
                        <span>بواسطة: {page.author.name}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}
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

// Generate static paths for better performance
export async function generateStaticParams() {
  const pages = await prisma.page.findMany({
    where: { status: 'PUBLISHED' },
    select: { slug: true }
  })

  return pages.map((page) => ({
    slug: page.slug,
  }))
}

// Revalidate every 60 seconds
export const revalidate = 60
