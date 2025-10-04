'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Home, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'

export default function UnauthorizedPage() {
  const { logout } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 text-yellow-600 mb-4">
            <Shield className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold text-yellow-600">غير مصرح</CardTitle>
          <CardDescription>
            عذراً، ليس لديك صلاحية للوصول إلى هذه الصفحة.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md text-sm">
            <p>
              تحتاج إلى صلاحيات إدارية أو محرر للوصول إلى لوحة التحكم.
              يرجى التواصل مع المدير للحصول على الصلاحيات المطلوبة.
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <Link href="/">
              <Button className="w-full">
                <Home className="ml-2 h-4 w-4" />
                العودة للصفحة الرئيسية
              </Button>
            </Link>
            
            <Button variant="outline" onClick={logout} className="w-full">
              <LogOut className="ml-2 h-4 w-4" />
              تسجيل الخروج
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
