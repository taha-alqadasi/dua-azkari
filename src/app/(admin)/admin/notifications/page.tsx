'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  ArrowRight,
  Bell,
  Check,
  Trash2,
  Eye,
  FileText,
  Users,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  Info,
  Loader2
} from 'lucide-react'
import { useNotifications } from '@/hooks/use-notifications'

// Notification types enum (مطابق لما في schema.prisma)
type NotificationType = 
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

// Map notification types to icons
const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'POST_CREATED':
    case 'POST_UPDATED':
    case 'POST_DELETED':
    case 'POST_PUBLISHED':
      return FileText
    case 'USER_CREATED':
    case 'USER_UPDATED':
      return Users
    case 'MEDIA_UPLOADED':
      return ImageIcon
    case 'SUCCESS':
      return CheckCircle
    case 'ERROR':
      return AlertCircle
    case 'WARNING':
      return AlertCircle
    case 'INFO':
    default:
      return Info
  }
}

// Map notification types to style types
const getNotificationStyleType = (type: NotificationType): 'info' | 'success' | 'warning' | 'error' => {
  if (type === 'SUCCESS' || type === 'POST_PUBLISHED' || type === 'USER_CREATED') return 'success'
  if (type === 'ERROR' || type === 'POST_DELETED') return 'error'
  if (type === 'WARNING') return 'warning'
  return 'info'
}

export default function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    error,
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    refresh
  } = useNotifications(filter === 'unread' ? { isRead: false } : undefined)

  const filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter(n => !n.isRead)

  const getNotificationColor = (type: 'info' | 'success' | 'warning' | 'error') => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-100',
          border: 'border-green-300',
          icon: 'bg-green-500',
          text: 'text-green-700'
        }
      case 'warning':
        return {
          bg: 'bg-amber-100',
          border: 'border-amber-300',
          icon: 'bg-amber-500',
          text: 'text-amber-700'
        }
      case 'error':
        return {
          bg: 'bg-red-100',
          border: 'border-red-300',
          icon: 'bg-red-500',
          text: 'text-red-700'
        }
      default:
        return {
          bg: 'bg-blue-100',
          border: 'border-blue-300',
          icon: 'bg-blue-500',
          text: 'text-blue-700'
        }
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) {
      return `منذ ${minutes} دقيقة`
    } else if (hours < 24) {
      return `منذ ${hours} ساعة`
    } else {
      return `منذ ${days} يوم`
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin">
            <Button variant="outline" size="icon">
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">الإشعارات</h1>
            <p className="text-gray-600 mt-1">
              لديك {unreadCount} إشعار غير مقروء
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => markAllAsRead()}
            disabled={unreadCount === 0 || isLoading}
            className="flex items-center gap-2"
          >
            <Check className="h-4 w-4" />
            تحديد الكل كمقروء
          </Button>
          <Button
            variant="outline"
            onClick={() => refresh()}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
            تحديث
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'bg-gradient-to-r from-primary to-teal-600' : ''}
          >
            الكل ({notifications.length})
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'outline'}
            onClick={() => setFilter('unread')}
            className={filter === 'unread' ? 'bg-gradient-to-r from-primary to-teal-600' : ''}
          >
            غير مقروء ({unreadCount})
          </Button>
        </div>
      </Card>

      {/* Notifications List */}
      <div className="space-y-3">
        {isLoading ? (
          <Card className="p-12 text-center">
            <Loader2 className="h-16 w-16 text-primary mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              جاري تحميل الإشعارات...
            </h3>
          </Card>
        ) : error ? (
          <Card className="p-12 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              حدث خطأ
            </h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <Button onClick={() => refresh()} variant="outline">
              إعادة المحاولة
            </Button>
          </Card>
        ) : filteredNotifications.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                لا توجد إشعارات
              </h3>
              <p className="text-gray-600">
                {filter === 'unread'
                  ? 'جميع الإشعارات مقروءة'
                  : 'ستظهر الإشعارات هنا عند وجودها'}
              </p>
            </div>
          </Card>
        ) : (
          filteredNotifications.map((notification) => {
            const styleType = getNotificationStyleType(notification.type)
            const colors = getNotificationColor(styleType)
            const Icon = getNotificationIcon(notification.type)
            const notifDate = new Date(notification.createdAt)

            return (
              <Card
                key={notification.id}
                className={`p-4 transition-all duration-300 hover:shadow-lg ${
                  !notification.isRead ? 'border-l-4 border-l-primary' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-full ${colors.icon} flex items-center justify-center shrink-0`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        {notification.title}
                        {!notification.isRead && (
                          <span className="w-2 h-2 bg-primary rounded-full"></span>
                        )}
                      </h3>
                      <span className="text-xs text-gray-500 shrink-0">
                        {formatTime(notifDate)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {notification.message}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {!notification.isRead && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs"
                        >
                          <Check className="h-3 w-3 ml-1" />
                          تحديد كمقروء
                        </Button>
                      )}
                      {notification.actionUrl && (
                        <Link href={notification.actionUrl}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                          >
                            <Eye className="h-3 w-3 ml-1" />
                            عرض
                          </Button>
                        </Link>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteNotification(notification.id)}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3 ml-1" />
                        حذف
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>

      {/* Info Card */}
      {!isLoading && !error && (
        <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                نظام الإشعارات متصل
              </h3>
              <p className="text-sm text-gray-600">
                جميع الإشعارات يتم عرضها من قاعدة البيانات. سيتم تحديث الإشعارات تلقائياً كل 30 ثانية.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
