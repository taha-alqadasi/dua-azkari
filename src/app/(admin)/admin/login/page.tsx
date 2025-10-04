'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const callbackUrl = '/admin'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('بيانات الدخول غير صحيحة')
        setIsLoading(false)
      } else if (result?.ok) {
        // استخدام window.location لإعادة تحميل الصفحة وتحديث الـ session
        window.location.href = callbackUrl
      }
    } catch {
      setError('حدث خطأ أثناء تسجيل الدخول')
      setIsLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      direction: 'rtl',
      fontFamily: 'Cairo, Tajawal, sans-serif'
    }}>
      <Card style={{
        width: '100%',
        maxWidth: '420px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '24px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        <CardHeader style={{
          textAlign: 'center',
          padding: '40px 30px 20px',
          background: 'linear-gradient(135deg, #1e9e94 0%, #16a085 100%)',
          color: 'white'
        }}>
          <div style={{
            margin: '0 auto 20px',
            width: '80px',
            height: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255, 255, 255, 0.3)'
          }}>
            <span style={{ fontSize: '32px', fontWeight: 'bold' }}>د</span>
          </div>
          <CardTitle style={{ 
            fontSize: '28px', 
            fontWeight: 'bold',
            margin: '0 0 8px 0',
            color: 'white'
          }}>
            دعاء أذكاري
          </CardTitle>
          <CardDescription style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '16px',
            margin: 0
          }}>
            تسجيل الدخول إلى لوحة التحكم
          </CardDescription>
        </CardHeader>
        <CardContent style={{ padding: '30px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {error && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                padding: '12px 16px',
                borderRadius: '12px',
                fontSize: '14px',
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Label htmlFor="email" style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#374151',
                textAlign: 'right'
              }}>
                البريد الإلكتروني
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="البريد الإلكتروني"
                required
                disabled={isLoading}
                dir="ltr"
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb',
                  fontSize: '16px',
                  transition: 'all 0.2s ease',
                  backgroundColor: isLoading ? '#f9fafb' : 'white'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1e9e94'
                  e.target.style.boxShadow = '0 0 0 3px rgba(30, 158, 148, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Label htmlFor="password" style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#374151',
                textAlign: 'right'
              }}>
                كلمة المرور
              </Label>
              <div style={{ position: 'relative' }}>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="كلمة المرور"
                  required
                  disabled={isLoading}
                  dir="ltr"
                  style={{
                    padding: '12px 16px',
                    paddingLeft: '48px',
                    borderRadius: '12px',
                    border: '2px solid #e5e7eb',
                    fontSize: '16px',
                    transition: 'all 0.2s ease',
                    backgroundColor: isLoading ? '#f9fafb' : 'white'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#1e9e94'
                    e.target.style.boxShadow = '0 0 0 3px rgba(30, 158, 148, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb'
                    e.target.style.boxShadow = 'none'
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  style={{
                    position: 'absolute',
                    left: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '32px',
                    height: '32px',
                    color: '#6b7280'
                  }}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                background: isLoading 
                  ? '#9ca3af' 
                  : 'linear-gradient(135deg, #1e9e94 0%, #16a085 100%)',
                color: 'white',
                border: 'none',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: isLoading ? 'none' : '0 4px 12px rgba(30, 158, 148, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(30, 158, 148, 0.4)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(30, 158, 148, 0.3)'
                }
              }}
            >
              {isLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  جاري تسجيل الدخول...
                </div>
              ) : (
                'تسجيل الدخول'
              )}
            </Button>
          </form>

          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Register Link */}
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>
                ليس لديك حساب؟{' '}
                <Link 
                  href="/admin/register" 
                  style={{ 
                    color: '#1e9e94', 
                    fontWeight: '600', 
                    textDecoration: 'none',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#16a085'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#1e9e94'}
                >
                  إنشاء حساب جديد
                </Link>
              </p>
            </div>

            {/* Forgot Password Link */}
            <div style={{ textAlign: 'center' }}>
              <Link 
                href="/admin/forgot-password" 
                style={{ 
                  fontSize: '14px', 
                  color: '#6b7280',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#1e9e94'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
              >
                نسيت كلمة المرور؟
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
