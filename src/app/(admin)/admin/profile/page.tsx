'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { 
  ArrowRight, 
  User, 
  Mail, 
  Shield, 
  Lock,
  Save,
  Eye,
  EyeOff
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { usePermissions } from '@/hooks/use-permissions'

export default function ProfilePage() {
  const { data: session } = useSession()
  const { user, loading: permissionsLoading } = usePermissions()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [stats, setStats] = useState({
    publishedPosts: 0,
    pages: 0,
    mediaFiles: 0
  })
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name,
        email: user.email
      }))
      fetchUserStats()
      setLoading(false)
    }
  }, [user])

  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/users/me/stats')
      const result = await response.json()
      
      if (result.success) {
        setStats(result.data)
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const updateData: any = {
        name: formData.name,
        email: formData.email
      }

      // إذا أراد تغيير كلمة المرور
      if (formData.newPassword) {
        if (!formData.oldPassword) {
          setMessage({ type: 'error', text: 'يجب إدخال كلمة المرور القديمة' })
          setSaving(false)
          return
        }
        
        if (formData.newPassword.length < 6) {
          setMessage({ type: 'error', text: 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل' })
          setSaving(false)
          return
        }
        
        if (formData.newPassword !== formData.confirmPassword) {
          setMessage({ type: 'error', text: 'كلمات المرور غير متطابقة' })
          setSaving(false)
          return
        }
        
        updateData.oldPassword = formData.oldPassword
        updateData.newPassword = formData.newPassword
      }

      const response = await fetch(`/api/users/me/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ type: 'success', text: 'تم تحديث الملف الشخصي بنجاح' })
        setFormData(prev => ({
          ...prev,
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        }))
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: result.error || 'فشل التحديث' })
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage({ type: 'error', text: 'حدث خطأ أثناء التحديث' })
    } finally {
      setSaving(false)
    }
  }

  if (loading || permissionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin">
          <Button variant="outline" size="icon">
            <ArrowRight className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">الملف الشخصي</h1>
          <p className="text-gray-600 mt-1">إدارة معلوماتك الشخصية</p>
        </div>
      </div>

      {message && (
        <Card className={`p-4 ${message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <p className={`${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
            {message.text}
          </p>
        </Card>
      )}

      {/* Profile Info Card */}
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-3xl">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
            <p className="text-gray-600">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                {user?.role === 'ADMIN' ? 'أدمن' : user?.role === 'EDITOR' ? 'محرر' : 'مشاهد'}
              </span>
              {user?.customRole && (
                <span className="text-sm text-gray-600">
                  ({user.customRole.name})
                </span>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name">
                <User className="h-4 w-4 inline ml-2" />
                الاسم الكامل
              </Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="اسمك الكامل"
              />
            </div>

            <div>
              <Label htmlFor="email">
                <Mail className="h-4 w-4 inline ml-2" />
                البريد الإلكتروني
              </Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="example@domain.com"
                dir="ltr"
              />
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              <Lock className="h-5 w-5 inline ml-2" />
              تغيير كلمة المرور
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              اترك الحقول فارغة إذا لم ترد تغيير كلمة المرور
            </p>

            <div className="space-y-4">
              {/* حقل كلمة المرور القديمة */}
              <div>
                <Label htmlFor="oldPassword">
                  <Lock className="h-4 w-4 inline ml-2" />
                  كلمة المرور القديمة
                </Label>
                <div className="relative">
                  <Input
                    id="oldPassword"
                    type={showOldPassword ? 'text' : 'password'}
                    value={formData.oldPassword}
                    onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
                    placeholder="أدخل كلمة المرور الحالية"
                    dir="ltr"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="relative">
                <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    placeholder="كلمة المرور الجديدة"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="أعد إدخال كلمة المرور"
                    dir="ltr"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={saving}
              className="bg-gradient-to-r from-primary to-cyan-600"
            >
              <Save className="h-4 w-4 ml-2" />
              {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFormData({
                  name: user?.name || '',
                  email: user?.email || '',
                  oldPassword: '',
                  newPassword: '',
                  confirmPassword: ''
                })
                setMessage(null)
              }}
            >
              إلغاء
            </Button>
          </div>
        </form>
      </Card>

      {/* Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 text-center hover:shadow-lg transition-all duration-300">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mx-auto mb-3 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            {stats.publishedPosts}
          </div>
          <p className="text-gray-600 font-medium">مقالات منشورة</p>
        </Card>

        <Card className="p-6 text-center hover:shadow-lg transition-all duration-300">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-3 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            {stats.pages}
          </div>
          <p className="text-gray-600 font-medium">صفحات</p>
        </Card>

        <Card className="p-6 text-center hover:shadow-lg transition-all duration-300">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mx-auto mb-3 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            {stats.mediaFiles}
          </div>
          <p className="text-gray-600 font-medium">ملفات وسائط</p>
        </Card>
      </div>

      {/* Permissions Card */}
      {user?.customRole && (
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            <Shield className="h-5 w-5 inline ml-2" />
            الصلاحيات المخصصة
          </h3>
          <div className="flex flex-wrap gap-2">
            {user.customRole.permissions.map((perm) => (
              <span 
                key={perm.id} 
                className="px-3 py-1 text-sm bg-primary/10 text-primary rounded-full"
              >
                {perm.description || `${perm.action} - ${perm.resource}`}
              </span>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

