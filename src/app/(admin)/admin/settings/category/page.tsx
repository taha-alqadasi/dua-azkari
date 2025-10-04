'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { ArrowRight, Save, Plus, Trash2 } from 'lucide-react'
import { CategoryPageSettings } from '@/types/settings.types'

export default function CategoryPageSettingsPage() {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [settings, setSettings] = useState<CategoryPageSettings>({
    postsPerPage: 12,
    showDescription: true,
    showPostCount: true,
    ads: {
      enabled: false,
      publisherId: '',
      headerAd: { enabled: false, code: '' },
      footerAd: { enabled: false, code: '' },
      sidebarAd: { enabled: false, code: '' },
      customAds: []
    }
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/settings?group=categoryPage')
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
        body: JSON.stringify({ group: 'categoryPage', data: settings })
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

  const addCustomAd = () => {
    setSettings({
      ...settings,
      ads: {
        ...settings.ads,
        customAds: [
          ...settings.ads.customAds,
          {
            id: `ad-${Date.now()}`,
            name: '',
            position: '',
            code: '',
            enabled: true
          }
        ]
      }
    })
  }

  const deleteCustomAd = (index: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإعلان؟')) return

    setSettings({
      ...settings,
      ads: {
        ...settings.ads,
        customAds: settings.ads.customAds.filter((_, i) => i !== index)
      }
    })
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
            <h1 className="text-3xl font-bold text-gray-900">إعدادات صفحة الفئة</h1>
            <p className="text-gray-600 mt-1">تخصيص عرض صفحات الفئات</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-emerald-600 to-teal-600">
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

      {/* Display Options */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b">خيارات العرض</h2>
        <div className="space-y-5">
          <div>
            <Label htmlFor="postsPerPage">عدد النتائج في الصفحة</Label>
            <Input
              id="postsPerPage"
              type="number"
              min={6}
              max={50}
              value={settings.postsPerPage}
              onChange={(e) => setSettings({ ...settings, postsPerPage: parseInt(e.target.value) || 12 })}
              className="mt-2"
            />
            <p className="text-sm text-gray-500 mt-1">القيمة الموصى بها: 12 مقال</p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="showDescription"
              checked={settings.showDescription}
              onChange={(e) => setSettings({ ...settings, showDescription: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="showDescription" className="cursor-pointer">عرض وصف الفئة</Label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="showPostCount"
              checked={settings.showPostCount}
              onChange={(e) => setSettings({ ...settings, showPostCount: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="showPostCount" className="cursor-pointer">عرض عدد المقالات</Label>
          </div>
        </div>
      </Card>

      {/* Ads Section - Same as post page */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b">الإعلانات</h2>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="adsEnabled"
              checked={settings.ads.enabled}
              onChange={(e) => setSettings({ ...settings, ads: { ...settings.ads, enabled: e.target.checked } })}
              className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="adsEnabled" className="cursor-pointer">تفعيل الإعلانات</Label>
          </div>

          {settings.ads.enabled && (
            <>
              <div>
                <Label htmlFor="publisherId">حساب الناشر</Label>
                <Input
                  id="publisherId"
                  value={settings.ads.publisherId}
                  onChange={(e) => setSettings({ ...settings, ads: { ...settings.ads, publisherId: e.target.value } })}
                  placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                  className="mt-2"
                  dir="ltr"
                />
              </div>

              <div className="border-2 border-gray-100 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    id="headerAdEnabled"
                    checked={settings.ads.headerAd.enabled}
                    onChange={(e) => setSettings({
                      ...settings,
                      ads: { ...settings.ads, headerAd: { ...settings.ads.headerAd, enabled: e.target.checked } }
                    })}
                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="headerAdEnabled" className="cursor-pointer font-bold">إعلان الهيدر</Label>
                </div>
                {settings.ads.headerAd.enabled && (
                  <textarea
                    value={settings.ads.headerAd.code}
                    onChange={(e) => setSettings({
                      ...settings,
                      ads: { ...settings.ads, headerAd: { ...settings.ads.headerAd, code: e.target.value } }
                    })}
                    placeholder="كود إعلان الهيدر..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none min-h-[100px]"
                    dir="ltr"
                  />
                )}
              </div>

              <div className="border-2 border-gray-100 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    id="sidebarAdEnabled"
                    checked={settings.ads.sidebarAd.enabled}
                    onChange={(e) => setSettings({
                      ...settings,
                      ads: { ...settings.ads, sidebarAd: { ...settings.ads.sidebarAd, enabled: e.target.checked } }
                    })}
                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="sidebarAdEnabled" className="cursor-pointer font-bold">إعلان القائمة الجانبية</Label>
                </div>
                {settings.ads.sidebarAd.enabled && (
                  <textarea
                    value={settings.ads.sidebarAd.code}
                    onChange={(e) => setSettings({
                      ...settings,
                      ads: { ...settings.ads, sidebarAd: { ...settings.ads.sidebarAd, code: e.target.value } }
                    })}
                    placeholder="كود إعلان القائمة الجانبية..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none min-h-[100px]"
                    dir="ltr"
                  />
                )}
              </div>

              <div className="border-2 border-primary/10 rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">إعلانات مخصصة</h3>
                  <Button type="button" onClick={addCustomAd} size="sm" variant="outline">
                    <Plus className="h-4 w-4 ml-1" />
                    إضافة إعلان
                  </Button>
                </div>

                {settings.ads.customAds.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">لم يتم إضافة إعلانات مخصصة</p>
                ) : (
                  <div className="space-y-4">
                    {settings.ads.customAds.map((ad, index) => (
                      <Card key={ad.id} className="p-4 bg-gray-50">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Input
                              value={ad.name}
                              onChange={(e) => {
                                const updated = [...settings.ads.customAds]
                                updated[index].name = e.target.value
                                setSettings({ ...settings, ads: { ...settings.ads, customAds: updated } })
                              }}
                              placeholder="اسم الإعلان"
                              className="flex-1 ml-2"
                            />
                            <Button type="button" variant="outline" size="icon" onClick={() => deleteCustomAd(index)}>
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                          <Input
                            value={ad.position}
                            onChange={(e) => {
                              const updated = [...settings.ads.customAds]
                              updated[index].position = e.target.value
                              setSettings({ ...settings, ads: { ...settings.ads, customAds: updated } })
                            }}
                            placeholder="الموقع"
                          />
                          <textarea
                            value={ad.code}
                            onChange={(e) => {
                              const updated = [...settings.ads.customAds]
                              updated[index].code = e.target.value
                              setSettings({ ...settings, ads: { ...settings.ads, customAds: updated } })
                            }}
                            placeholder="كود الإعلان..."
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none min-h-[80px]"
                            dir="ltr"
                          />
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}

