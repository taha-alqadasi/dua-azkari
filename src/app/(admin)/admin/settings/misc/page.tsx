'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { ArrowRight, Save, Palette } from 'lucide-react'
import { MiscSettings } from '@/types/settings.types'

export default function MiscSettingsPage() {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [settings, setSettings] = useState<MiscSettings>({
    themeColor: '#1e9e94',
    enableStatistics: true,
    scriptVersion: '1.0.0',
    maintenanceMode: false,
    maintenanceMessage: '',
    enableNewsletter: false,
    contactEmail: '',
    contactPhone: ''
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/settings?group=misc')
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
        body: JSON.stringify({ group: 'misc', data: settings })
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
            <h1 className="text-3xl font-bold text-gray-900">إعدادات متنوعة</h1>
            <p className="text-gray-600 mt-1">Theme color، إحصائيات، وإعدادات أخرى</p>
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

      {/* Theme & Appearance */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b flex items-center gap-2">
          <Palette className="h-5 w-5" />
          المظهر واللون
        </h2>
        <div className="space-y-5">
          <div>
            <Label htmlFor="themeColor">لون الموقع الرئيسي (Theme Color)</Label>
            <div className="flex gap-2 mt-2">
              <Input
                type="color"
                value={settings.themeColor}
                onChange={(e) => setSettings({ ...settings, themeColor: e.target.value })}
                className="w-20 h-11 cursor-pointer"
              />
              <Input
                type="text"
                value={settings.themeColor}
                onChange={(e) => setSettings({ ...settings, themeColor: e.target.value })}
                placeholder="#1e9e94"
                className="flex-1"
                dir="ltr"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              اللون الأساسي المستخدم في جميع أنحاء الموقع
            </p>
          </div>
        </div>
      </Card>

      {/* System Settings */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b">إعدادات النظام</h2>
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="enableStatistics"
              checked={settings.enableStatistics}
              onChange={(e) => setSettings({ ...settings, enableStatistics: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="enableStatistics" className="cursor-pointer">
              تفعيل الإحصائيات (عدد المشاهدات، التحميلات، إلخ)
            </Label>
          </div>

          <div>
            <Label htmlFor="scriptVersion">إصدار السكربت</Label>
            <Input
              id="scriptVersion"
              value={settings.scriptVersion}
              onChange={(e) => setSettings({ ...settings, scriptVersion: e.target.value })}
              placeholder="1.0.0"
              className="mt-2"
              dir="ltr"
            />
            <p className="text-sm text-gray-500 mt-1">
              رقم إصدار السكربت للمرجع
            </p>
          </div>
        </div>
      </Card>

      {/* Maintenance Mode */}
      <Card className="p-6 bg-orange-50 border-orange-200">
        <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b border-orange-300">وضع الصيانة</h2>
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="maintenanceMode"
              checked={settings.maintenanceMode}
              onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-600"
            />
            <Label htmlFor="maintenanceMode" className="cursor-pointer">
              تفعيل وضع الصيانة (سيتم إيقاف الموقع مؤقتاً)
            </Label>
          </div>

          {settings.maintenanceMode && (
            <div>
              <Label htmlFor="maintenanceMessage">رسالة الصيانة</Label>
              <textarea
                id="maintenanceMessage"
                value={settings.maintenanceMessage}
                onChange={(e) => setSettings({ ...settings, maintenanceMessage: e.target.value })}
                placeholder="الموقع تحت الصيانة حالياً. سنعود قريباً..."
                className="w-full mt-2 px-4 py-3 border-2 border-orange-200 rounded-xl focus:border-orange-500 focus:outline-none min-h-[100px]"
                dir="rtl"
              />
            </div>
          )}
        </div>
      </Card>

      {/* Contact Settings */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b">معلومات الاتصال</h2>
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="enableNewsletter"
              checked={settings.enableNewsletter}
              onChange={(e) => setSettings({ ...settings, enableNewsletter: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="enableNewsletter" className="cursor-pointer">
              تفعيل النشرة البريدية
            </Label>
          </div>

          <div>
            <Label htmlFor="contactEmail">البريد الإلكتروني للتواصل</Label>
            <Input
              id="contactEmail"
              type="email"
              value={settings.contactEmail}
              onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
              placeholder="info@example.com"
              className="mt-2"
              dir="ltr"
            />
          </div>

          <div>
            <Label htmlFor="contactPhone">رقم الهاتف للتواصل</Label>
            <Input
              id="contactPhone"
              type="tel"
              value={settings.contactPhone}
              onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
              placeholder="+966500000000"
              className="mt-2"
              dir="ltr"
            />
          </div>
        </div>
      </Card>
    </div>
  )
}

