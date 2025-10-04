'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { ArrowRight, Save, RotateCcw, Upload, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import { GeneralSettings, generalSettingsSchema } from '@/types/settings.types'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { MediaUploadModal } from '@/components/shared/MediaUploadModal'

export default function GeneralSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false)
  const [mediaPickerField, setMediaPickerField] = useState<'logoUrl' | 'faviconUrl' | 'defaultImageUrl' | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      siteName: '',
      siteTitle: '',
      siteDescription: '',
      charset: 'UTF-8',
      titleSeparator: '-' as const,
      logoUrl: '',
      faviconUrl: '',
      defaultImageUrl: '',
      copyrightText: 'جميع الحقوق محفوظة © 2025',
      madeWithLoveText: 'صُنع بـ ❤️ لخدمة الإسلام'
    }
  })

  // فتح Media Picker
  const openMediaPicker = (field: 'logoUrl' | 'faviconUrl' | 'defaultImageUrl') => {
    setMediaPickerField(field)
    setMediaPickerOpen(true)
  }

  // اختيار الوسائط من Media Upload Modal
  const handleMediaUploadComplete = (fileUrl: string) => {
    if (mediaPickerField) {
      setValue(mediaPickerField, fileUrl, { shouldValidate: true })
    }
    setMediaPickerOpen(false)
    setMediaPickerField(null)
  }

  // جلب الإعدادات الحالية
  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/settings?group=general')
      const result = await response.json()

      if (result.success) {
        reset(result.data)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      setMessage({ type: 'error', text: 'فشل في جلب الإعدادات' })
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: any) => {
    setSaving(true)
    setMessage(null)

    try {
      // التحقق من صحة البيانات
      const validatedData = generalSettingsSchema.parse(data)
      
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          group: 'general',
          data: validatedData
        })
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ type: 'success', text: 'تم حفظ الإعدادات بنجاح' })
        
        // إعادة تحميل الصفحة بعد ثانيتين لتطبيق التغييرات (خاصة الفافيكون)
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        setMessage({ type: 'error', text: result.error || 'فشل في حفظ الإعدادات' })
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      setMessage({ type: 'error', text: 'فشل في حفظ الإعدادات' })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    if (!confirm('هل أنت متأكد من إعادة تعيين الإعدادات للقيم الافتراضية؟')) {
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          group: 'general'
        })
      })

      const result = await response.json()

      if (result.success) {
        reset(result.data)
        setMessage({ type: 'success', text: 'تم إعادة تعيين الإعدادات بنجاح' })
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: result.error || 'فشل في إعادة تعيين الإعدادات' })
      }
    } catch (error) {
      console.error('Error resetting settings:', error)
      setMessage({ type: 'error', text: 'فشل في إعادة تعيين الإعدادات' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل الإعدادات...</p>
        </div>
      </div>
    )
  }

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
            <h1 className="text-3xl font-bold text-gray-900">
              الإعدادات الأساسية
            </h1>
            <p className="text-gray-600 mt-1">
              إعدادات الموقع العامة مثل الاسم، الشعار، والأيقونة
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={saving}
          >
            <RotateCcw className="h-4 w-4 ml-2" />
            إعادة التعيين
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={saving}
            className="bg-gradient-to-r from-emerald-600 to-teal-600"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 ml-2" />
                حفظ التغييرات
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <Card className={`p-4 ${message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <p className={`${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
            {message.text}
          </p>
        </Card>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* معلومات الموقع */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b">
            معلومات الموقع
          </h2>
          <div className="space-y-5">
            {/* اسم الموقع */}
            <div>
              <Label htmlFor="siteName" className="required">
                اسم الموقع
              </Label>
              <Input
                id="siteName"
                {...register('siteName')}
                placeholder="مثال: دعاء أذكاري"
                className="mt-2"
              />
              {errors.siteName && (
                <p className="text-sm text-red-600 mt-1">{errors.siteName.message}</p>
              )}
            </div>

            {/* عنوان الموقع */}
            <div>
              <Label htmlFor="siteTitle" className="required">
                عنوان الموقع (يظهر في نتائج محركات البحث)
              </Label>
              <Input
                id="siteTitle"
                {...register('siteTitle')}
                placeholder="مثال: دعاء أذكاري - منصة الأدعية والأذكار الإسلامية"
                className="mt-2"
              />
              {errors.siteTitle && (
                <p className="text-sm text-red-600 mt-1">{errors.siteTitle.message}</p>
              )}
            </div>

            {/* وصف الموقع */}
            <div>
              <Label htmlFor="siteDescription" className="required">
                وصف الموقع
              </Label>
              <textarea
                id="siteDescription"
                {...register('siteDescription')}
                placeholder="وصف مختصر للموقع يظهر في محركات البحث..."
                className="w-full mt-2 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors min-h-[100px]"
                dir="rtl"
              />
              {errors.siteDescription && (
                <p className="text-sm text-red-600 mt-1">{errors.siteDescription.message}</p>
              )}
            </div>

            {/* ترميز الأحرف */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="charset">
                  ترميز الأحرف
                </Label>
                <Input
                  id="charset"
                  {...register('charset')}
                  placeholder="UTF-8"
                  className="mt-2"
                  dir="ltr"
                />
              </div>

              {/* الفاصل */}
              <div>
                <Label htmlFor="titleSeparator">
                  فاصل العنوان
                </Label>
                <select
                  id="titleSeparator"
                  {...register('titleSeparator')}
                  className="w-full mt-2 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors"
                  dir="rtl"
                >
                  <option value="-">شرطة (-)</option>
                  <option value="|">خط عمودي (|)</option>
                  <option value="•">نقطة (•)</option>
                  <option value="/">شرطة مائلة (/)</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* الشعار والأيقونات */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b">
            الشعار والأيقونات
          </h2>
          <div className="space-y-5">
            {/* شعار الموقع */}
            <div>
              <Label htmlFor="logoUrl">
                شعار الموقع (Logo URL)
              </Label>
              <div className="mt-2 flex gap-2">
                <Input
                  id="logoUrl"
                  {...register('logoUrl')}
                  placeholder="https://example.com/logo.png"
                  dir="ltr"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon"
                  onClick={() => openMediaPicker('logoUrl')}
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              {errors.logoUrl && (
                <p className="text-sm text-red-600 mt-1">{errors.logoUrl.message}</p>
              )}
              {watch('logoUrl') && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <img
                    src={watch('logoUrl') || ''}
                    alt="Logo Preview"
                    className="max-h-16 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>

            {/* أيقونة Favicon */}
            <div>
              <Label htmlFor="faviconUrl">
                أيقونة الموقع المفضلة (Favicon URL)
              </Label>
              <div className="mt-2 flex gap-2">
                <Input
                  id="faviconUrl"
                  {...register('faviconUrl')}
                  placeholder="https://example.com/favicon.ico"
                  dir="ltr"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon"
                  onClick={() => openMediaPicker('faviconUrl')}
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              {errors.faviconUrl && (
                <p className="text-sm text-red-600 mt-1">{errors.faviconUrl.message}</p>
              )}
              {watch('faviconUrl') && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <img
                    src={watch('faviconUrl') || ''}
                    alt="Favicon Preview"
                    className="max-h-8 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>

            {/* الصورة البديلة */}
            <div>
              <Label htmlFor="defaultImageUrl">
                الصورة البديلة (Default Image URL)
              </Label>
              <div className="mt-2 flex gap-2">
                <Input
                  id="defaultImageUrl"
                  {...register('defaultImageUrl')}
                  placeholder="https://example.com/default-image.png"
                  dir="ltr"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon"
                  onClick={() => openMediaPicker('defaultImageUrl')}
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                الصورة التي تظهر عندما لا تتوفر صورة للمقال
              </p>
              {watch('defaultImageUrl') && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <img
                    src={watch('defaultImageUrl') || ''}
                    alt="Default Image Preview"
                    className="max-h-32 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* نص حقوق الملكية */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b">
            حقوق الملكية
          </h2>
          <div className="space-y-5">
            <div>
              <Label htmlFor="copyrightText">
                نص حقوق الملكية (يظهر في الفوتر)
              </Label>
              <Input
                id="copyrightText"
                {...register('copyrightText')}
                placeholder="جميع الحقوق محفوظة © 2025 دعاء أذكاري"
                className="mt-2"
              />
              <p className="text-sm text-gray-500 mt-1">
                يمكنك استخدام <code>:year</code> لعرض السنة الحالية تلقائياً
              </p>
            </div>

            <div>
              <Label htmlFor="madeWithLoveText">
                نص الصُنع بحب (يظهر تحت حقوق الملكية)
              </Label>
              <Input
                id="madeWithLoveText"
                {...register('madeWithLoveText')}
                placeholder="صُنع بـ ❤️ لخدمة الإسلام"
                className="mt-2"
              />
              <p className="text-sm text-gray-500 mt-1">
                نص تحفيزي يظهر أسفل نص حقوق الملكية
              </p>
            </div>
          </div>
        </Card>

        {/* Submit Button (Mobile) */}
        <div className="md:hidden">
          <Button
            type="submit"
            disabled={saving}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 ml-2" />
                حفظ التغييرات
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Media Upload Modal */}
      <MediaUploadModal
        isOpen={mediaPickerOpen}
        onClose={() => {
          setMediaPickerOpen(false)
          setMediaPickerField(null)
        }}
        onUploadComplete={handleMediaUploadComplete}
        acceptedFileTypes="image/*"
        title={
          mediaPickerField === 'logoUrl'
            ? 'رفع شعار الموقع'
            : mediaPickerField === 'faviconUrl'
            ? 'رفع أيقونة الموقع'
            : 'رفع الصورة الافتراضية'
        }
        description="اختر طريقة الرفع المناسبة (محلي أو سحابي)"
      />
    </div>
  )
}

