import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updatePageSchema = z.object({
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

// GET /api/pages/[id] - جلب صفحة واحدة
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const page = await prisma.page.findUnique({
      where: { id },
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

    if (!page) {
      return NextResponse.json(
        { error: 'الصفحة غير موجودة' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: page
    })
  } catch (error) {
    console.error('خطأ في جلب الصفحة:', error)
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    )
  }
}

// PUT /api/pages/[id] - تحديث صفحة
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    if (!['ADMIN', 'EDITOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'غير مسموح' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const pageData = updatePageSchema.parse(body)

    // التحقق من وجود الصفحة
    const existingPage = await prisma.page.findUnique({
      where: { id }
    })

    if (!existingPage) {
      return NextResponse.json(
        { error: 'الصفحة غير موجودة' },
        { status: 404 }
      )
    }

    // التحقق من توفر الرابط المختصر (إذا تم تغييره)
    if (pageData.slug !== existingPage.slug) {
      const slugExists = await prisma.page.findUnique({
        where: { slug: pageData.slug }
      })

      if (slugExists) {
        return NextResponse.json(
          { error: 'الرابط المختصر مستخدم بالفعل' },
          { status: 400 }
        )
      }
    }

    // تحديث الصفحة
    const page = await prisma.page.update({
      where: { id },
      data: pageData,
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
      message: 'تم تحديث الصفحة بنجاح'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'بيانات غير صحيحة', details: error.issues },
        { status: 400 }
      )
    }

    console.error('خطأ في تحديث الصفحة:', error)
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    )
  }
}

// DELETE /api/pages/[id] - حذف صفحة
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مسموح' }, { status: 403 })
    }

    const { id } = await params

    // التحقق من وجود الصفحة
    const existingPage = await prisma.page.findUnique({
      where: { id }
    })

    if (!existingPage) {
      return NextResponse.json(
        { error: 'الصفحة غير موجودة' },
        { status: 404 }
      )
    }

    // حذف الصفحة
    await prisma.page.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'تم حذف الصفحة بنجاح'
    })
  } catch (error) {
    console.error('خطأ في حذف الصفحة:', error)
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    )
  }
}

