// Permission Utilities
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PermissionAction, UserRole } from '@prisma/client'
import { Resource, UserWithRole } from '@/types/permissions.types'

/**
 * جلب المستخدم الحالي مع الصلاحيات
 */
export async function getCurrentUserWithPermissions(): Promise<UserWithRole | null> {
  const session = await auth()
  if (!session?.user?.id) return null

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      customRole: {
        include: {
          permissions: {
            include: {
              permission: true
            }
          }
        }
      }
    }
  })

  if (!user) return null

  // تحويل البيانات للنوع المطلوب
  const userWithRole: UserWithRole = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    customRoleId: user.customRoleId ?? undefined,
    avatarUrl: user.avatarUrl ?? undefined,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    customRole: user.customRole
      ? {
          id: user.customRole.id,
          name: user.customRole.name,
          nameEn: user.customRole.nameEn ?? undefined,
          description: user.customRole.description ?? undefined,
          isActive: user.customRole.isActive,
          isSystem: user.customRole.isSystem,
          createdAt: user.customRole.createdAt,
          updatedAt: user.customRole.updatedAt,
          permissions: user.customRole.permissions.map((rp) => ({
            id: rp.permission.id,
            action: rp.permission.action,
            resource: rp.permission.resource as Resource,
            description: rp.permission.description ?? undefined,
            createdAt: rp.permission.createdAt
          }))
        }
      : undefined
  }

  return userWithRole
}

/**
 * التحقق من صلاحية معينة للمستخدم الحالي
 */
export async function checkPermission(
  action: PermissionAction,
  resource: Resource
): Promise<boolean> {
  const user = await getCurrentUserWithPermissions()
  if (!user) return false

  // الأدمن لديه كل الصلاحيات
  if (user.role === 'ADMIN') return true

  // التحقق من الصلاحيات المخصصة
  if (user.customRole && user.customRole.permissions) {
    const hasPermission = user.customRole.permissions.some(
      (p) => p.action === action && p.resource === resource
    )
    if (hasPermission) return true
  }

  // التحقق من الصلاحيات الافتراضية
  return checkDefaultPermission(user.role, action, resource)
}

/**
 * التحقق من الصلاحيات الافتراضية للدور
 */
function checkDefaultPermission(
  role: UserRole,
  action: PermissionAction,
  resource: Resource
): boolean {
  // الأدمن لديه كل الصلاحيات
  if (role === 'ADMIN') return true

  // المحرر لديه صلاحيات محددة
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

  // المشاهد لديه صلاحيات قراءة فقط
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
 * التحقق من عدة صلاحيات (أي واحدة منها)
 */
export async function checkAnyPermission(
  permissions: Array<{ action: PermissionAction; resource: Resource }>
): Promise<boolean> {
  for (const perm of permissions) {
    const hasPermission = await checkPermission(perm.action, perm.resource)
    if (hasPermission) return true
  }
  return false
}

/**
 * التحقق من كل الصلاحيات (يجب أن تكون كلها متوفرة)
 */
export async function checkAllPermissions(
  permissions: Array<{ action: PermissionAction; resource: Resource }>
): Promise<boolean> {
  for (const perm of permissions) {
    const hasPermission = await checkPermission(perm.action, perm.resource)
    if (!hasPermission) return false
  }
  return true
}

/**
 * التحقق من أن المستخدم أدمن
 */
export async function isAdmin(): Promise<boolean> {
  const session = await auth()
  return session?.user?.role === 'ADMIN'
}

/**
 * رمي خطأ إذا لم يكن لديه الصلاحية
 */
export async function requirePermission(
  action: PermissionAction,
  resource: Resource
): Promise<void> {
  const hasPermission = await checkPermission(action, resource)
  if (!hasPermission) {
    throw new Error('ليس لديك الصلاحية للقيام بهذا الإجراء')
  }
}

/**
 * رمي خطأ إذا لم يكن أدمن
 */
export async function requireAdmin(): Promise<void> {
  const admin = await isAdmin()
  if (!admin) {
    throw new Error('هذه العملية متاحة للمدراء فقط')
  }
}

