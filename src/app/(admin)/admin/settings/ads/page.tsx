'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Save, ArrowRight, Plus, Trash2, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { AdsSettings, AdsSlot, defaultAdsSettings } from '@/types/ads.types'

export default function AdsSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [settings, setSettings] = useState<AdsSettings>(defaultAdsSettings)
  const [activeTab, setActiveTab] = useState<'home' | 'post' | 'category' | 'tag' | 'search'>('home')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings?group=ads')
      if (res.ok) {
        const result = await res.json()
        if (result.success && result.data) {
          setSettings(result.data as AdsSettings)
        }
      }
    } catch (error) {
      console.error('Error fetching ads settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setMessage(null)

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          group: 'ads', // ✅ تصحيح: استخدام 'group' بدلاً من 'settingKey'
          data: settings // ✅ تصحيح: استخدام 'data' بدلاً من 'settingValue'
        })
      })

      const result = await res.json()

      if (result.success) {
        setMessage({ type: 'success', text: '✅ تم حفظ إعدادات الإعلانات بنجاح' })
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: result.error || '❌ فشل في حفظ الإعدادات' })
      }
    } catch (error) {
      console.error('Error saving ads settings:', error)
      setMessage({ type: 'error', text: '❌ خطأ في الاتصال بالخادم' })
    } finally {
      setSaving(false)
    }
  }

  const addSlot = (page: keyof typeof settings.pages) => {
    const newSlot: AdsSlot = {
      id: `slot-${Date.now()}`,
      position: 'in-content',
      adUnitId: '',
      format: 'auto',
      responsive: true,
      enabled: true,
      orderIndex: settings.pages[page].slots.length
    }

    setSettings(prev => ({
      ...prev,
      pages: {
        ...prev.pages,
        [page]: {
          ...prev.pages[page],
          slots: [...prev.pages[page].slots, newSlot]
        }
      }
    }))
  }

  const updateSlot = (page: keyof typeof settings.pages, slotId: string, updates: Partial<AdsSlot>) => {
    setSettings(prev => ({
      ...prev,
      pages: {
        ...prev.pages,
        [page]: {
          ...prev.pages[page],
          slots: prev.pages[page].slots.map(slot =>
            slot.id === slotId ? { ...slot, ...updates } : slot
          )
        }
      }
    }))
  }

  const deleteSlot = (page: keyof typeof settings.pages, slotId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإعلان؟')) return

    setSettings(prev => ({
      ...prev,
      pages: {
        ...prev.pages,
        [page]: {
          ...prev.pages[page],
          slots: prev.pages[page].slots.filter(slot => slot.id !== slotId)
        }
      }
    }))
  }

  const pageNames = {
    home: 'الصفحة الرئيسية',
    post: 'صفحة المنشور',
    category: 'صفحة التصنيف',
    tag: 'صفحة الوسم',
    search: 'صفحة البحث'
  }

  const positionNames = {
    header: 'أعلى الصفحة (Header)',
    sidebar: 'الشريط الجانبي (Sidebar)',
    'in-content': 'داخل المحتوى (In-Content)',
    footer: 'أسفل الصفحة (Footer)',
    'between-posts': 'بين المنشورات (Between Posts)',
    custom: 'موضع مخصص (Custom)'
  }

  const formatNames = {
    auto: 'تلقائي (Auto)',
    rectangle: 'مستطيل (Rectangle)',
    vertical: 'عمودي (Vertical)',
    horizontal: 'أفقي (Horizontal)',
    fluid: 'مرن (Fluid)'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Link href="/admin/settings" className="hover:text-primary">
              الإعدادات
            </Link>
            <ArrowRight className="h-4 w-4" />
            <span>الإعلانات (AdSense)</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">إعدادات الإعلانات</h1>
          <p className="text-gray-600 mt-2">إدارة إعلانات Google AdSense مع Lazy Loading ذكي</p>
        </div>
        <Button onClick={handleSave} disabled={saving} size="lg">
          <Save className="ml-2 h-5 w-5" />
          {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </Button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {/* الإعدادات العامة */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-6">الإعدادات العامة</h2>
        <div className="space-y-4">
          {/* تفعيل الإعلانات */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <Label className="text-base font-semibold">تفعيل الإعلانات</Label>
              <p className="text-sm text-gray-600 mt-1">تفعيل/تعطيل جميع الإعلانات في الموقع</p>
            </div>
            <button
              type="button"
              onClick={() => setSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                settings.enabled ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  settings.enabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* معرف الناشر */}
          <div>
            <Label htmlFor="googleAdSenseId">معرف الناشر (Publisher ID) *</Label>
            <Input
              id="googleAdSenseId"
              value={settings.googleAdSenseId}
              onChange={(e) => setSettings(prev => ({ ...prev, googleAdSenseId: e.target.value }))}
              placeholder="ca-pub-xxxxxxxxxxxxxxxx"
              dir="ltr"
              className="font-mono"
            />
            <p className="text-sm text-gray-500 mt-1">
              يمكنك العثور عليه في حسابك في Google AdSense
            </p>
          </div>

          {/* Lazy Loading */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <Label className="text-base font-semibold">Lazy Loading للإعلانات</Label>
              <p className="text-sm text-gray-600 mt-1">تحميل الإعلانات عند الحاجة فقط (يحسن الأداء)</p>
            </div>
            <button
              type="button"
              onClick={() => setSettings(prev => ({ ...prev, lazyLoad: !prev.lazyLoad }))}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                settings.lazyLoad ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  settings.lazyLoad ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* عتبة التحميل */}
          {settings.lazyLoad && (
            <div>
              <Label htmlFor="lazyLoadThreshold">عتبة التحميل (بالبكسل)</Label>
              <Input
                id="lazyLoadThreshold"
                type="number"
                value={settings.lazyLoadThreshold}
                onChange={(e) => setSettings(prev => ({ ...prev, lazyLoadThreshold: parseInt(e.target.value) || 200 }))}
                min="0"
                max="1000"
                step="50"
              />
              <p className="text-sm text-gray-500 mt-1">
                يبدأ تحميل الإعلان عندما يكون على بُعد X بكسل من منطقة العرض
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* تبويبات الصفحات */}
      <Card className="p-6">
        <div className="border-b mb-6">
          <div className="flex gap-2 overflow-x-auto">
            {(Object.keys(settings.pages) as Array<keyof typeof settings.pages>).map((page) => (
              <button
                key={page}
                onClick={() => setActiveTab(page)}
                className={`px-4 py-2 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === page
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-600 hover:text-primary'
                }`}
              >
                {pageNames[page]}
              </button>
            ))}
          </div>
        </div>

        {/* محتوى التبويب */}
        <div className="space-y-4">
          {/* تفعيل الصفحة */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <Label className="text-base font-semibold">تفعيل الإعلانات في {pageNames[activeTab]}</Label>
            </div>
            <button
              type="button"
              onClick={() => setSettings(prev => ({
                ...prev,
                pages: {
                  ...prev.pages,
                  [activeTab]: {
                    ...prev.pages[activeTab],
                    enabled: !prev.pages[activeTab].enabled
                  }
                }
              }))}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                settings.pages[activeTab].enabled ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  settings.pages[activeTab].enabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* قائمة الإعلانات */}
          {settings.pages[activeTab].enabled && (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">مواضع الإعلانات</h3>
                <Button onClick={() => addSlot(activeTab)} variant="outline">
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة إعلان
                </Button>
              </div>

              {settings.pages[activeTab].slots.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>لا توجد إعلانات مضافة بعد</p>
                  <Button onClick={() => addSlot(activeTab)} variant="outline" className="mt-4">
                    <Plus className="ml-2 h-4 w-4" />
                    إضافة أول إعلان
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {settings.pages[activeTab].slots.map((slot, index) => (
                    <Card key={slot.id} className="p-4 bg-gray-50">
                      <div className="flex items-start justify-between mb-4">
                        <h4 className="font-semibold">إعلان #{index + 1}</h4>
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateSlot(activeTab, slot.id, { enabled: !slot.enabled })}
                            className="p-2 hover:bg-gray-200 rounded"
                            title={slot.enabled ? 'تعطيل' : 'تفعيل'}
                          >
                            {slot.enabled ? <Eye className="h-4 w-4 text-primary" /> : <EyeOff className="h-4 w-4 text-gray-400" />}
                          </button>
                          <button
                            onClick={() => deleteSlot(activeTab, slot.id)}
                            className="p-2 hover:bg-red-100 rounded text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* الموضع */}
                        <div>
                          <Label>الموضع</Label>
                          <select
                            value={slot.position}
                            onChange={(e) => updateSlot(activeTab, slot.id, { position: e.target.value as any })}
                            className="w-full mt-1 p-2 border rounded-lg"
                          >
                            {Object.entries(positionNames).map(([value, label]) => (
                              <option key={value} value={value}>{label}</option>
                            ))}
                          </select>
                        </div>

                        {/* معرف الوحدة الإعلانية */}
                        <div>
                          <Label>معرف الوحدة الإعلانية (Ad Unit ID)</Label>
                          <Input
                            value={slot.adUnitId}
                            onChange={(e) => updateSlot(activeTab, slot.id, { adUnitId: e.target.value })}
                            placeholder="ca-pub-xxx/xxxxxxx"
                            dir="ltr"
                            className="font-mono"
                          />
                        </div>

                        {/* الشكل */}
                        <div>
                          <Label>الشكل</Label>
                          <select
                            value={slot.format}
                            onChange={(e) => updateSlot(activeTab, slot.id, { format: e.target.value as any })}
                            className="w-full mt-1 p-2 border rounded-lg"
                          >
                            {Object.entries(formatNames).map(([value, label]) => (
                              <option key={value} value={value}>{label}</option>
                            ))}
                          </select>
                        </div>

                        {/* متجاوب */}
                        <div className="flex items-center gap-2 pt-6">
                          <input
                            type="checkbox"
                            id={`responsive-${slot.id}`}
                            checked={slot.responsive}
                            onChange={(e) => updateSlot(activeTab, slot.id, { responsive: e.target.checked })}
                            className="w-4 h-4"
                          />
                          <Label htmlFor={`responsive-${slot.id}`} className="cursor-pointer">
                            إعلان متجاوب (Responsive)
                          </Label>
                        </div>

                        {/* الأبعاد (إذا لم يكن متجاوب) */}
                        {!slot.responsive && (
                          <>
                            <div>
                              <Label>العرض (px)</Label>
                              <Input
                                type="number"
                                value={slot.width || ''}
                                onChange={(e) => updateSlot(activeTab, slot.id, { width: parseInt(e.target.value) || undefined })}
                                placeholder="728"
                              />
                            </div>
                            <div>
                              <Label>الارتفاع (px)</Label>
                              <Input
                                type="number"
                                value={slot.height || ''}
                                onChange={(e) => updateSlot(activeTab, slot.id, { height: parseInt(e.target.value) || undefined })}
                                placeholder="90"
                              />
                            </div>
                          </>
                        )}

                        {/* بين المنشورات */}
                        {slot.position === 'between-posts' && (
                          <div>
                            <Label>إظهار بعد كل X منشور</Label>
                            <Input
                              type="number"
                              value={slot.afterEvery || ''}
                              onChange={(e) => updateSlot(activeTab, slot.id, { afterEvery: parseInt(e.target.value) || undefined })}
                              placeholder="3"
                              min="1"
                            />
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </Card>

      {/* زر الحفظ السفلي */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          <Save className="ml-2 h-5 w-5" />
          {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </Button>
      </div>
    </div>
  )
}

