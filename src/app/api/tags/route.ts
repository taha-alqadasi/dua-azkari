import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createTagSchema = z.object({
  nameAr: z.string().min(1, 'الاسم العربي مطلوب'),
  nameEn: z.string().optional(),
  slug: z.string().min(1, 'الرابط المختصر مطلوب'),
})

// GET /api/tags - جلب جميع الوسوم
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { nameAr: { contains: search, mode: 'insensitive' } },
        { nameEn: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [tags, total] = await Promise.all([
      prisma.tag.findMany({
        where,
        include: {
          _count: {
            select: {
              posts: true
            }
          }
        },
        orderBy: {
          nameAr: 'asc'
        },
        skip,
        take: limit
      }),
      prisma.tag.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: tags,
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
    console.error('خطأ في جلب الوسوم:', error)
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    )
  }
}

// POST /api/tags - إنشاء وسم جديد
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
    const validatedData = createTagSchema.parse(body)

    // التحقق من توفر الرابط المختصر
    const slugExists = await prisma.tag.findUnique({
      where: { slug: validatedData.slug }
    })

    if (slugExists) {
      return NextResponse.json(
        { error: 'الرابط المختصر مستخدم بالفعل' },
        { status: 400 }
      )
    }

    const tag = await prisma.tag.create({
      data: validatedData,
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: tag,
      message: 'تم إنشاء الوسم بنجاح'
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'بيانات غير صحيحة', details: error.issues },
        { status: 400 }
      )
    }

    console.error('خطأ في إنشاء الوسم:', error)
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    )
  }
}