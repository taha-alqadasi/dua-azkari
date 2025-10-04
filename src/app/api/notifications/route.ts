import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { NotificationType } from '@/types/notification.types'

// Schema for creating notification
const createNotificationSchema = z.object({
  type: z.enum([
    'INFO', 'SUCCESS', 'WARNING', 'ERROR',
    'POST_CREATED', 'POST_UPDATED', 'POST_DELETED', 'POST_PUBLISHED',
    'USER_CREATED', 'USER_UPDATED', 'MEDIA_UPLOADED', 'COMMENT_ADDED'
  ]),
  title: z.string().min(1, 'العنوان مطلوب'),
  message: z.string().min(1, 'الرسالة مطلوبة'),
  userId: z.string().optional().nullable(),
  actionUrl: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

// GET /api/notifications - جلب إشعارات المستخدم الحالي
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const isRead = searchParams.get('isRead')
    const type = searchParams.get('type') as NotificationType | null
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: any = {
      OR: [
        { userId: session.user.id }, // إشعارات خاصة بالمستخدم
        { userId: null }, // إشعارات عامة
      ],
    }

    if (isRead !== null) {
      where.isRead = isRead === 'true'
    }

    if (type) {
      where.type = type
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: {
          ...where,
          isRead: false,
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
      unreadCount,
    })
  } catch (error) {
    console.error('خطأ في جلب الإشعارات:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

// POST /api/notifications - إنشاء إشعار جديد (للمدراء فقط)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // فقط المدراء يمكنهم إنشاء إشعارات يدوياً
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مسموح' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createNotificationSchema.parse(body)

    const notification = await prisma.notification.create({
      data: {
        ...validatedData,
        createdBy: session.user.id,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: notification,
      message: 'تم إنشاء الإشعار بنجاح',
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'بيانات غير صحيحة', details: error.errors },
        { status: 400 }
      )
    }
    console.error('خطأ في إنشاء الإشعار:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

