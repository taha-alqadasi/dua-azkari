// Notification Helper Functions
import { prisma } from '@/lib/prisma'
import { NotificationType, CreateNotificationDto } from '@/types/notification.types'

/**
 * إنشاء إشعار جديد
 */
export async function createNotification(
  data: CreateNotificationDto,
  createdBy?: string
): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        ...data,
        createdBy,
      },
    })
  } catch (error) {
    console.error('خطأ في إنشاء الإشعار:', error)
  }
}

/**
 * إنشاء إشعار عام لجميع المستخدمين
 */
export async function createGlobalNotification(
  type: NotificationType,
  title: string,
  message: string,
  actionUrl?: string
): Promise<void> {
  await createNotification({
    type,
    title,
    message,
    userId: null,
    actionUrl,
  })
}

/**
 * إنشاء إشعار لمستخدم معين
 */
export async function createUserNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  actionUrl?: string,
  createdBy?: string
): Promise<void> {
  await createNotification(
    {
      type,
      title,
      message,
      userId,
      actionUrl,
    },
    createdBy
  )
}

/**
 * إشعارات خاصة بالمنشورات
 */
export const PostNotifications = {
  created: async (postId: string, postTitle: string, authorId: string) => {
    await createNotification(
      {
        type: 'POST_CREATED',
        title: 'منشور جديد',
        message: `تم إنشاء منشور جديد: ${postTitle}`,
        actionUrl: `/admin/posts/${postId}`,
        userId: null, // إشعار عام للمدراء
      },
      authorId
    )
  },

  updated: async (postId: string, postTitle: string, authorId: string) => {
    await createNotification(
      {
        type: 'POST_UPDATED',
        title: 'تحديث منشور',
        message: `تم تحديث المنشور: ${postTitle}`,
        actionUrl: `/admin/posts/${postId}`,
        userId: null,
      },
      authorId
    )
  },

  deleted: async (postTitle: string, authorId: string) => {
    await createNotification(
      {
        type: 'POST_DELETED',
        title: 'حذف منشور',
        message: `تم حذف المنشور: ${postTitle}`,
        actionUrl: '/admin/posts',
        userId: null,
      },
      authorId
    )
  },

  published: async (postId: string, postTitle: string, authorId: string, originalAuthorId: string) => {
    // إشعار عام
    await createNotification(
      {
        type: 'POST_PUBLISHED',
        title: 'نشر منشور',
        message: `تم نشر المنشور: ${postTitle}`,
        actionUrl: `/admin/posts/${postId}`,
        userId: null,
      },
      authorId
    )

    // إشعار خاص للكاتب الأصلي إذا لم يكن هو من نشره
    if (originalAuthorId !== authorId) {
      await createUserNotification(
        originalAuthorId,
        'SUCCESS',
        'تم نشر منشورك',
        `تم نشر منشورك: ${postTitle}`,
        `/admin/posts/${postId}`,
        authorId
      )
    }
  },
}

/**
 * إشعارات خاصة بالمستخدمين
 */
export const UserNotifications = {
  created: async (userName: string, userEmail: string, createdBy?: string) => {
    await createNotification(
      {
        type: 'USER_CREATED',
        title: 'مستخدم جديد',
        message: `تم إضافة مستخدم جديد: ${userName} (${userEmail})`,
        actionUrl: '/admin/users',
        userId: null,
      },
      createdBy
    )
  },

  updated: async (userName: string, updatedBy?: string) => {
    await createNotification(
      {
        type: 'USER_UPDATED',
        title: 'تحديث مستخدم',
        message: `تم تحديث بيانات المستخدم: ${userName}`,
        actionUrl: '/admin/users',
        userId: null,
      },
      updatedBy
    )
  },
}

/**
 * إشعارات خاصة بالوسائط
 */
export const MediaNotifications = {
  uploaded: async (fileName: string, uploadedBy: string) => {
    await createNotification(
      {
        type: 'MEDIA_UPLOADED',
        title: 'ملف وسائط جديد',
        message: `تم رفع ملف جديد: ${fileName}`,
        actionUrl: '/admin/media',
        userId: null,
      },
      uploadedBy
    )
  },
}

