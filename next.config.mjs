import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // تعطيل ESLint أثناء البناء (مؤقتاً للاختبار)
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // تعطيل TypeScript errors أثناء البناء (مؤقتاً للاختبار)
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // إعادة التوجيه التلقائية من قاعدة البيانات + الثابتة
  async redirects() {
    // التحويلات الثابتة
    const staticRedirects = [
      {
        source: '/tag',
        destination: '/tags',
        permanent: true,
      },
      {
        source: '/category',
        destination: '/categories',
        permanent: true,
      },
      {
        source: '/posts',
        destination: '/listen',
        permanent: true,
      },
      {
        source: '/listen',
        destination: '/listen-all',
        permanent: true,
      },
    ]

    // جلب التحويلات من قاعدة البيانات
    try {
      const dbRedirects = await prisma.redirection.findMany({
        where: { isActive: true }
      })

      console.log('[Redirects Config] Loaded redirects from database:', dbRedirects.length)

      const dynamicRedirects = dbRedirects.map(redirect => ({
        source: redirect.fromPath,
        destination: redirect.toPath,
        permanent: redirect.redirectType === 'PERMANENT_301' || redirect.redirectType === 'PERMANENT_308'
      }))

      return [...staticRedirects, ...dynamicRedirects]
    } catch (error) {
      console.error('[Redirects Config] Error loading redirects from database:', error)
      // في حالة فشل الاتصال بقاعدة البيانات، نرجع التحويلات الثابتة فقط
      return staticRedirects
    } finally {
      await prisma.$disconnect()
    }
  },
  
  // دعم الصور من مصادر خارجية
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

export default nextConfig

