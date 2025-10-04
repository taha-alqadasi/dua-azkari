import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Cache للتحويلات لتقليل استعلامات قاعدة البيانات
let redirectsCache: Array<{ fromPath: string; toPath: string; redirectType: string }> = []
let lastFetch = 0
const CACHE_DURATION = 60000 // 60 ثانية

export default auth(async (req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth
  const user = req.auth?.user

  // ============= Redirections System =============
  // تطبيق التحويلات الديناميكية من قاعدة البيانات
  // استثناء المسارات الإدارية و API والملفات الثابتة
  const isAdminPath = pathname.startsWith('/admin')
  const isApiPath = pathname.startsWith('/api')
  const isStaticFile = /\.(jpg|jpeg|png|gif|svg|webp|ico|css|js|woff|woff2|ttf)$/.test(pathname)
  
  if (!isAdminPath && !isApiPath && !isStaticFile) {
    try {
      // تحديث الكاش إذا انتهت صلاحيته
      const now = Date.now()
      if (now - lastFetch > CACHE_DURATION) {
        redirectsCache = await prisma.redirection.findMany({
          where: { isActive: true },
          select: { fromPath: true, toPath: true, redirectType: true }
        })
        lastFetch = now
      }

      // البحث عن تحويل مطابق
      const redirect = redirectsCache.find(r => r.fromPath === pathname)
      
      if (redirect) {
        const { toPath, redirectType } = redirect
        
        // تحديد نوع التحويل
        const isPermanent = redirectType === 'PERMANENT_301' || redirectType === 'PERMANENT_308'
        
        // إنشاء URL للتحويل (داخلي أو خارجي)
        const destinationUrl = toPath.startsWith('http') 
          ? toPath 
          : new URL(toPath, req.url)
        
        return NextResponse.redirect(destinationUrl, {
          status: isPermanent ? 301 : 302
        })
      }
    } catch (error) {
      console.error('[Middleware] Error processing redirections:', error)
      // في حالة الخطأ، نكمل معالجة الطلب بشكل طبيعي
    }
  }

  // ============= Authentication & Authorization =============
  // Public auth routes (no authentication required)
  const publicAuthRoutes = [
    '/admin/login',
    '/admin/register',
    '/admin/forgot-password',
    '/admin/reset-password',
    '/admin/verify-email',
    '/admin/error'
  ]

  const isPublicAuthRoute = publicAuthRoutes.some(route => pathname === route)

  // Admin routes that require authentication
  const isAdminRoute = pathname.startsWith('/admin') && !isPublicAuthRoute

  // API routes that require authentication
  const isProtectedApiRoute = pathname.startsWith('/api') && !pathname.startsWith('/api/auth')

  // Redirect to login if accessing protected routes without authentication
  if ((isAdminRoute || isProtectedApiRoute) && !isLoggedIn) {
    const loginUrl = new URL('/admin/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users away from auth pages
  if (isPublicAuthRoute && isLoggedIn && pathname !== '/admin/verify-email') {
    return NextResponse.redirect(new URL('/admin', req.url))
  }

  // Check role-based access for admin routes
  if (isAdminRoute && isLoggedIn) {
    const userRole = user?.role
    
    // Only allow ADMIN and EDITOR roles to access admin panel
    if (!userRole || (userRole !== 'ADMIN' && userRole !== 'EDITOR')) {
      return NextResponse.redirect(new URL('/admin/unauthorized', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
