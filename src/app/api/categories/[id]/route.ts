import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateCategorySchema = z.object({
  nameAr: z.string().min(1, 'الاسم العربي مطلوب').optional(),
  nameEn: z.string().optional(),
  slug: z.string().min(1, 'الرابط المختصر مطلوب').optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  parentId: z.string().nullable().optional(),
  orderNumber: z.number().optional(),
  isActive: z.boolean().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
})

// GET /api/categories/[id] - جلب تصنيف واحد
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        posts: {
          select: {
            id: true,
            titleAr: true,
            status: true,
          }
        },
        _count: {
          select: {
            posts: true
          }
        }
      }
    })

    if (!category) {
      return NextResponse.json({ error: 'التصنيف غير موجود' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: category
    })
  } catch (error) {
    console.error('خطأ في جلب التصنيف:', error)
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    )
  }
}

// PUT /api/categories/[id] - تحديث تصنيف
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // التحقق من الصلاحيات
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مسموح' }, { status: 403 })
    }

    // التحقق من وجود التصنيف
    const existingCategory = await prisma.category.findUnique({
      where: { id: id }
    })

    if (!existingCategory) {
      return NextResponse.json({ error: 'التصنيف غير موجود' }, { status: 404 })
    }

    const body = await request.json()
    const validatedData = updateCategorySchema.parse(body)

    // التحقق من توفر الرابط المختصر إذا تم تغييره
    if (validatedData.slug && validatedData.slug !== existingCategory.slug) {
      const slugExists = await prisma.category.findUnique({
        where: { slug: validatedData.slug }
      })

      if (slugExists) {
        return NextResponse.json(
          { error: 'الرابط المختصر مستخدم بالفعل' },
          { status: 400 }
        )
      }
    }

    // التحقق من عدم تكرار الترتيب (إذا تم تغييره)
    if (validatedData.orderNumber !== undefined && validatedData.orderNumber !== existingCategory.orderNumber) {
      const orderExists = await prisma.category.findFirst({
        where: { 
          orderNumber: validatedData.orderNumber,
          NOT: { id }
        }
      })

      if (orderExists) {
        return NextResponse.json(
          { error: `رقم الترتيب ${validatedData.orderNumber} مستخدم بالفعل` },
          { status: 400 }
        )
      }
    }

    const updatedCategory = await prisma.category.update({
      where: { id: id },
      data: {
        ...validatedData,
        updatedAt: new Date()
      },
      include: {
        parent: true,
        children: true,
        _count: {
          select: {
            posts: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedCategory,
      message: 'تم تحديث التصنيف بنجاح'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'بيانات غير صحيحة', details: error.issues },
        { status: 400 }
      )
    }

    console.error('خطأ في تحديث التصنيف:', error)
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    )
  }
}

// DELETE /api/categories/[id] - حذف تصنيف
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // التحقق من الصلاحيات
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مسموح' }, { status: 403 })
    }

    // التحقق من وجود التصنيف
    const existingCategory = await prisma.category.findUnique({
      where: { id: id },
      include: {
        children: true,
        _count: {
          select: {
            posts: true
          }
        }
      }
    })

    if (!existingCategory) {
      return NextResponse.json({ error: 'التصنيف غير موجود' }, { status: 404 })
    }

    // التحقق من وجود تصنيفات فرعية
    if (existingCategory.children.length > 0) {
      return NextResponse.json(
        { error: 'لا يمكن حذف التصنيف لأنه يحتوي على تصنيفات فرعية' },
        { status: 400 }
      )
    }

    // التحقق من وجود منشورات مرتبطة
    if (existingCategory._count.posts > 0) {
      return NextResponse.json(
        { error: 'لا يمكن حذف التصنيف لأنه يحتوي على منشورات' },
        { status: 400 }
      )
    }

    await prisma.category.delete({
      where: { id: id }
    })

    return NextResponse.json({
      success: true,
      message: 'تم حذف التصنيف بنجاح'
    })
  } catch (error) {
    console.error('خطأ في حذف التصنيف:', error)
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    )
  }
}