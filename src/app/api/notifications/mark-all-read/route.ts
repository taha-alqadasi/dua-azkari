import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/notifications/mark-all-read - تحديد جميع الإشعارات كمقروءة
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    await prisma.notification.updateMany({
      where: {
        OR: [
          { userId: session.user.id },
          { userId: null },
        ],
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'تم تحديد جميع الإشعارات كمقروءة',
    })
  } catch (error) {
    console.error('خطأ في تحديث الإشعارات:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

