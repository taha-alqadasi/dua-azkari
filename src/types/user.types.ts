import { User, UserRole } from '@prisma/client'

// Extended User types
export interface UserWithStats extends User {
  _count: {
    posts: number
    pages: number
    mediaLibrary: number
  }
}

// User form data
export interface CreateUserData {
  email: string
  name: string
  password: string
  role: UserRole
  avatarUrl?: string
}

export interface UpdateUserData extends Partial<Omit<CreateUserData, 'password'>> {
  id: string
  currentPassword?: string
  newPassword?: string
}

// User profile data
export interface UserProfile {
  id: string
  email: string
  name: string
  role: UserRole
  avatarUrl?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
  preferences: UserPreferences
}

// User preferences
export interface UserPreferences {
  language: 'ar' | 'en'
  theme: 'light' | 'dark' | 'system'
  notifications: {
    email: boolean
    push: boolean
    newPosts: boolean
    comments: boolean
    system: boolean
  }
  dashboard: {
    postsPerPage: number
    defaultView: 'grid' | 'list'
    showStats: boolean
  }
}

// Authentication types
export interface LoginCredentials {
  email: string
  password: string
  remember?: boolean
}

export interface RegisterData {
  email: string
  name: string
  password: string
  confirmPassword: string
}

export interface ResetPasswordData {
  email: string
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// Session types
export interface UserSession {
  user: {
    id: string
    email: string
    name: string
    role: UserRole
    avatarUrl?: string
  }
  expires: string
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

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
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
