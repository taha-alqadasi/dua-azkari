import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// تعطيل الـ cache للـ API
export const dynamic = 'force-dynamic'
export const revalidate = 0

const createCategorySchema = z.object({
  nameAr: z.string().min(1, 'الاسم العربي مطلوب'),
  nameEn: z.string().optional(),
  slug: z.string().min(1, 'الرابط المختصر مطلوب'),
  description: z.string().optional(),
  icon: z.string().optional(),
  parentId: z.string().nullable().optional(),
  orderNumber: z.number().default(0),
  isActive: z.boolean().default(true),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
})

// GET /api/categories - جلب جميع التصنيفات
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const parentId = searchParams.get('parentId')
    const isActive = searchParams.get('isActive')

    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { nameAr: { contains: search, mode: 'insensitive' } },
        { nameEn: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (parentId !== null) {
      where.parentId = parentId === 'null' ? null : parentId
    }

    if (isActive !== null) {
      where.isActive = isActive === 'true'
    }

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        include: {
          parent: {
            select: {
              id: true,
              nameAr: true,
              nameEn: true
            }
          },
          children: {
            select: {
              id: true,
              nameAr: true,
              nameEn: true
            }
          },
          _count: {
            select: {
              posts: true,
              children: true
            }
          }
        },
        orderBy: [
          { orderNumber: 'asc' },
          { nameAr: 'asc' }
        ],
        skip,
        take: limit
      }),
      prisma.category.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: categories,
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
    console.error('خطأ في جلب التصنيفات:', error)
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    )
  }
}

// POST /api/categories - إنشاء تصنيف جديد
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // التحقق من الصلاحيات
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مسموح' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createCategorySchema.parse(body)

    // التحقق من توفر الرابط المختصر
    const slugExists = await prisma.category.findUnique({
      where: { slug: validatedData.slug }
    })

    if (slugExists) {
      return NextResponse.json(
        { error: 'الرابط المختصر مستخدم بالفعل' },
        { status: 400 }
      )
    }

    // التحقق من وجود التصنيف الأب إذا تم تحديده
    if (validatedData.parentId) {
      const parentExists = await prisma.category.findUnique({
        where: { id: validatedData.parentId }
      })

      if (!parentExists) {
        return NextResponse.json(
          { error: 'التصنيف الأب غير موجود' },
          { status: 400 }
        )
      }
    }

    // إذا كان رقم الترتيب 0 أو غير محدد، نحدده تلقائياً
    if (!validatedData.orderNumber || validatedData.orderNumber === 0) {
      const maxOrder = await prisma.category.findFirst({
        orderBy: { orderNumber: 'desc' },
        select: { orderNumber: true }
      })
      validatedData.orderNumber = (maxOrder?.orderNumber || 0) + 1
    }

    const category = await prisma.category.create({
      data: validatedData,
      include: {
        parent: {
          select: {
            id: true,
            nameAr: true,
            nameEn: true
          }
        },
        _count: {
          select: {
            posts: true,
            children: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: category,
      message: 'تم إنشاء التصنيف بنجاح'
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'بيانات غير صحيحة', details: error.issues },
        { status: 400 }
      )
    }

    console.error('خطأ في إنشاء التصنيف:', error)
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    )
  }
}