import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/error',
  },
  trustHost: true,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('يرجى إدخال البريد الإلكتروني وكلمة المرور')
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string
          }
        })

        if (!user) {
          throw new Error('بيانات الدخول غير صحيحة')
        }

        // التحقق من كلمة المرور أولاً
        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )

        if (!isPasswordValid) {
          throw new Error('بيانات الدخول غير صحيحة')
        }

        // التحقق من تفعيل البريد الإلكتروني
        if (!user.emailVerified) {
          throw new Error('يرجى تفعيل حسابك عبر الرابط المرسل إلى بريدك الإلكتروني')
        }

        // التحقق من نشاط الحساب
        if (!user.isActive) {
          throw new Error('حسابك غير نشط. يرجى التواصل مع الإدارة')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.avatarUrl,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
        token.avatarUrl = user.avatarUrl
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
        session.user.avatarUrl = token.avatarUrl as string | undefined
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Redirect to admin dashboard after login
      if (url.startsWith('/admin/login')) {
        return `${baseUrl}/admin`
      }
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  },
  events: {
    async signIn({ user }) {
      // Update last login time
      if (user.id) {
        await prisma.user.update({
          where: { id: user.id },
          data: { updatedAt: new Date() }
        })
      }
    }
  }
})
