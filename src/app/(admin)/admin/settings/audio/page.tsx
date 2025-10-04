'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import {
  ArrowRight,
  Save,
  RotateCcw,
  Volume2,
  Layout,
  Eye,
  Filter,
  Search,
  Grid,
  List,
  Play,
  Settings as SettingsIcon,
  Palette,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { AudioSettings, pageLayoutLabels, displayStyleLabels } from '@/types/audio-settings.types'

export default function AudioSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [settings, setSettings] = useState<AudioSettings>({
    pageLayout: 'two-columns',
    displayStyle: 'card',
    showReciterName: true,
    showDuration: true,
    showCategory: true,
    showViewCount: true,
    showDownloadCount: true,
    showDate: false,
    enableLoadMore: true,
    postsPerPage: 12,
    loadMoreButtonText: 'عرض المزيد',
    enableCategoryFilter: true,
    enableSearch: true,
    enableSorting: true,
    autoPlayNext: false,
    showPlaylist: true,
    showWaveform: true,
    cardBackgroundColor: 'from-white to-gray-50',
    hoverColor: 'from-primary to-teal-600',
    pageTitle: 'جميع المقاطع الصوتية',
    pageDescription: 'استمع إلى مجموعة شاملة من الأدعية والأذكار',
    pageKeywords: 'أدعية، أذكار، مقاطع صوتية، قرآن',
    ads: {
      enabled: false,
      publisherId: '',
      headerAd: { enabled: false, code: '' },
      footerAd: { enabled: false, code: '' },
      sidebarAd: { enabled: false, code: '' },
      betweenPostsAd: { enabled: false, code: '', showAfterItems: 6 },
      customAds: []
    }
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/settings?group=audioPage')
      const result = await response.json()

      if (result.success && result.data) {
        // التأكد من وجود ads في الإعدادات، وإضافتها إن لم تكن موجودة
        const fetchedSettings = {
          ...result.data,
          ads: result.data.ads || {
            enabled: false,
            publisherId: '',
            headerAd: { enabled: false, code: '' },
            footerAd: { enabled: false, code: '' },
            sidebarAd: { enabled: false, code: '' },
            betweenPostsAd: { enabled: false, code: '', showAfterItems: 6 },
            customAds: []
          }
        }
        setSettings(fetchedSettings)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      setMessage({ type: 'error', text: 'فشل في تحميل الإعدادات' })
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
        body: JSON.stringify({
          group: 'audioPage',
          data: settings
        })
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ type: 'success', text: 'تم حفظ الإعدادات بنجاح!' })
        // إعادة تحميل الصفحة بعد ثانيتين لتطبيق التغييرات
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        setMessage({ type: 'error', text: result.error || 'فشل في حفظ الإعدادات' })
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      setMessage({ type: 'error', text: 'حدث خطأ أثناء حفظ الإعدادات' })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    if (!confirm('هل أنت متأكد من إعادة تعيين جميع الإعدادات للقيم الافتراضية؟')) {
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group: 'audioPage' })
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ type: 'success', text: 'تم إعادة تعيين الإعدادات بنجاح!' })
        await fetchSettings()
      } else {
        setMessage({ type: 'error', text: result.error || 'فشل في إعادة التعيين' })
      }
    } catch (error) {
      console.error('Error resetting settings:', error)
      setMessage({ type: 'error', text: 'حدث خطأ أثناء إعادة التعيين' })
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
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Volume2 className="h-8 w-8 text-primary" />
              إعدادات المقاطع الصوتية
            </h1>
            <p className="text-gray-600 mt-1">
              تخصيص صفحة جميع المقاطع الصوتية (/listen-all)
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            إعادة تعيين
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-teal-600"
          >
            <Save className="h-4 w-4" />
            {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </Button>
        </div>
      </div>

      {/* Success/Error Message */}
      {message && (
        <Card className={`p-4 ${message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center gap-3">
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
            <p className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {message.text}
            </p>
          </div>
        </Card>
      )}

      {/* Layout Settings */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Layout className="h-5 w-5 text-primary" />
          تخطيط الصفحة
        </h2>

        <div className="space-y-6">
          {/* Page Layout */}
          <div>
            <Label htmlFor="pageLayout">نمط التخطيط (9 خيارات)</Label>
            <Select
              value={settings.pageLayout}
              onValueChange={(value: any) => setSettings({ ...settings, pageLayout: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(pageLayoutLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500 mt-1">
              اختر عدد الأعمدة التي سيتم عرض المقاطع بها
            </p>
          </div>

          {/* Display Style */}
          <div>
            <Label htmlFor="displayStyle">نمط العرض (5 خيارات)</Label>
            <Select
              value={settings.displayStyle}
              onValueChange={(value: any) => setSettings({ ...settings, displayStyle: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(displayStyleLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500 mt-1">
              حدد مستوى التفاصيل المعروضة في كل مقطع
            </p>
          </div>
        </div>
      </Card>

      {/* Display Options */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          خيارات العرض
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>عرض اسم القارئ</Label>
              <p className="text-sm text-gray-500">إظهار اسم قارئ المقطع الصوتي</p>
            </div>
            <Switch
              checked={settings.showReciterName}
              onCheckedChange={(checked) => setSettings({ ...settings, showReciterName: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>عرض المدة الزمنية</Label>
              <p className="text-sm text-gray-500">إظهار مدة المقطع الصوتي</p>
            </div>
            <Switch
              checked={settings.showDuration}
              onCheckedChange={(checked) => setSettings({ ...settings, showDuration: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>عرض الفئة</Label>
              <p className="text-sm text-gray-500">إظهار فئة المقطع</p>
            </div>
            <Switch
              checked={settings.showCategory}
              onCheckedChange={(checked) => setSettings({ ...settings, showCategory: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>عرض عدد المشاهدات</Label>
              <p className="text-sm text-gray-500">إظهار عدد مرات الاستماع</p>
            </div>
            <Switch
              checked={settings.showViewCount}
              onCheckedChange={(checked) => setSettings({ ...settings, showViewCount: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>عرض عدد التحميلات</Label>
              <p className="text-sm text-gray-500">إظهار عدد مرات التحميل</p>
            </div>
            <Switch
              checked={settings.showDownloadCount}
              onCheckedChange={(checked) => setSettings({ ...settings, showDownloadCount: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>عرض تاريخ النشر</Label>
              <p className="text-sm text-gray-500">إظهار تاريخ إضافة المقطع</p>
            </div>
            <Switch
              checked={settings.showDate}
              onCheckedChange={(checked) => setSettings({ ...settings, showDate: checked })}
            />
          </div>
        </div>
      </Card>

      {/* Pagination & Loading */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Grid className="h-5 w-5 text-primary" />
          التنقل والتحميل
        </h2>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>تفعيل زر "عرض المزيد"</Label>
              <p className="text-sm text-gray-500">
                إظهار زر لتحميل المزيد من المقاطع بدلاً من الترقيم
              </p>
            </div>
            <Switch
              checked={settings.enableLoadMore}
              onCheckedChange={(checked) => setSettings({ ...settings, enableLoadMore: checked })}
            />
          </div>

          <div>
            <Label htmlFor="postsPerPage">عدد المقاطع في كل صفحة</Label>
            <Input
              id="postsPerPage"
              type="number"
              min={6}
              max={50}
              value={settings.postsPerPage}
              onChange={(e) => setSettings({ ...settings, postsPerPage: parseInt(e.target.value) || 12 })}
            />
            <p className="text-sm text-gray-500 mt-1">
              من 6 إلى 50 مقطع
            </p>
          </div>

          {settings.enableLoadMore && (
            <div>
              <Label htmlFor="loadMoreButtonText">نص زر "عرض المزيد"</Label>
              <Input
                id="loadMoreButtonText"
                value={settings.loadMoreButtonText}
                onChange={(e) => setSettings({ ...settings, loadMoreButtonText: e.target.value })}
                placeholder="عرض المزيد"
              />
            </div>
          )}
        </div>
      </Card>

      {/* Filtering & Search */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          الفلترة والبحث
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>تفعيل فلتر الفئات</Label>
              <p className="text-sm text-gray-500">السماح بفلترة حسب الفئة</p>
            </div>
            <Switch
              checked={settings.enableCategoryFilter}
              onCheckedChange={(checked) => setSettings({ ...settings, enableCategoryFilter: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>تفعيل البحث</Label>
              <p className="text-sm text-gray-500">إظهار حقل البحث</p>
            </div>
            <Switch
              checked={settings.enableSearch}
              onCheckedChange={(checked) => setSettings({ ...settings, enableSearch: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>تفعيل الترتيب</Label>
              <p className="text-sm text-gray-500">السماح بترتيب النتائج</p>
            </div>
            <Switch
              checked={settings.enableSorting}
              onCheckedChange={(checked) => setSettings({ ...settings, enableSorting: checked })}
            />
          </div>
        </div>
      </Card>

      {/* Audio Player Settings */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Play className="h-5 w-5 text-primary" />
          إعدادات المشغل الصوتي
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>تشغيل تلقائي للمقطع التالي</Label>
              <p className="text-sm text-gray-500">تشغيل المقطع التالي تلقائياً</p>
            </div>
            <Switch
              checked={settings.autoPlayNext}
              onCheckedChange={(checked) => setSettings({ ...settings, autoPlayNext: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>عرض قائمة التشغيل</Label>
              <p className="text-sm text-gray-500">إظهار قائمة المقاطع</p>
            </div>
            <Switch
              checked={settings.showPlaylist}
              onCheckedChange={(checked) => setSettings({ ...settings, showPlaylist: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>عرض الموجات الصوتية</Label>
              <p className="text-sm text-gray-500">عرض Waveform</p>
            </div>
            <Switch
              checked={settings.showWaveform}
              onCheckedChange={(checked) => setSettings({ ...settings, showWaveform: checked })}
            />
          </div>
        </div>
      </Card>

      {/* SEO Settings */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <SettingsIcon className="h-5 w-5 text-primary" />
          إعدادات SEO
        </h2>

        <div className="space-y-6">
          <div>
            <Label htmlFor="pageTitle">عنوان الصفحة</Label>
            <Input
              id="pageTitle"
              value={settings.pageTitle}
              onChange={(e) => setSettings({ ...settings, pageTitle: e.target.value })}
              placeholder="جميع المقاطع الصوتية"
            />
          </div>

          <div>
            <Label htmlFor="pageDescription">وصف الصفحة</Label>
            <Textarea
              id="pageDescription"
              value={settings.pageDescription}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSettings({ ...settings, pageDescription: e.target.value })}
              placeholder="استمع إلى مجموعة شاملة من الأدعية والأذكار"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="pageKeywords">الكلمات المفتاحية</Label>
            <Input
              id="pageKeywords"
              value={settings.pageKeywords}
              onChange={(e) => setSettings({ ...settings, pageKeywords: e.target.value })}
              placeholder="أدعية، أذكار، مقاطع صوتية، قرآن"
            />
            <p className="text-sm text-gray-500 mt-1">
              افصل بين الكلمات بفاصلة
            </p>
          </div>
        </div>
      </Card>

      {/* Ads Settings */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          إعدادات الإعلانات
        </h2>

        <div className="space-y-6">
          {/* Enable Ads */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div>
              <Label className="text-base font-semibold">تفعيل الإعلانات</Label>
              <p className="text-sm text-gray-600 mt-1">
                إظهار إعلانات Google AdSense في صفحة المقاطع الصوتية
              </p>
            </div>
            <Switch
              checked={settings.ads.enabled}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  ads: { ...settings.ads, enabled: checked }
                })
              }
            />
          </div>

          {settings.ads.enabled && (
            <>
              {/* Publisher ID */}
              <div>
                <Label htmlFor="publisherId">معرف الناشر (Publisher ID)</Label>
                <Input
                  id="publisherId"
                  value={settings.ads.publisherId}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      ads: { ...settings.ads, publisherId: e.target.value }
                    })
                  }
                  placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                />
                <p className="text-sm text-gray-500 mt-1">
                  معرف Google AdSense الخاص بك
                </p>
              </div>

              {/* Header Ad */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label className="font-semibold">إعلان الرأس (Header Ad)</Label>
                    <p className="text-sm text-gray-500">يظهر أعلى الصفحة</p>
                  </div>
                  <Switch
                    checked={settings.ads.headerAd.enabled}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        ads: {
                          ...settings.ads,
                          headerAd: { ...settings.ads.headerAd, enabled: checked }
                        }
                      })
                    }
                  />
                </div>
                {settings.ads.headerAd.enabled && (
                  <Textarea
                    value={settings.ads.headerAd.code}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setSettings({
                        ...settings,
                        ads: {
                          ...settings.ads,
                          headerAd: { ...settings.ads.headerAd, code: e.target.value }
                        }
                      })
                    }
                    placeholder="<ins class='adsbygoogle'..."
                    rows={4}
                  />
                )}
              </div>

              {/* Between Posts Ad */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label className="font-semibold">إعلان بين المقاطع</Label>
                    <p className="text-sm text-gray-500">يظهر بين المقاطع الصوتية</p>
                  </div>
                  <Switch
                    checked={settings.ads.betweenPostsAd.enabled}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        ads: {
                          ...settings.ads,
                          betweenPostsAd: { ...settings.ads.betweenPostsAd, enabled: checked }
                        }
                      })
                    }
                  />
                </div>
                {settings.ads.betweenPostsAd.enabled && (
                  <>
                    <div className="mb-4">
                      <Label>إظهار الإعلان بعد كل</Label>
                      <Input
                        type="number"
                        min={1}
                        max={20}
                        value={settings.ads.betweenPostsAd.showAfterItems}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            ads: {
                              ...settings.ads,
                              betweenPostsAd: {
                                ...settings.ads.betweenPostsAd,
                                showAfterItems: parseInt(e.target.value) || 6
                              }
                            }
                          })
                        }
                      />
                      <p className="text-sm text-gray-500 mt-1">مقاطع (من 1 إلى 20)</p>
                    </div>
                    <Textarea
                      value={settings.ads.betweenPostsAd.code}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setSettings({
                          ...settings,
                          ads: {
                            ...settings.ads,
                            betweenPostsAd: { ...settings.ads.betweenPostsAd, code: e.target.value }
                          }
                        })
                      }
                      placeholder="<ins class='adsbygoogle'..."
                      rows={4}
                    />
                  </>
                )}
              </div>

              {/* Footer Ad */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label className="font-semibold">إعلان التذييل (Footer Ad)</Label>
                    <p className="text-sm text-gray-500">يظهر أسفل الصفحة</p>
                  </div>
                  <Switch
                    checked={settings.ads.footerAd.enabled}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        ads: {
                          ...settings.ads,
                          footerAd: { ...settings.ads.footerAd, enabled: checked }
                        }
                      })
                    }
                  />
                </div>
                {settings.ads.footerAd.enabled && (
                  <Textarea
                    value={settings.ads.footerAd.code}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setSettings({
                        ...settings,
                        ads: {
                          ...settings.ads,
                          footerAd: { ...settings.ads.footerAd, code: e.target.value }
                        }
                      })
                    }
                    placeholder="<ins class='adsbygoogle'..."
                    rows={4}
                  />
                )}
              </div>

              {/* Note */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  <strong>ملاحظة:</strong> للحصول على أفضل أداء، استخدم إعلانات Responsive من Google AdSense.
                  تأكد من نسخ كود الإعلان بالكامل من لوحة تحكم AdSense.
                </p>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 sticky bottom-4">
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={saving}
          className="bg-white shadow-lg"
        >
          <RotateCcw className="h-4 w-4 ml-2" />
          إعادة تعيين
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-primary to-teal-600 shadow-lg"
        >
          <Save className="h-4 w-4 ml-2" />
          {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </Button>
      </div>
    </div>
  )
}

