'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowRight, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface TagFormData {
  nameAr: string
  nameEn: string
  slug: string
  description: string
  color: string
  isActive: boolean
}

export default function TagEditPage() {
  const router = useRouter()
  const params = useParams()
  const tagId = params.id as string

  const [formData, setFormData] = useState<TagFormData>({
    nameAr: '',
    nameEn: '',
    slug: '',
    description: '',
    color: '#3b82f6',
    isActive: true
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [error, setError] = useState('')

  // جلب بيانات الوسم
  useEffect(() => {
    fetchTag()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagId])

  const fetchTag = async () => {
    setIsFetching(true)
    try {
      const response = await fetch(`/api/tags/${tagId}`)
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          setFormData({
            nameAr: result.data.nameAr || '',
            nameEn: result.data.nameEn || '',
            slug: result.data.slug || '',
            description: result.data.description || '',
            color: result.data.color || '#3b82f6',
            isActive: result.data.isActive ?? true
          })
        }
      } else {
        setError('فشل في جلب بيانات الوسم')
      }
    } catch (err) {
      console.error('خطأ في جلب الوسم:', err)
      setError('حدث خطأ أثناء جلب البيانات')
    } finally {
      setIsFetching(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch(`/api/tags/${tagId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        router.push('/admin/tags')
      } else {
        setError(result.error || 'فشل في حفظ الوسم')
      }
    } catch (err) {
      console.error('خطأ في حفظ الوسم:', err)
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
          <h1 className="text-3xl font-bold text-gray-900">تعديل الوسم</h1>
          <p className="text-gray-500 mt-1">تعديل بيانات الوسم</p>
        </div>
        <Link href="/admin/tags">
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
            <CardTitle>بيانات الوسم</CardTitle>
            <CardDescription>عدّل المعلومات الأساسية للوسم</CardDescription>
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
                placeholder="أدخل اسم الوسم بالعربية"
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
                placeholder="Tag Name in English"
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
                placeholder="tag-slug"
                dir="ltr"
              />
              <p className="text-sm text-gray-500">
                سيتم استخدامه في رابط URL (حروف إنجليزية وأرقام وشرطة فقط)
              </p>
            </div>

            {/* الوصف */}
            <div className="space-y-2">
              <Label htmlFor="description">الوصف</Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="وصف مختصر عن الوسم"
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
                    placeholder="#3b82f6"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* الحالة */}
              <div className="space-y-2 flex items-end">
                <Label htmlFor="isActive" className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-4 h-4"
                  />
                  <span>الوسم نشط</span>
                </Label>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Link href="/admin/tags">
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
                    حفظ التعديلات
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

