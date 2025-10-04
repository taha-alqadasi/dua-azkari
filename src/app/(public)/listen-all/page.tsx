import React from 'react'
import { prisma } from '@/lib/prisma'
import { getAllSettings } from '@/lib/settings'
import { PublicHeader } from '@/components/shared/PublicHeader'
import { PublicFooter } from '@/components/shared/PublicFooter'
import { PostsClient } from './PostsClient'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface Post {
  id: string
  duaNumber: number
  titleAr: string
  slug: string
  description: string | null
  thumbnailUrl: string | null
  audioDuration: number
  reciterName: string | null
  viewCount: number
  downloadCount: number
  publishedAt: Date
  category: {
    nameAr: string
    slug: string
    color: string
  }
}

// Generate dynamic metadata
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getAllSettings()
  const { audioPage } = settings

  return {
    title: audioPage.pageTitle || 'جميع المقاطع الصوتية',
    description: audioPage.pageDescription || 'استمع إلى جميع المقاطع الصوتية للأدعية والأذكار الإسلامية',
  }
}

async function getAllPosts() {
  const posts = await prisma.post.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
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
      downloadCount: true,
      publishedAt: true,
      category: {
        select: {
          nameAr: true,
          slug: true,
          color: true
        }
      }
    }
  })

  return posts
}

export default async function PostsPage() {
  const posts = await getAllPosts()
  const settings = await getAllSettings()
  const { general, misc, audioPage } = settings

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
      
      {/* Client Component للـ posts مع pagination */}
      <PostsClient 
        initialPosts={posts}
        settings={settings}
      />

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
