'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

function VerifyEmailContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('رمز التحقق غير موجود')
      return
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`)
        const data = await response.json()

        if (response.ok) {
          setStatus('success')
          setMessage(data.message || 'تم تفعيل حسابك بنجاح!')
          
          // التوجيه إلى صفحة تسجيل الدخول بعد 3 ثوان
          setTimeout(() => {
            router.push('/admin/login')
          }, 3000)
        } else {
          setStatus('error')
          setMessage(data.error || 'فشل التحقق من البريد الإلكتروني')
        }
      } catch (error) {
        setStatus('error')
        setMessage('حدث خطأ أثناء التحقق من البريد الإلكتروني')
      }
    }

    verifyEmail()
  }, [token, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {status === 'loading' && (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 mb-4">
                <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
              </div>
              <CardTitle className="text-2xl font-bold">جاري التحقق...</CardTitle>
              <CardDescription>
                الرجاء الانتظار بينما نتحقق من بريدك الإلكتروني
              </CardDescription>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-green-600">تم بنجاح!</CardTitle>
              <CardDescription>
                {message}
              </CardDescription>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
                <XCircle className="h-10 w-10 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-red-600">فشل التحقق</CardTitle>
              <CardDescription>
                {message}
              </CardDescription>
            </>
          )}
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          {status === 'success' && (
            <>
              <p className="text-sm text-gray-600">
                سيتم تحويلك إلى صفحة تسجيل الدخول...
              </p>
              <Link href="/admin/login">
                <Button className="w-full">
                  تسجيل الدخول الآن
                </Button>
              </Link>
            </>
          )}
          
          {status === 'error' && (
            <>
              <p className="text-sm text-gray-600 mb-4">
                يمكنك المحاولة مرة أخرى أو التواصل مع الدعم
              </p>
              <div className="space-y-2">
                <Link href="/admin/register">
                  <Button variant="outline" className="w-full">
                    العودة إلى التسجيل
                  </Button>
                </Link>
                <Link href="/admin/login">
                  <Button variant="ghost" className="w-full">
                    تسجيل الدخول
                  </Button>
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}

