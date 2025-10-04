'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const router = useRouter()

  const validatePassword = (pass: string): { valid: boolean; message?: string } => {
    if (pass.length < 8) {
      return { valid: false, message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' }
    }
    if (!/[A-Z]/.test(pass)) {
      return { valid: false, message: 'كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل' }
    }
    if (!/[a-z]/.test(pass)) {
      return { valid: false, message: 'كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل' }
    }
    if (!/[0-9]/.test(pass)) {
      return { valid: false, message: 'كلمة المرور يجب أن تحتوي على رقم واحد على الأقل' }
    }
    return { valid: true }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Validation
      if (!name.trim()) {
        setError('الاسم مطلوب')
        setIsLoading(false)
        return
      }

      if (!email.trim()) {
        setError('البريد الإلكتروني مطلوب')
        setIsLoading(false)
        return
      }

      const passwordValidation = validatePassword(password)
      if (!passwordValidation.valid) {
        setError(passwordValidation.message || 'كلمة المرور غير صالحة')
        setIsLoading(false)
        return
      }

      if (password !== confirmPassword) {
        setError('كلمات المرور غير متطابقة')
        setIsLoading(false)
        return
      }

      // Register request
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'حدث خطأ أثناء إنشاء الحساب')
        setIsLoading(false)
        return
      }

      // Success
      setSuccess(true)
      
      // Redirect after 3 seconds
      setTimeout(() => {
        router.push('/admin/login')
      }, 3000)
    } catch (error) {
      setError('حدث خطأ أثناء إنشاء الحساب')
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
            <CardTitle className="text-2xl font-bold text-green-600">تم إنشاء الحساب بنجاح!</CardTitle>
            <CardDescription>
              تم إرسال رسالة تأكيد إلى بريدك الإلكتروني
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              يرجى التحقق من بريدك الإلكتروني لتفعيل حسابك.
            </p>
            <p className="text-sm text-gray-500">
              سيتم تحويلك إلى صفحة تسجيل الدخول...
            </p>
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
            <span className="text-xl font-bold">د</span>
          </div>
          <CardTitle className="text-2xl font-bold">دعاء أذكاري</CardTitle>
          <CardDescription>
            إنشاء حساب جديد
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
              <Label htmlFor="name">الاسم الكامل</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="محمد أحمد"
                required
                disabled={isLoading}
              />
            </div>

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

            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  dir="ltr"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                يجب أن تحتوي على 8 أحرف على الأقل، وتتضمن حرف كبير وصغير ورقم
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  dir="ltr"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري إنشاء الحساب...
                </>
              ) : (
                'إنشاء حساب'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              لديك حساب بالفعل؟{' '}
              <Link href="/admin/login" className="text-primary hover:text-primary/90 font-medium">
                تسجيل الدخول
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

