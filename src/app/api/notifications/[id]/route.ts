import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// PATCH /api/notifications/[id] - تحديث حالة الإشعار (قراءة/عدم قراءة)
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const resolvedParams = await params
    const { id } = resolvedParams

    const notification = await prisma.notification.findUnique({
      where: { id },
    })

    if (!notification) {
      return NextResponse.json({ error: 'الإشعار غير موجود' }, { status: 404 })
    }

    // التحقق من أن الإشعار يخص المستخدم أو عام
    if (notification.userId && notification.userId !== session.user.id) {
      return NextResponse.json({ error: 'غير مسموح' }, { status: 403 })
    }

    const body = await request.json()
    const { isRead } = body

    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: {
        isRead,
        readAt: isRead ? new Date() : null,
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedNotification,
      message: 'تم تحديث الإشعار بنجاح',
    })
  } catch (error) {
    console.error('خطأ في تحديث الإشعار:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

// DELETE /api/notifications/[id] - حذف إشعار
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const resolvedParams = await params
    const { id } = resolvedParams

    const notification = await prisma.notification.findUnique({
      where: { id },
    })

    if (!notification) {
      return NextResponse.json({ error: 'الإشعار غير موجود' }, { status: 404 })
    }

    // التحقق من الصلاحيات
    if (notification.userId && notification.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مسموح' }, { status: 403 })
    }

    await prisma.notification.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'تم حذف الإشعار بنجاح',
    })
  } catch (error) {
    console.error('خطأ في حذف الإشعار:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

