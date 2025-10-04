// Types for Permissions System
import { PermissionAction } from '@prisma/client'

export type { PermissionAction }

// الموارد المتاحة في النظام
export type Resource =
  | 'posts'
  | 'categories'
  | 'tags'
  | 'media'
  | 'users'
  | 'roles'
  | 'settings'
  | 'menus'
  | 'pages'
  | 'analytics'

// نوع الصلاحية الكاملة
export interface Permission {
  id: string
  action: PermissionAction
  resource: Resource
  description?: string
  createdAt: Date
}

// نوع الدور مع الصلاحيات
export interface RoleWithPermissions {
  id: string
  name: string
  nameEn?: string
  description?: string
  isActive: boolean
  isSystem: boolean
  createdAt: Date
  updatedAt: Date
  permissions: Permission[]
  _count?: {
    users: number
  }
}

// نوع بسيط للدور
export interface Role {
  id: string
  name: string
  nameEn?: string
  description?: string
  isActive: boolean
  isSystem: boolean
  createdAt: Date
  updatedAt: Date
}

// نوع المستخدم مع الصلاحيات
export interface UserWithRole {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'EDITOR' | 'VIEWER'
  customRoleId?: string
  avatarUrl?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  customRole?: RoleWithPermissions
}

// مساعدات للصلاحيات
export const PermissionLabels: Record<PermissionAction, string> = {
  CREATE: 'إنشاء',
  READ: 'قراءة',
  UPDATE: 'تعديل',
  DELETE: 'حذف',
  PUBLISH: 'نشر',
  MANAGE_USERS: 'إدارة المستخدمين',
  MANAGE_ROLES: 'إدارة الأدوار',
  MANAGE_SETTINGS: 'إدارة الإعدادات',
  MANAGE_MENUS: 'إدارة القوائم',
  MANAGE_MEDIA: 'إدارة الوسائط'
}

export const ResourceLabels: Record<Resource, string> = {
  posts: 'المقالات',
  categories: 'الفئات',
  tags: 'الوسوم',
  media: 'الوسائط',
  users: 'المستخدمين',
  roles: 'الأدوار',
  settings: 'الإعدادات',
  menus: 'القوائم',
  pages: 'الصفحات',
  analytics: 'الإحصائيات'
}

// الصلاحيات الافتراضية لكل دور نظام
export const DefaultRolePermissions = {
  ADMIN: '*', // كل الصلاحيات
  EDITOR: [
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
  ],
  VIEWER: [
    { action: 'READ', resource: 'posts' },
    { action: 'READ', resource: 'categories' },
    { action: 'READ', resource: 'tags' },
    { action: 'READ', resource: 'media' }
  ]
} as const

// دالة للتحقق من صلاحية معينة
export function hasPermission(
  user: UserWithRole | null,
  action: PermissionAction,
  resource: Resource
): boolean {
  if (!user) return false

  // الأدمن لديه كل الصلاحيات
  if (user.role === 'ADMIN') return true

  // التحقق من الصلاحيات المخصصة
  if (user.customRole && user.customRole.permissions) {
    return user.customRole.permissions.some(
      (p) => p.action === action && p.resource === resource
    )
  }

  // التحقق من الصلاحيات الافتراضية للدور
  const defaultPerms = DefaultRolePermissions[user.role]
  if (defaultPerms === '*') return true
  
  if (Array.isArray(defaultPerms)) {
    return defaultPerms.some(
      (p) => p.action === action && p.resource === resource
    )
  }

  return false
}

// دالة للتحقق من عدة صلاحيات
export function hasAnyPermission(
  user: UserWithRole | null,
  permissions: Array<{ action: PermissionAction; resource: Resource }>
): boolean {
  return permissions.some((p) => hasPermission(user, p.action, p.resource))
}

// دالة للتحقق من كل الصلاحيات
export function hasAllPermissions(
  user: UserWithRole | null,
  permissions: Array<{ action: PermissionAction; resource: Resource }>
): boolean {
  return permissions.every((p) => hasPermission(user, p.action, p.resource))
}

