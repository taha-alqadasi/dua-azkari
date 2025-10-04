import { UserRole } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: UserRole
      avatarUrl?: string
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: UserRole
    avatarUrl?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: UserRole
    avatarUrl?: string
  }
}