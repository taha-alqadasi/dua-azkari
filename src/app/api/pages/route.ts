import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createPageSchema = z.object({
  titleAr: z.string().min(1, 'العنوان العربي مطلوب'),
  titleEn: z.string().optional(),
  slug: z.string().min(1, 'الرابط المختصر مطلوب'),
  content: z.string().min(1, 'المحتوى مطلوب'),
  template: z.string().default('default'),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
})

// GET /api/pages - جلب جميع الصفحات
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status')

    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { titleAr: { contains: search, mode: 'insensitive' } },
        { titleEn: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status) {
      where.status = status
    }

    const [pages, total] = await Promise.all([
      prisma.page.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.page.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: pages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('خطأ في جلب الصفحات:', error)
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    )
  }
}

// POST /api/pages - إنشاء صفحة جديدة
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // التحقق من الصلاحيات
    if (!['ADMIN', 'EDITOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'غير مسموح' }, { status: 403 })
    }

    const body = await request.json()
    const pageData = createPageSchema.parse(body)

    // التحقق من توفر الرابط المختصر
    const slugExists = await prisma.page.findUnique({
      where: { slug: pageData.slug }
    })

    if (slugExists) {
      return NextResponse.json(
        { error: 'الرابط المختصر مستخدم بالفعل' },
        { status: 400 }
      )
    }

    // إنشاء الصفحة
    const page = await prisma.page.create({
      data: {
        ...pageData,
        authorId: session.user.id
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: page,
      message: 'تم إنشاء الصفحة بنجاح'
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'بيانات غير صحيحة', details: error.issues },
        { status: 400 }
      )
    }

    console.error('خطأ في إنشاء الصفحة:', error)
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    )
  }
}

