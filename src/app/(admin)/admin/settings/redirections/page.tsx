'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { 
  ArrowRight, 
  Plus, 
  Trash2, 
  Edit, 
  Save,
  X,
  Link as LinkIcon,
  Search,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'

interface Redirection {
  id: string
  fromPath: string
  toPath: string
  redirectType: 'PERMANENT_301' | 'TEMPORARY_302' | 'TEMPORARY_307' | 'PERMANENT_308'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface FormData {
  fromPath: string
  toPath: string
  redirectType: 'PERMANENT_301' | 'TEMPORARY_302' | 'TEMPORARY_307' | 'PERMANENT_308'
  isActive: boolean
}

const initialFormData: FormData = {
  fromPath: '',
  toPath: '',
  redirectType: 'PERMANENT_301',
  isActive: true
}

export default function RedirectionsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [redirections, setRedirections] = useState<Redirection[]>([])
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [searchQuery, setSearchQuery] = useState('')
  const [includeInactive, setIncludeInactive] = useState(false)

  useEffect(() => {
    fetchRedirections()
  }, [includeInactive])

  const fetchRedirections = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/redirections?includeInactive=${includeInactive}`)
      const result = await response.json()

      if (result.success) {
        setRedirections(result.data)
      } else {
        showMessage('error', result.error || 'فشل في جلب التحويلات')
      }
    } catch (error) {
      console.error('Error fetching redirections:', error)
      showMessage('error', 'فشل في جلب التحويلات')
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // التحقق من صحة المسارات قبل الإرسال
      let cleanedFromPath = formData.fromPath.trim()
      let cleanedToPath = formData.toPath.trim()

      // التأكد من أن fromPath يبدأ بـ /
      if (!cleanedFromPath.startsWith('/')) {
        cleanedFromPath = '/' + cleanedFromPath
      }

      // إزالة / الزائدة من النهاية
      if (cleanedFromPath.length > 1 && cleanedFromPath.endsWith('/')) {
        cleanedFromPath = cleanedFromPath.slice(0, -1)
      }

      // للمسار الجديد، نتأكد أنه يبدأ بـ / إذا لم يكن رابط خارجي
      if (!cleanedToPath.startsWith('http') && !cleanedToPath.startsWith('/')) {
        cleanedToPath = '/' + cleanedToPath
      }

      const cleanedData = {
        ...formData,
        fromPath: cleanedFromPath,
        toPath: cleanedToPath
      }

      const url = '/api/redirections'
      const method = editingId ? 'PUT' : 'POST'
      const body = editingId ? { ...cleanedData, id: editingId } : cleanedData

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      // التحقق من حالة الاستجابة أولاً
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Response error:', errorText)
        showMessage('error', `خطأ في الحفظ: ${response.status}`)
        return
      }

      // محاولة قراءة JSON
      const text = await response.text()
      const result = text ? JSON.parse(text) : { success: false, error: 'استجابة فارغة' }

      if (result.success) {
        showMessage('success', result.message || 'تم الحفظ بنجاح')
        await fetchRedirections()
        resetForm()
      } else {
        showMessage('error', result.error || 'فشل في الحفظ')
      }
    } catch (error) {
      console.error('Error saving redirection:', error)
      showMessage('error', `فشل في الحفظ: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (redirection: Redirection) => {
    setFormData({
      fromPath: redirection.fromPath,
      toPath: redirection.toPath,
      redirectType: redirection.redirectType,
      isActive: redirection.isActive
    })
    setEditingId(redirection.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا التحويل؟')) return

    try {
      const response = await fetch(`/api/redirections?id=${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        showMessage('success', 'تم حذف التحويل بنجاح')
        fetchRedirections()
      } else {
        showMessage('error', result.error || 'فشل في الحذف')
      }
    } catch (error) {
      console.error('Error deleting redirection:', error)
      showMessage('error', 'فشل في الحذف')
    }
  }

  const resetForm = () => {
    setFormData(initialFormData)
    setEditingId(null)
    setShowForm(false)
  }

  const getRedirectTypeLabel = (type: string) => {
    const labels = {
      'PERMANENT_301': '301 - دائم',
      'TEMPORARY_302': '302 - مؤقت',
      'TEMPORARY_307': '307 - مؤقت (يحافظ على الطريقة)',
      'PERMANENT_308': '308 - دائم (يحافظ على الطريقة)'
    }
    return labels[type as keyof typeof labels] || type
  }

  const getRedirectTypeColor = (type: string) => {
    const colors = {
      'PERMANENT_301': 'bg-blue-100 text-blue-800 border-blue-200',
      'TEMPORARY_302': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'TEMPORARY_307': 'bg-orange-100 text-orange-800 border-orange-200',
      'PERMANENT_308': 'bg-green-100 text-green-800 border-green-200'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const filteredRedirections = redirections.filter(r =>
    r.fromPath.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.toPath.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/settings">
            <Button variant="outline" size="icon">
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">إدارة التحويلات (Redirections)</h1>
            <p className="text-gray-600 mt-1">إعادة توجيه الروابط القديمة إلى روابط جديدة</p>
          </div>
        </div>
        <Button 
          onClick={() => {
            resetForm()
            setShowForm(!showForm)
          }}
          className="bg-gradient-to-r from-blue-600 to-cyan-600"
        >
          {showForm ? (
            <>
              <X className="h-4 w-4 ml-2" />
              إلغاء
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 ml-2" />
              إضافة تحويل جديد
            </>
          )}
        </Button>
      </div>

      {/* Message */}
      {message && (
        <Card className={`p-4 ${message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
            <p className={`${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
              {message.text}
            </p>
          </div>
        </Card>
      )}

      {/* Info Card */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-100">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-blue-600 shrink-0 mt-1" />
          <div className="space-y-2">
            <h3 className="font-bold text-gray-900">معلومات مهمة عن التحويلات:</h3>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li><strong>301 (Permanent):</strong> تحويل دائم - يخبر محركات البحث أن الصفحة انتقلت نهائياً</li>
              <li><strong>302 (Temporary):</strong> تحويل مؤقت - الصفحة الأصلية ستعود قريباً</li>
              <li><strong>307 (Temporary):</strong> تحويل مؤقت مع الحفاظ على نوع الطلب (POST/GET)</li>
              <li><strong>308 (Permanent):</strong> تحويل دائم مع الحفاظ على نوع الطلب</li>
              <li>التحويلات نشطة فوراً بعد الحفظ</li>
              <li>تأكد من صحة الروابط لتجنب حلقات التحويل المتكررة</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Form */}
      {showForm && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">
            {editingId ? 'تعديل التحويل' : 'إضافة تحويل جديد'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fromPath">المسار القديم (From Path) *</Label>
                <Input
                  id="fromPath"
                  type="text"
                  placeholder="/listen/5/atiha"
                  value={formData.fromPath}
                  onChange={(e) => setFormData({ ...formData, fromPath: e.target.value })}
                  required
                  className="mt-2"
                  dir="ltr"
                />
                <p className="text-xs text-red-600 font-bold mt-1">⚠️ يجب أن يبدأ بـ / - مثال: /listen/5/atiha</p>
                <p className="text-xs text-gray-500">سيتم تصحيح المسار تلقائياً عند الحفظ</p>
              </div>

              <div>
                <Label htmlFor="toPath">المسار الجديد (To Path) *</Label>
                <Input
                  id="toPath"
                  type="text"
                  placeholder="/ أو https://example.com"
                  value={formData.toPath}
                  onChange={(e) => setFormData({ ...formData, toPath: e.target.value })}
                  required
                  className="mt-2"
                  dir="ltr"
                />
                <p className="text-xs text-gray-500 mt-1">رابط داخلي (مثل: /) أو خارجي (مثل: https://example.com)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="redirectType">نوع التحويل *</Label>
                <select
                  id="redirectType"
                  value={formData.redirectType}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    redirectType: e.target.value as FormData['redirectType'] 
                  })}
                  className="w-full px-3 py-2 border border-input rounded-md text-sm mt-2"
                  required
                >
                  <option value="PERMANENT_301">301 - دائم (Permanent)</option>
                  <option value="TEMPORARY_302">302 - مؤقت (Temporary)</option>
                  <option value="TEMPORARY_307">307 - مؤقت (يحافظ على الطريقة)</option>
                  <option value="PERMANENT_308">308 - دائم (يحافظ على الطريقة)</option>
                </select>
              </div>

              <div>
                <Label htmlFor="isActive">الحالة</Label>
                <select
                  id="isActive"
                  value={formData.isActive ? 'true' : 'false'}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                  className="w-full px-3 py-2 border border-input rounded-md text-sm mt-2"
                >
                  <option value="true">نشط</option>
                  <option value="false">غير نشط</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={saving} className="bg-gradient-to-r from-blue-600 to-cyan-600">
                <Save className="h-4 w-4 ml-2" />
                {saving ? 'جاري الحفظ...' : editingId ? 'تحديث' : 'حفظ'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                إلغاء
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="بحث في المسارات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="includeInactive"
              checked={includeInactive}
              onChange={(e) => setIncludeInactive(e.target.checked)}
              className="w-4 h-4"
            />
            <Label htmlFor="includeInactive" className="cursor-pointer">
              عرض غير النشطة
            </Label>
          </div>
        </div>
      </Card>

      {/* Redirections List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">قائمة التحويلات ({filteredRedirections.length})</h2>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">جاري التحميل...</div>
        ) : filteredRedirections.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchQuery ? 'لا توجد نتائج للبحث' : 'لا توجد تحويلات. أضف تحويل جديد!'}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRedirections.map((redirection) => (
              <div
                key={redirection.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRedirectTypeColor(redirection.redirectType)}`}>
                        {getRedirectTypeLabel(redirection.redirectType)}
                      </span>
                      {!redirection.isActive && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                          غير نشط
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <code className="bg-gray-100 px-3 py-1 rounded border border-gray-200 font-mono">
                        {redirection.fromPath}
                      </code>
                      <LinkIcon className="h-4 w-4 text-gray-400" />
                      <code className="bg-blue-50 px-3 py-1 rounded border border-blue-200 font-mono text-blue-700">
                        {redirection.toPath}
                      </code>
                    </div>
                    <div className="text-xs text-gray-500">
                      تم الإنشاء: {new Date(redirection.createdAt).toLocaleDateString('ar-SA')}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(redirection)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(redirection.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Testing Section */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-100">
        <h3 className="font-bold text-gray-900 mb-3">اختبار التحويلات</h3>
        <p className="text-sm text-gray-700 mb-3">
          لاختبار التحويلات، يمكنك استخدام الأدوات التالية:
        </p>
        <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
          <li>افتح المسار القديم في المتصفح وتحقق من التحويل</li>
          <li>استخدم أدوات المطورين في المتصفح (F12) &gt; Network لرؤية نوع التحويل</li>
          <li>استخدم curl: <code className="bg-white px-2 py-1 rounded">curl -I https://yourdomain.com/old-path</code></li>
          <li>استخدم Google Search Console لرؤية التحويلات من وجهة نظر محركات البحث</li>
        </ul>
      </Card>
    </div>
  )
}

