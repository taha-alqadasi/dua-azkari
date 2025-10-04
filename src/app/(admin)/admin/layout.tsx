'use client'

import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { useAuth } from '@/hooks/use-auth'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { PageLoading } from '@/components/shared/Loading'
import { SessionProvider } from '@/components/providers/SessionProvider'

interface AdminLayoutProps {
  children: React.ReactNode
}

function AdminLayoutContent({ children }: AdminLayoutProps) {
  const { isLoading, isAuthenticated, user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // صفحات لا تحتاج authentication
  const publicAdminPages = [
    '/admin/login', 
    '/admin/register', 
    '/admin/forgot-password', 
    '/admin/reset-password',
    '/admin/verify-email',
    '/admin/error', 
    '/admin/unauthorized'
  ]
  const isPublicPage = publicAdminPages.includes(pathname)

  useEffect(() => {
    if (!isPublicPage && !isLoading && !isAuthenticated) {
      router.push('/admin/login')
    }
  }, [isPublicPage, isLoading, isAuthenticated, router])

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // إذا كانت صفحة عامة، اعرضها مباشرة
  if (isPublicPage) {
    return <>{children}</>
  }

  if (isLoading) {
    return <PageLoading />
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="flex h-screen flex-col lg:flex-row" dir="rtl" style={{ backgroundColor: '#ffffff' }}>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              animation: 'fadeIn 0.2s ease-out'
            }}
          />
          
          {/* Mobile Sidebar */}
          <div 
            className="fixed inset-y-0 right-0 z-50 w-80 max-w-[85vw] lg:hidden"
            style={{
              animation: 'slideInRight 0.3s ease-out'
            }}
          >
            <AdminSidebar onClose={() => setMobileMenuOpen(false)} />
          </div>
        </>
      )}
      
      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader onMenuClick={() => setMobileMenuOpen(true)} />
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6 lg:p-8" style={{ backgroundColor: '#f9fafb' }}>
          <div className="mx-auto max-w-full">
            {children}
          </div>
        </main>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <SessionProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </SessionProvider>
  )
}
