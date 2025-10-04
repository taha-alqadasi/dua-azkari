'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { ArrowRight, Save, RotateCcw, Search, Upload } from 'lucide-react'
import { WebmasterSettings, AdvancedSeoSettings } from '@/types/settings.types'
import { MediaUploadModal } from '@/components/shared/MediaUploadModal'

export default function SEOSettingsPage() {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showOgImageUploadModal, setShowOgImageUploadModal] = useState(false)
  const [webmasterSettings, setWebmasterSettings] = useState<WebmasterSettings>({
    googleVerification: '',
    yandexVerification: '',
    bingVerification: '',
    baiduVerification: '',
    googleAnalyticsId: '',
    googleTagManagerId: '',
    noindex: false,
    robotsTxt: '',
    adsTxt: ''
  })
  const [seoSettings, setSeoSettings] = useState<AdvancedSeoSettings>({
    enableJsonLd: true,
    enableOpenGraph: true,
    enableTwitterCards: true,
    enableBreadcrumbs: true,
    defaultOgImage: '',
    twitterCardType: 'summary_large_image',
    siteLanguage: 'ar',
    siteRegion: 'SA',
    canonicalUrl: '',
    alternateLanguages: []
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleOgImageUploadComplete = (fileUrl: string) => {
    setSeoSettings({ ...seoSettings, defaultOgImage: fileUrl })
    setShowOgImageUploadModal(false)
  }

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const [webmasterRes, seoRes] = await Promise.all([
        fetch('/api/settings?group=webmaster'),
        fetch('/api/settings?group=advancedSeo')
      ])

      const [webmasterResult, seoResult] = await Promise.all([
        webmasterRes.json(),
        seoRes.json()
      ])

      if (webmasterResult.success) {
        setWebmasterSettings(webmasterResult.data)
      }
      if (seoResult.success) {
        setSeoSettings(seoResult.data)
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
      const responses = await Promise.all([
        fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ group: 'webmaster', data: webmasterSettings })
        }),
        fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ group: 'advancedSeo', data: seoSettings })
        })
      ])

      const results = await Promise.all(responses.map(r => r.json()))

      if (results.every(r => r.success)) {
        setMessage({ type: 'success', text: 'تم حفظ الإعدادات بنجاح' })
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: 'فشل في حفظ بعض الإعدادات' })
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
              SEO وأدوات المشرفين
            </h1>
            <p className="text-gray-600 mt-1">
              إعدادات محركات البحث وأدوات التحليل
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

      {/* Webmaster Tools */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b flex items-center gap-2">
          <Search className="h-5 w-5" />
          أدوات المشرفين
        </h2>
        <div className="space-y-5">
          <div>
            <Label htmlFor="googleVerification">كود التحقق من Google Search Console</Label>
            <Input
              id="googleVerification"
              value={webmasterSettings.googleVerification}
              onChange={(e) => setWebmasterSettings({ ...webmasterSettings, googleVerification: e.target.value })}
              placeholder="google-site-verification=..."
              className="mt-2"
              dir="ltr"
            />
          </div>

          <div>
            <Label htmlFor="yandexVerification">كود التحقق من Yandex Webmaster</Label>
            <Input
              id="yandexVerification"
              value={webmasterSettings.yandexVerification}
              onChange={(e) => setWebmasterSettings({ ...webmasterSettings, yandexVerification: e.target.value })}
              placeholder="yandex-verification=..."
              className="mt-2"
              dir="ltr"
            />
          </div>

          <div>
            <Label htmlFor="bingVerification">كود التحقق من Bing Webmaster</Label>
            <Input
              id="bingVerification"
              value={webmasterSettings.bingVerification}
              onChange={(e) => setWebmasterSettings({ ...webmasterSettings, bingVerification: e.target.value })}
              placeholder="msvalidate.01=..."
              className="mt-2"
              dir="ltr"
            />
          </div>

          <div>
            <Label htmlFor="baiduVerification">كود التحقق من Baidu Webmaster</Label>
            <Input
              id="baiduVerification"
              value={webmasterSettings.baiduVerification}
              onChange={(e) => setWebmasterSettings({ ...webmasterSettings, baiduVerification: e.target.value })}
              placeholder="baidu-site-verification=..."
              className="mt-2"
              dir="ltr"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label htmlFor="googleAnalyticsId">معرف Google Analytics (GA4)</Label>
              <Input
                id="googleAnalyticsId"
                value={webmasterSettings.googleAnalyticsId}
                onChange={(e) => setWebmasterSettings({ ...webmasterSettings, googleAnalyticsId: e.target.value })}
                placeholder="G-XXXXXXXXXX"
                className="mt-2"
                dir="ltr"
              />
            </div>

            <div>
              <Label htmlFor="googleTagManagerId">معرف Google Tag Manager</Label>
              <Input
                id="googleTagManagerId"
                value={webmasterSettings.googleTagManagerId}
                onChange={(e) => setWebmasterSettings({ ...webmasterSettings, googleTagManagerId: e.target.value })}
                placeholder="GTM-XXXXXXX"
                className="mt-2"
                dir="ltr"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="noindex"
              checked={webmasterSettings.noindex}
              onChange={(e) => setWebmasterSettings({ ...webmasterSettings, noindex: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="noindex" className="cursor-pointer">
              منع أرشفة الموقع (noindex) - استخدم هذا الخيار فقط في حالة عدم رغبتك في ظهور الموقع في نتائج البحث
            </Label>
          </div>
        </div>
      </Card>

      {/* Advanced SEO */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b">
          SEO المتقدم
        </h2>
        <div className="space-y-5">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="enableJsonLd"
                checked={seoSettings.enableJsonLd}
                onChange={(e) => setSeoSettings({ ...seoSettings, enableJsonLd: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="enableJsonLd" className="cursor-pointer">
                تفعيل JSON-LD Structured Data
              </Label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="enableOpenGraph"
                checked={seoSettings.enableOpenGraph}
                onChange={(e) => setSeoSettings({ ...seoSettings, enableOpenGraph: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="enableOpenGraph" className="cursor-pointer">
                تفعيل Open Graph Tags (Facebook, LinkedIn)
              </Label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="enableTwitterCards"
                checked={seoSettings.enableTwitterCards}
                onChange={(e) => setSeoSettings({ ...seoSettings, enableTwitterCards: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="enableTwitterCards" className="cursor-pointer">
                تفعيل Twitter Cards
              </Label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="enableBreadcrumbs"
                checked={seoSettings.enableBreadcrumbs}
                onChange={(e) => setSeoSettings({ ...seoSettings, enableBreadcrumbs: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="enableBreadcrumbs" className="cursor-pointer">
                تفعيل Breadcrumbs Schema
              </Label>
            </div>
          </div>

          <div>
            <Label htmlFor="defaultOgImage">الصورة الافتراضية لـ Open Graph</Label>
            <div className="flex gap-2 items-center mt-2">
              <Input
                id="defaultOgImage"
                value={seoSettings.defaultOgImage}
                onChange={(e) => setSeoSettings({ ...seoSettings, defaultOgImage: e.target.value })}
                placeholder="https://example.com/og-image.png"
                dir="ltr"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setShowOgImageUploadModal(true)}
              >
                <Upload className="h-4 w-4" />
              </Button>
            </div>
            {seoSettings.defaultOgImage && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <img
                  src={seoSettings.defaultOgImage}
                  alt="OG Image Preview"
                  className="max-h-32 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="twitterCardType">نوع Twitter Card</Label>
            <select
              id="twitterCardType"
              value={seoSettings.twitterCardType}
              onChange={(e) => setSeoSettings({ ...seoSettings, twitterCardType: e.target.value as any })}
              className="w-full mt-2 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors"
            >
              <option value="summary">Summary</option>
              <option value="summary_large_image">Summary Large Image</option>
              <option value="app">App</option>
              <option value="player">Player</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label htmlFor="siteLanguage">لغة الموقع</Label>
              <Input
                id="siteLanguage"
                value={seoSettings.siteLanguage}
                onChange={(e) => setSeoSettings({ ...seoSettings, siteLanguage: e.target.value })}
                placeholder="ar"
                className="mt-2"
                dir="ltr"
              />
            </div>

            <div>
              <Label htmlFor="siteRegion">المنطقة</Label>
              <Input
                id="siteRegion"
                value={seoSettings.siteRegion}
                onChange={(e) => setSeoSettings({ ...seoSettings, siteRegion: e.target.value })}
                placeholder="SA"
                className="mt-2"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="canonicalUrl">رابط Canonical الأساسي</Label>
            <Input
              id="canonicalUrl"
              value={seoSettings.canonicalUrl}
              onChange={(e) => setSeoSettings({ ...seoSettings, canonicalUrl: e.target.value })}
              placeholder="https://example.com"
              className="mt-2"
              dir="ltr"
            />
          </div>
        </div>
      </Card>

      {/* robots.txt & ads.txt */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b">
          ملفات النصية
        </h2>
        <div className="space-y-5">
          <div>
            <Label htmlFor="robotsTxt">محتوى ملف robots.txt</Label>
            <textarea
              id="robotsTxt"
              value={webmasterSettings.robotsTxt}
              onChange={(e) => setWebmasterSettings({ ...webmasterSettings, robotsTxt: e.target.value })}
              placeholder="User-agent: *&#10;Allow: /"
              className="w-full mt-2 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors min-h-[150px] font-mono text-sm"
              dir="ltr"
            />
            <p className="text-sm text-gray-500 mt-1">
              سيتم حفظ هذا المحتوى في ملف /robots.txt
            </p>
          </div>

          <div>
            <Label htmlFor="adsTxt">محتوى ملف ads.txt</Label>
            <textarea
              id="adsTxt"
              value={webmasterSettings.adsTxt}
              onChange={(e) => setWebmasterSettings({ ...webmasterSettings, adsTxt: e.target.value })}
              placeholder="google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0"
              className="w-full mt-2 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors min-h-[150px] font-mono text-sm"
              dir="ltr"
            />
            <p className="text-sm text-gray-500 mt-1">
              سيتم حفظ هذا المحتوى في ملف /ads.txt
            </p>
          </div>
        </div>
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

      {/* Media Upload Modal */}
      <MediaUploadModal
        isOpen={showOgImageUploadModal}
        onClose={() => setShowOgImageUploadModal(false)}
        onUploadComplete={handleOgImageUploadComplete}
        acceptedFileTypes="image/*"
        title="رفع صورة Open Graph"
        description="اختر طريقة الرفع المناسبة (محلي أو سحابي)"
      />
    </div>
  )
}

