'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import Link from 'next/link'

interface ErrorPageProps {
  error?: Error & { digest?: string }
  reset?: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Admin Error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 mb-4">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-600">حدث خطأ</CardTitle>
          <CardDescription>
            عذراً، حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              <p className="font-medium">تفاصيل الخطأ:</p>
              <p className="mt-1">{error.message}</p>
            </div>
          )}
          
          <div className="flex flex-col gap-3">
            {reset && (
              <Button onClick={reset} className="w-full">
                <RefreshCw className="ml-2 h-4 w-4" />
                المحاولة مرة أخرى
              </Button>
            )}
            
            <Link href="/admin">
              <Button variant="outline" className="w-full">
                <Home className="ml-2 h-4 w-4" />
                العودة للوحة التحكم
              </Button>
            </Link>
            
            <Link href="/">
              <Button variant="ghost" className="w-full">
                العودة للصفحة الرئيسية
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
