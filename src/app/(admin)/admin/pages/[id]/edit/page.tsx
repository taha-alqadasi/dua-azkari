import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import PageForm from '@/components/admin/PageForm'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

async function getPage(id: string) {
  const page = await prisma.page.findUnique({
    where: { id }
  })

  return page
}

export default async function EditPagePage({ params }: PageProps) {
  const { id } = await params
  const page = await getPage(id)

  if (!page) {
    notFound()
  }

  return (
    <PageForm
      pageId={page.id}
      initialData={{
        titleAr: page.titleAr,
        titleEn: page.titleEn || '',
        slug: page.slug,
        content: page.content,
        template: page.template,
        status: page.status as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
        seoTitle: page.seoTitle || '',
        seoDescription: page.seoDescription || '',
        seoKeywords: page.seoKeywords || '',
      }}
    />
  )
}

