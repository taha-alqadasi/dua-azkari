import { useSession, signIn, signOut } from 'next-auth/react'
import { UserSession, LoginCredentials, Permission, ROLE_PERMISSIONS } from '@/types'

export function useAuth() {
  const { data: session, status } = useSession()

  const user = session?.user as UserSession['user'] | undefined

  const login = async (credentials: LoginCredentials) => {
    const result = await signIn('credentials', {
      email: credentials.email,
      password: credentials.password,
      redirect: false
    })

    return result
  }

  const logout = async () => {
    await signOut({ redirect: false })
  }

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false
    
    const userPermissions = ROLE_PERMISSIONS[user.role] || []
    return userPermissions.includes(permission)
  }

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission))
  }

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(permission => hasPermission(permission))
  }

  const isAdmin = (): boolean => {
    return user?.role === 'ADMIN'
  }

  const isEditor = (): boolean => {
    return user?.role === 'EDITOR' || isAdmin()
  }

  const canManagePosts = (): boolean => {
    return hasPermission('posts.create') && hasPermission('posts.update')
  }

  const canManageUsers = (): boolean => {
    return hasPermission('users.create') && hasPermission('users.update')
  }

  const canManageSettings = (): boolean => {
    return hasPermission('settings.update')
  }

  return {
    user,
    session,
    status,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    isUnauthenticated: status === 'unauthenticated',
    login,
    logout,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    isEditor,
    canManagePosts,
    canManageUsers,
    canManageSettings
  }
}