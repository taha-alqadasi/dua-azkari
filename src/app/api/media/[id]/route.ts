import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// DELETE /api/media/[id] - حذف ملف
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

    // التحقق من الصلاحيات - فقط ADMIN أو المستخدم الذي رفع الملف
    const file = await prisma.mediaLibrary.findUnique({
      where: { id }
    })

    if (!file) {
      return NextResponse.json({ error: 'الملف غير موجود' }, { status: 404 })
    }

    const isAdmin = session.user.role === 'ADMIN'
    const isOwner = file.uploadedBy === session.user.id

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'غير مسموح' }, { status: 403 })
    }

    // حذف الملف من قاعدة البيانات
    await prisma.mediaLibrary.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'تم حذف الملف بنجاح'
    })
  } catch (error) {
    console.error('خطأ في حذف الملف:', error)
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    )
  }
}

