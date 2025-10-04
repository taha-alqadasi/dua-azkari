'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Mail, ArrowRight, CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'حدث خطأ أثناء معالجة الطلب')
        setIsLoading(false)
        return
      }

      setSuccess(true)
    } catch (error) {
      setError('حدث خطأ أثناء معالجة الطلب')
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-600">تم إرسال الرسالة!</CardTitle>
            <CardDescription>
              تحقق من بريدك الإلكتروني
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-sm text-blue-800">
                إذا كان البريد الإلكتروني <strong>{email}</strong> مسجلاً لدينا، ستصلك رسالة تحتوي على رابط لإعادة تعيين كلمة المرور.
              </p>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <p>• تحقق من صندوق الوارد في بريدك الإلكتروني</p>
              <p>• لا تنسَ التحقق من مجلد البريد العشوائي (Spam)</p>
              <p>• الرابط صالح لمدة ساعة واحدة فقط</p>
            </div>

            <Link href="/admin/login" className="block">
              <Button variant="outline" className="w-full">
                <ArrowRight className="ml-2 h-4 w-4" />
                العودة إلى تسجيل الدخول
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
            <Mail className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold">نسيت كلمة المرور؟</CardTitle>
          <CardDescription>
            أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
                disabled={isLoading}
                dir="ltr"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <Mail className="ml-2 h-4 w-4" />
                  إرسال رابط إعادة التعيين
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <Link href="/admin/login" className="text-sm text-primary hover:text-primary/90">
              <ArrowRight className="inline-block ml-1 h-4 w-4" />
              العودة إلى تسجيل الدخول
            </Link>
            
            <div className="text-sm text-gray-600">
              ليس لديك حساب؟{' '}
              <Link href="/admin/register" className="text-primary hover:text-primary/90 font-medium">
                إنشاء حساب جديد
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

