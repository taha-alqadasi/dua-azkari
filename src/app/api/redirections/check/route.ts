import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - التحقق من وجود تحويل لمسار معين
export async function GET(request: NextRequest) {
  try {
    // السماح فقط للطلبات من الـ middleware
    const isMiddlewareRequest = request.headers.get('x-middleware-request') === 'true'
    
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')

    if (!path) {
      return NextResponse.json({ redirect: false })
    }

    console.log('[API] Checking redirection for path:', path)

    // البحث عن تحويل مطابق
    const redirection = await prisma.redirection.findFirst({
      where: {
        fromPath: path,
        isActive: true
      }
    })

    console.log('[API] Found redirection:', redirection)

    if (redirection) {
      return NextResponse.json({
        redirect: true,
        toPath: redirection.toPath,
        redirectType: redirection.redirectType
      })
    }

    return NextResponse.json({ redirect: false })

  } catch (error) {
    console.error('[API] Error checking redirection:', error)
    return NextResponse.json({ redirect: false }, { status: 500 })
  }
}

