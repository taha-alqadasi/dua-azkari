import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // قراءة الرابط الأساسي من المتغيرات البيئية
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'

  // Get all published posts
  const posts = await prisma.post.findMany({
    where: { status: 'PUBLISHED' },
    select: {
      slug: true,
      duaNumber: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: 'desc' }
  })

  // Get all active categories
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: {
      slug: true,
      updatedAt: true,
    }
  })

  // Get all active tags
  const tags = await prisma.tag.findMany({
    where: { isActive: true },
    select: {
      slug: true,
      updatedAt: true,
    }
  })

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/listen-all`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tags`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about-us`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact-us`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms-conditions`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // Post pages
  const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/listen/${post.duaNumber}/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Category pages
  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/category/${category.slug}`,
    lastModified: category.updatedAt,
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  // Tag pages
  const tagPages: MetadataRoute.Sitemap = tags.map((tag) => ({
    url: `${baseUrl}/tag/${tag.slug}`,
    lastModified: tag.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...postPages, ...categoryPages, ...tagPages]
}

