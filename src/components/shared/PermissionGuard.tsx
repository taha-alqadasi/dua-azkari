'use client'

import { ReactNode } from 'react'
import { usePermissions } from '@/hooks/use-permissions'
import { PermissionAction } from '@prisma/client'
import { Resource } from '@/types/permissions.types'
import { Card } from '@/components/ui/card'
import { Lock } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface PermissionGuardProps {
  children: ReactNode
  action: PermissionAction
  resource: Resource
  fallback?: ReactNode
  showDenied?: boolean
}

/**
 * Higher-Order Component لحماية المكونات بناءً على الصلاحيات
 */
export function PermissionGuard({
  children,
  action,
  resource,
  fallback,
  showDenied = true
}: PermissionGuardProps) {
  const { hasPermission, loading } = usePermissions()

  // عرض loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // التحقق من الصلاحية
  const allowed = hasPermission(action, resource)

  if (!allowed) {
    // إذا تم توفير fallback مخصص
    if (fallback) {
      return <>{fallback}</>
    }

    // إذا كان showDenied = false، لا نعرض شيء
    if (!showDenied) {
      return null
    }

    // عرض رسالة افتراضية
    return (
      <Card className="p-8 text-center max-w-md mx-auto">
        <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">غير مصرح لك</h2>
        <p className="text-gray-600 mb-4">
          ليس لديك صلاحية للوصول إلى هذا المحتوى
        </p>
        <Link href="/admin">
          <Button variant="outline">العودة للوحة التحكم</Button>
        </Link>
      </Card>
    )
  }

  return <>{children}</>
}

/**
 * مكون بسيط لإخفاء/إظهار العناصر بناءً على الصلاحية
 */
export function Can({
  children,
  action,
  resource
}: {
  children: ReactNode
  action: PermissionAction
  resource: Resource
}) {
  const { hasPermission, loading } = usePermissions()

  if (loading) return null
  if (!hasPermission(action, resource)) return null

  return <>{children}</>
}

/**
 * مكون لإخفاء/إظهار العناصر للأدمن فقط
 */
export function AdminOnly({ children }: { children: ReactNode }) {
  const { isAdmin, loading } = usePermissions()

  if (loading) return null
  if (!isAdmin()) return null

  return <>{children}</>
}

