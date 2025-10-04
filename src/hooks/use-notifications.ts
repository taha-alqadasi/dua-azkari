'use client'

import { useState, useEffect, useCallback } from 'react'
import { Notification, NotificationFilters } from '@/types/notification.types'

interface UseNotificationsResult {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  error: string | null
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  refresh: () => Promise<void>
}

export function useNotifications(filters?: NotificationFilters): UseNotificationsResult {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (filters?.isRead !== undefined) {
        params.append('isRead', filters.isRead.toString())
      }
      if (filters?.type) {
        params.append('type', filters.type)
      }
      params.append('limit', '50') // جلب آخر 50 إشعار

      const response = await fetch(`/api/notifications?${params.toString()}`)
      if (!response.ok) {
        throw new Error('فشل في جلب الإشعارات')
      }

      const data = await response.json()
      setNotifications(data.data || [])
      setUnreadCount(data.unreadCount || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ')
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchNotifications()
    
    // تحديث تلقائي كل 30 ثانية
    const interval = setInterval(fetchNotifications, 30000)
    
    return () => clearInterval(interval)
  }, [fetchNotifications])

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isRead: true }),
      })

      if (!response.ok) {
        throw new Error('فشل في تحديث الإشعار')
      }

      // تحديث الحالة المحلية
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, isRead: true, readAt: new Date() } : notif
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('خطأ في تحديث الإشعار:', err)
      throw err
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('فشل في تحديث الإشعارات')
      }

      // تحديث الحالة المحلية
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true, readAt: new Date() }))
      )
      setUnreadCount(0)
    } catch (err) {
      console.error('خطأ في تحديث الإشعارات:', err)
      throw err
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('فشل في حذف الإشعار')
      }

      // تحديث الحالة المحلية
      const deletedNotif = notifications.find(n => n.id === id)
      setNotifications(prev => prev.filter(notif => notif.id !== id))
      
      if (deletedNotif && !deletedNotif.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (err) {
      console.error('خطأ في حذف الإشعار:', err)
      throw err
    }
  }

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh: fetchNotifications,
  }
}

