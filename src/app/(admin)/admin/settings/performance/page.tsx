'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { ArrowRight, Save, Zap, CheckCircle } from 'lucide-react'
import { PerformanceSettings } from '@/types/settings.types'

export default function PerformanceSettingsPage() {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [settings, setSettings] = useState<PerformanceSettings>({
    enableCache: true,
    cacheMaxAge: 60,
    lazyLoadImages: true,
    lazyLoadScripts: true,
    lazyLoadAds: true,
    lazyLoadAnalytics: true,
    minifyHtml: true,
    minifyCss: true,
    minifyJs: true,
    enableGzip: true,
    enableBrotli: true
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/settings?group=performance')
      const result = await response.json()

      if (result.success) {
        setSettings(result.data)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      setMessage({ type: 'error', text: 'فشل في جلب الإعدادات' })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group: 'performance', data: settings })
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ type: 'success', text: 'تم حفظ الإعدادات بنجاح' })
        setTimeout(() => setMessage(null), 3000)
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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/settings">
            <Button variant="outline" size="icon">
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              إعدادات الأداء والكاش
            </h1>
            <p className="text-gray-600 mt-1">
              تحسين سرعة الموقع والأداء العام
            </p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-emerald-600 to-teal-600"
        >
          {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </Button>
      </div>

      {message && (
        <Card className={`p-4 ${message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <p className={`${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
            {message.text}
          </p>
        </Card>
      )}

      {/* Cache Settings */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b flex items-center gap-2">
          <Zap className="h-5 w-5" />
          إعدادات الكاش (Cache)
        </h2>
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="enableCache"
              checked={settings.enableCache}
              onChange={(e) => setSettings({ ...settings, enableCache: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="enableCache" className="cursor-pointer flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              تفعيل الكاش (يحسن السرعة بشكل كبير)
            </Label>
          </div>

          {settings.enableCache && (
            <div>
              <Label htmlFor="cacheMaxAge">مدة الكاش (بالثواني)</Label>
              <Input
                id="cacheMaxAge"
                type="number"
                min={0}
                max={3600}
                value={settings.cacheMaxAge}
                onChange={(e) => setSettings({ ...settings, cacheMaxAge: parseInt(e.target.value) || 60 })}
                className="mt-2"
              />
              <p className="text-sm text-gray-500 mt-1">
                القيمة الموصى بها: 60 ثانية (1 دقيقة)
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Lazy Loading */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b">
          التحميل البطيء (Lazy Loading)
        </h2>
        <div className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            التحميل البطيء يؤخر تحميل العناصر حتى يحتاجها المستخدم، مما يحسن سرعة تحميل الصفحة
          </p>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="lazyLoadImages"
              checked={settings.lazyLoadImages}
              onChange={(e) => setSettings({ ...settings, lazyLoadImages: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="lazyLoadImages" className="cursor-pointer">
              تفعيل التحميل البطيء للصور
            </Label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="lazyLoadScripts"
              checked={settings.lazyLoadScripts}
              onChange={(e) => setSettings({ ...settings, lazyLoadScripts: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="lazyLoadScripts" className="cursor-pointer">
              تفعيل التحميل البطيء للسكربتات
            </Label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="lazyLoadAds"
              checked={settings.lazyLoadAds}
              onChange={(e) => setSettings({ ...settings, lazyLoadAds: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="lazyLoadAds" className="cursor-pointer">
              تفعيل التحميل البطيء للإعلانات
            </Label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="lazyLoadAnalytics"
              checked={settings.lazyLoadAnalytics}
              onChange={(e) => setSettings({ ...settings, lazyLoadAnalytics: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="lazyLoadAnalytics" className="cursor-pointer">
              تفعيل التحميل البطيء لأدوات التحليل (Analytics)
            </Label>
          </div>
        </div>
      </Card>

      {/* Minification */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b">
          ضغط الملفات (Minification)
        </h2>
        <div className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            الضغط يقلل حجم الملفات عن طريق إزالة المسافات والأسطر الفارغة
          </p>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="minifyHtml"
              checked={settings.minifyHtml}
              onChange={(e) => setSettings({ ...settings, minifyHtml: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="minifyHtml" className="cursor-pointer">
              ضغط HTML
            </Label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="minifyCss"
              checked={settings.minifyCss}
              onChange={(e) => setSettings({ ...settings, minifyCss: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="minifyCss" className="cursor-pointer">
              ضغط CSS
            </Label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="minifyJs"
              checked={settings.minifyJs}
              onChange={(e) => setSettings({ ...settings, minifyJs: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="minifyJs" className="cursor-pointer">
              ضغط JavaScript
            </Label>
          </div>
        </div>
      </Card>

      {/* Compression */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b">
          ضغط النقل (Transfer Compression)
        </h2>
        <div className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            تقنيات ضغط البيانات أثناء نقلها من السيرفر إلى المتصفح
          </p>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="enableGzip"
              checked={settings.enableGzip}
              onChange={(e) => setSettings({ ...settings, enableGzip: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="enableGzip" className="cursor-pointer">
              تفعيل ضغط Gzip
            </Label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="enableBrotli"
              checked={settings.enableBrotli}
              onChange={(e) => setSettings({ ...settings, enableBrotli: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="enableBrotli" className="cursor-pointer">
              تفعيل ضغط Brotli (أفضل من Gzip)
            </Label>
          </div>
        </div>
      </Card>

      {/* Performance Tips */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-600" />
          نصائح لتحسين الأداء
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
            <span>تفعيل الكاش يقلل الحمل على السيرفر ويحسن السرعة بشكل كبير</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
            <span>التحميل البطيء للصور يقلل وقت تحميل الصفحة الأولية</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
            <span>ضغط الملفات يقلل حجم البيانات المنقولة</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
            <span>Brotli أفضل من Gzip بنسبة 15-25% في ضغط البيانات</span>
          </li>
        </ul>
      </Card>

      <div className="md:hidden">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600"
        >
          {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </Button>
      </div>
    </div>
  )
}

