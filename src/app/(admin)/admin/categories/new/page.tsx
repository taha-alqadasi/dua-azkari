'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowRight, Save, Loader2, Info } from 'lucide-react'
import Link from 'next/link'
import { slugify } from '@/lib/slugify'

interface CategoryFormData {
  nameAr: string
  nameEn: string
  slug: string
  description: string
  color: string
  icon: string
  isActive: boolean
  sortOrder: number
}

export default function CategoryFormPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const categoryId = searchParams.get('id')
  const isEdit = !!categoryId

  const [formData, setFormData] = useState<CategoryFormData>({
    nameAr: '',
    nameEn: '',
    slug: '',
    description: '',
    color: '#1e9e94',
    icon: '',
    isActive: true,
    sortOrder: 0
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState('')
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

  // جلب بيانات التصنيف للتعديل أو حساب رقم الترتيب التلقائي
  useEffect(() => {
    if (isEdit && categoryId) {
      fetchCategory()
    } else {
      // حساب رقم الترتيب التلقائي للتصنيف الجديد
      fetchNextSortOrder()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, isEdit])

  // دالة لحساب رقم الترتيب التالي تلقائياً
  const fetchNextSortOrder = async () => {
    try {
      const response = await fetch('/api/categories?limit=1&sortBy=sortOrder&sortOrder=desc')
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data && result.data.categories && result.data.categories.length > 0) {
          const highestSortOrder = result.data.categories[0].sortOrder || 0
          setFormData(prev => ({
            ...prev,
            sortOrder: highestSortOrder + 1
          }))
        }
      }
    } catch (err) {
      console.error('خطأ في حساب رقم الترتيب:', err)
    }
  }

  const fetchCategory = async () => {
    setIsFetching(true)
    try {
      const response = await fetch(`/api/categories/${categoryId}`)
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          setFormData({
            nameAr: result.data.nameAr || '',
            nameEn: result.data.nameEn || '',
            slug: result.data.slug || '',
            description: result.data.description || '',
            color: result.data.color || '#1e9e94',
            icon: result.data.icon || '',
            isActive: result.data.isActive ?? true,
            sortOrder: result.data.sortOrder || 0
          })
          // في وضع التعديل، اعتبر الـ slug معدل يدوياً
          setSlugManuallyEdited(true)
        }
      } else {
        setError('فشل في جلب بيانات التصنيف')
      }
    } catch (err) {
      console.error('خطأ في جلب التصنيف:', err)
      setError('حدث خطأ أثناء جلب البيانات')
    } finally {
      setIsFetching(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined

    // إذا كان التعديل على الـ slug نفسه، علّم أنه تم تعديله يدوياً
    if (name === 'slug') {
      setSlugManuallyEdited(true)
      setFormData(prev => ({ ...prev, slug: value }))
      return
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // توليد slug تلقائياً من الاسم العربي (إذا لم يتم تعديله يدوياً)
    if (name === 'nameAr' && !slugManuallyEdited) {
      const generatedSlug = slugify(value)
      setFormData(prev => ({ ...prev, slug: generatedSlug }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const url = isEdit ? `/api/categories/${categoryId}` : '/api/categories'
      const method = isEdit ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        router.push('/admin/categories')
      } else {
        setError(result.error || 'فشل في حفظ التصنيف')
      }
    } catch (err) {
      console.error('خطأ في حفظ التصنيف:', err)
      setError('حدث خطأ أثناء حفظ البيانات')
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}
          </h1>
          <p className="text-gray-500 mt-1">
            {isEdit ? 'تعديل بيانات التصنيف' : 'إنشاء تصنيف جديد لتنظيم المحتوى'}
          </p>
        </div>
        <Link href="/admin/categories">
          <Button variant="outline">
            <ArrowRight className="h-4 w-4 ml-2" />
            العودة للقائمة
          </Button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>بيانات التصنيف</CardTitle>
            <CardDescription>املأ المعلومات الأساسية للتصنيف</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* الاسم العربي */}
            <div className="space-y-2">
              <Label htmlFor="nameAr">الاسم بالعربية *</Label>
              <Input
                id="nameAr"
                name="nameAr"
                value={formData.nameAr}
                onChange={handleInputChange}
                required
                placeholder="أدخل اسم التصنيف بالعربية"
              />
            </div>

            {/* الاسم الإنجليزي */}
            <div className="space-y-2">
              <Label htmlFor="nameEn">الاسم بالإنجليزية</Label>
              <Input
                id="nameEn"
                name="nameEn"
                value={formData.nameEn}
                onChange={handleInputChange}
                placeholder="Category Name in English"
                dir="ltr"
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (رابط URL) *</Label>
              <Input
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                required
                placeholder="أدعية-يومية أو daily-duas"
                dir="ltr"
              />
              <div className="flex items-start gap-2 text-sm text-gray-500">
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p>
                    {slugManuallyEdited 
                      ? 'تم تعديل الرابط يدوياً. يمكنك استخدام العربية أو الإنجليزية.'
                      : 'يتم توليد الرابط تلقائياً من الاسم العربي. يمكنك تعديله يدوياً.'
                    }
                  </p>
                  <p className="text-xs mt-1">
                    مثال: أدعية يومية → أدعية-يومية  |  Daily Duas → daily-duas
                  </p>
                </div>
              </div>
            </div>

            {/* الوصف */}
            <div className="space-y-2">
              <Label htmlFor="description">الوصف</Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="وصف مختصر عن التصنيف"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* اللون */}
              <div className="space-y-2">
                <Label htmlFor="color">اللون</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    id="color"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    placeholder="#1e9e94"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* الأيقونة */}
              <div className="space-y-2">
                <Label htmlFor="icon">رمز الأيقونة (اختياري)</Label>
                <Input
                  id="icon"
                  name="icon"
                  value={formData.icon}
                  onChange={handleInputChange}
                  placeholder="📖"
                />
              </div>

              {/* الترتيب */}
              <div className="space-y-2">
                <Label htmlFor="sortOrder">الترتيب</Label>
                <Input
                  type="number"
                  id="sortOrder"
                  name="sortOrder"
                  value={formData.sortOrder}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>

              {/* الحالة */}
              <div className="space-y-2">
                <Label htmlFor="isActive" className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-4 h-4"
                  />
                  <span>التصنيف نشط</span>
                </Label>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Link href="/admin/categories">
                <Button type="button" variant="outline">
                  إلغاء
                </Button>
              </Link>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 ml-2" />
                    {isEdit ? 'حفظ التعديلات' : 'إضافة التصنيف'}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

