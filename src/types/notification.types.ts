// Notification Types
export type NotificationType = 
  | 'INFO'
  | 'SUCCESS'
  | 'WARNING'
  | 'ERROR'
  | 'POST_CREATED'
  | 'POST_UPDATED'
  | 'POST_DELETED'
  | 'POST_PUBLISHED'
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'MEDIA_UPLOADED'
  | 'COMMENT_ADDED'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  userId?: string
  isRead: boolean
  actionUrl?: string
  metadata?: Record<string, any>
  createdBy?: string
  createdAt: Date
  readAt?: Date
  user?: {
    id: string
    name: string
    email: string
  }
  creator?: {
    id: string
    name: string
    email: string
  }
}

export interface CreateNotificationDto {
  type: NotificationType
  title: string
  message: string
  userId?: string | null
  actionUrl?: string
  metadata?: Record<string, any>
}

export interface NotificationFilters {
  isRead?: boolean
  type?: NotificationType
  userId?: string
}

export interface NotificationStats {
  total: number
  unread: number
  byType: Record<NotificationType, number>
}

