// Re-export all types from Prisma
export * from '@prisma/client'
import { Post, Category, Tag, User } from '@prisma/client'

// Post with relations
export interface PostWithRelations extends Post {
  author: Pick<User, 'id' | 'name' | 'email'>
  category: Pick<Category, 'id' | 'nameAr' | 'nameEn' | 'slug'>
  tags: Tag[]
}

// Create/Update types
export interface CreatePostData {
  titleAr: string
  titleEn?: string
  slug: string
  description?: string
  content?: string
  audioUrl: string
  audioDuration?: number
  audioFileSize?: bigint
  thumbnailUrl?: string
  reciterName?: string
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  isFeatured?: boolean
  categoryId: string
  authorId: string
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string
}

export type UpdatePostData = Partial<CreatePostData>

export interface PostFilters {
  search?: string
  categoryId?: string
  authorId?: string
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  isFeatured?: boolean
}

// Common types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// UI State types
export interface LoadingState {
  isLoading: boolean
  error: string | null
}

export interface FormState<T = unknown> extends LoadingState {
  data: T | null
  isDirty: boolean
}

// Navigation types
export interface NavItem {
  title: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  children?: NavItem[]
  badge?: string | number
}

// Theme types
export type ThemeMode = 'light' | 'dark' | 'system'

// Language types
export type Language = 'ar' | 'en'

// SEO types
export interface SEOData {
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
  type?: 'website' | 'article'
}

// User types
export interface UserSession {
  user: {
    id: string
    email: string
    name: string
    role: 'ADMIN' | 'EDITOR' | 'VIEWER'
    avatarUrl?: string
  }
  expires: string
}

export interface LoginCredentials {
  email: string
  password: string
  remember?: boolean
}

// Permission types
export type Permission = 
  | 'posts.create'
  | 'posts.read'
  | 'posts.update'
  | 'posts.delete'
  | 'categories.create'
  | 'categories.read'
  | 'categories.update'
  | 'categories.delete'
  | 'tags.create'
  | 'tags.read'
  | 'tags.update'
  | 'tags.delete'
  | 'media.create'
  | 'media.read'
  | 'media.update'
  | 'media.delete'
  | 'users.create'
  | 'users.read'
  | 'users.update'
  | 'users.delete'
  | 'settings.read'
  | 'settings.update'
  | 'analytics.read'

export const ROLE_PERMISSIONS: Record<'ADMIN' | 'EDITOR' | 'VIEWER', Permission[]> = {
  ADMIN: [
    'posts.create', 'posts.read', 'posts.update', 'posts.delete',
    'categories.create', 'categories.read', 'categories.update', 'categories.delete',
    'tags.create', 'tags.read', 'tags.update', 'tags.delete',
    'media.create', 'media.read', 'media.update', 'media.delete',
    'users.create', 'users.read', 'users.update', 'users.delete',
    'settings.read', 'settings.update',
    'analytics.read'
  ],
  EDITOR: [
    'posts.create', 'posts.read', 'posts.update', 'posts.delete',
    'categories.read',
    'tags.create', 'tags.read', 'tags.update',
    'media.create', 'media.read', 'media.update', 'media.delete'
  ],
  VIEWER: [
    'posts.read',
    'categories.read',
    'tags.read',
    'media.read'
  ]
}