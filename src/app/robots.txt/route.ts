import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'
    
    // جلب محتوى robots.txt من الإعدادات
    const setting = await prisma.setting.findUnique({
      where: {
        settingKey: 'webmaster'
      }
    })

    let robotsTxtContent = ''
    
    if (setting && setting.settingValue && typeof setting.settingValue === 'object') {
      robotsTxtContent = (setting.settingValue as any).robotsTxt || ''
    }

    // إذا لم يكن هناك محتوى مخصص، استخدم القيم الافتراضية
    if (!robotsTxtContent || robotsTxtContent.trim() === '') {
      robotsTxtContent = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

User-agent: Googlebot
Allow: /
Disallow: /admin/
Disallow: /api/
Crawl-delay: 0

User-agent: Bingbot
Allow: /
Disallow: /admin/
Disallow: /api/
Crawl-delay: 1

Sitemap: ${baseUrl}/sitemap.xml`
    }

    // إرجاع المحتوى كنص عادي
    return new NextResponse(robotsTxtContent, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, must-revalidate'
      }
    })
  } catch (error) {
    console.error('Error fetching robots.txt:', error)
    
    // في حالة الخطأ، إرجاع محتوى افتراضي
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'
    const defaultContent = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml`

    return new NextResponse(defaultContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8'
      }
    })
  }
}

