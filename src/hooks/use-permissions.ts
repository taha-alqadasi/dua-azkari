'use client'

import { useSession } from 'next-auth/react'
import { PermissionAction } from '@prisma/client'
import { Resource, UserWithRole } from '@/types/permissions.types'
import { useEffect, useState } from 'react'

/**
 * Hook للتحقق من الصلاحيات على مستوى الواجهة
 */
export function usePermissions() {
  const { data: session, status } = useSession()
  const [userWithRole, setUserWithRole] = useState<UserWithRole | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUserPermissions() {
      if (!session?.user?.id) {
        setUserWithRole(null)
        setLoading(false)
        return
      }

      try {
        const response = await fetch('/api/users/me')
        if (response.ok) {
          const data = await response.json()
          setUserWithRole(data.data)
        }
      } catch (error) {
        console.error('Error fetching user permissions:', error)
      } finally {
        setLoading(false)
      }
    }

    if (status === 'authenticated') {
      fetchUserPermissions()
    } else {
      setLoading(false)
    }
  }, [session, status])

  /**
   * التحقق من صلاحية معينة
   */
  const hasPermission = (action: PermissionAction, resource: Resource): boolean => {
    if (!userWithRole) return false

    // الأدمن لديه كل الصلاحيات
    if (userWithRole.role === 'ADMIN') return true

    // التحقق من الصلاحيات المخصصة
    if (userWithRole.customRole && userWithRole.customRole.permissions) {
      const found = userWithRole.customRole.permissions.some(
        (p) => p.action === action && p.resource === resource
      )
      if (found) return true
    }

    // التحقق من الصلاحيات الافتراضية
    return checkDefaultPermission(userWithRole.role, action, resource)
  }

  /**
   * التحقق من عدة صلاحيات (أي واحدة منها)
   */
  const hasAnyPermission = (
    permissions: Array<{ action: PermissionAction; resource: Resource }>
  ): boolean => {
    return permissions.some((p) => hasPermission(p.action, p.resource))
  }

  /**
   * التحقق من كل الصلاحيات
   */
  const hasAllPermissions = (
    permissions: Array<{ action: PermissionAction; resource: Resource }>
  ): boolean => {
    return permissions.every((p) => hasPermission(p.action, p.resource))
  }

  /**
   * هل المستخدم أدمن؟
   */
  const isAdmin = (): boolean => {
    return userWithRole?.role === 'ADMIN'
  }

  return {
    user: userWithRole,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin
  }
}

/**
 * التحقق من الصلاحيات الافتراضية
 */
function checkDefaultPermission(
  role: 'ADMIN' | 'EDITOR' | 'VIEWER',
  action: PermissionAction,
  resource: Resource
): boolean {
  if (role === 'ADMIN') return true

  if (role === 'EDITOR') {
    const editorPermissions = [
      { action: 'CREATE', resource: 'posts' },
      { action: 'READ', resource: 'posts' },
      { action: 'UPDATE', resource: 'posts' },
      { action: 'DELETE', resource: 'posts' },
      { action: 'PUBLISH', resource: 'posts' },
      { action: 'READ', resource: 'categories' },
      { action: 'READ', resource: 'tags' },
      { action: 'CREATE', resource: 'media' },
      { action: 'READ', resource: 'media' },
      { action: 'DELETE', resource: 'media' }
    ]
    return editorPermissions.some(
      (p) => p.action === action && p.resource === resource
    )
  }

  if (role === 'VIEWER') {
    const viewerPermissions = [
      { action: 'READ', resource: 'posts' },
      { action: 'READ', resource: 'categories' },
      { action: 'READ', resource: 'tags' },
      { action: 'READ', resource: 'media' }
    ]
    return viewerPermissions.some(
      (p) => p.action === action && p.resource === resource
    )
  }

  return false
}

/**
 * Hook بسيط للتحقق من صلاحية واحدة
 */
export function useHasPermission(action: PermissionAction, resource: Resource) {
  const { hasPermission, loading } = usePermissions()
  return {
    hasPermission: hasPermission(action, resource),
    loading
  }
}

/**
 * Hook للتحقق من أن المستخدم أدمن
 */
export function useIsAdmin() {
  const { isAdmin, loading } = usePermissions()
  return {
    isAdmin: isAdmin(),
    loading
  }
}

