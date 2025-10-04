import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    // جلب محتوى ads.txt من الإعدادات
    const setting = await prisma.setting.findUnique({
      where: {
        settingKey: 'webmaster'
      }
    })

    let adsTxtContent = ''
    
    if (setting && setting.settingValue && typeof setting.settingValue === 'object') {
      adsTxtContent = (setting.settingValue as any).adsTxt || ''
    }

    // إرجاع المحتوى كنص عادي
    return new NextResponse(adsTxtContent || '# No ads.txt content configured', {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, must-revalidate'
      }
    })
  } catch (error) {
    console.error('Error fetching ads.txt:', error)
    return new NextResponse('# Error loading ads.txt', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8'
      }
    })
  }
}

