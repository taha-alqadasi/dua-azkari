import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateTagSchema = z.object({
  nameAr: z.string().min(1, 'الاسم العربي مطلوب').optional(),
  nameEn: z.string().optional(),
  slug: z.string().min(1, 'الرابط المختصر مطلوب').optional(),
  description: z.string().optional(),
  color: z.string().optional(),
  isActive: z.boolean().optional(),
})

// GET /api/tags/[id] - جلب وسم واحد
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const tag = await prisma.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      }
    })

    if (!tag) {
      return NextResponse.json(
        { error: 'الوسم غير موجود' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: tag
    })
  } catch (error) {
    console.error('خطأ في جلب الوسم:', error)
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    )
  }
}

// PUT /api/tags/[id] - تحديث وسم
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
    if (!['ADMIN', 'EDITOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'غير مسموح' }, { status: 403 })
    }

    // التحقق من وجود الوسم
    const existingTag = await prisma.tag.findUnique({
      where: { id }
    })

    if (!existingTag) {
      return NextResponse.json({ error: 'الوسم غير موجود' }, { status: 404 })
    }

    const body = await request.json()
    const tagData = updateTagSchema.parse(body)

    // التحقق من توفر الرابط المختصر إذا تم تغييره
    if (tagData.slug && tagData.slug !== existingTag.slug) {
      const slugExists = await prisma.tag.findUnique({
        where: { slug: tagData.slug }
      })

      if (slugExists) {
        return NextResponse.json(
          { error: 'الرابط المختصر مستخدم بالفعل' },
          { status: 400 }
        )
      }
    }

    // تحديث الوسم
    const tag = await prisma.tag.update({
      where: { id },
      data: tagData,
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
      message: 'تم تحديث الوسم بنجاح'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'بيانات غير صحيحة', details: error.issues },
        { status: 400 }
      )
    }

    console.error('خطأ في تحديث الوسم:', error)
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    )
  }
}

// DELETE /api/tags/[id] - حذف وسم
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

    // التحقق من الصلاحيات - فقط ADMIN
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مسموح' }, { status: 403 })
    }

    // التحقق من وجود الوسم
    const tag = await prisma.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      }
    })

    if (!tag) {
      return NextResponse.json({ error: 'الوسم غير موجود' }, { status: 404 })
    }

    // التحقق من عدم وجود منشورات مرتبطة
    if (tag._count.posts > 0) {
      return NextResponse.json(
        { error: `لا يمكن حذف الوسم. يوجد ${tag._count.posts} منشور مرتبط به` },
        { status: 400 }
      )
    }

    // حذف الوسم
    await prisma.tag.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'تم حذف الوسم بنجاح'
    })
  } catch (error) {
    console.error('خطأ في حذف الوسم:', error)
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    )
  }
}

